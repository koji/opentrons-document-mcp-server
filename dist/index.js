#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs/promises";
import * as path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCS_DIR = path.join(__dirname, "..", "docs");
// doc categories
const AVAILABLE_CATEGORIES = [
    "pd-manual",
    "stacker-manual",
    "flex-manual",
    "hepa-uv",
    "shared",
    "thermocycler-manual",
    "dev_setup",
];
const server = new Server({
    name: "opentrons-document-mcp-server",
    version: "0.1.0",
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "fetch_general",
                description: "When answering questions about Opentrons product(Flex, OT-2, Python API, Desktop application, touchscreen application, and Protocol Designer), start by using this tool to return the contents of docs/general.md. This file contains an overview and general information about Opentrons products.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: [],
                },
            },
            {
                name: "list_documents",
                description: "This tool returns the list of available document files in the docs directory. If you haven't yet retrieved the general information with fetch_general, please run fetch_general first.",
                inputSchema: {
                    type: "object",
                    properties: {
                        category: {
                            type: "string",
                            description: "Search categories: pd-manual, stacker-manual, flex-manual, hepa-uv, shared, thermocycler-manual, dev_setup. If no category is specified, all categories will be targeted",
                            enum: [
                                "pd-manual",
                                "stacker-manual",
                                "flex-manual",
                                "hepa-uv",
                                "shared",
                                "thermocycler-manual",
                                "dev_setup",
                            ],
                        },
                    },
                    required: [],
                },
            },
            {
                name: "search_document",
                description: "This tool returns the content of the specified document file. If you haven't yet retrieved the general information with fetch_general, please run fetch_general first.",
                inputSchema: {
                    type: "object",
                    properties: {
                        filename: {
                            type: "string",
                            description: "Search for a file name (including the file extension).",
                        },
                        category: {
                            type: "string",
                            description: "Search categories: pd-manual, stacker-manual, flex-manual, hepa-uv, shared, thermocycler-manual, dev_setup. If no category is specified, all categories will be targeted",
                            enum: [
                                "pd-manual",
                                "stacker-manual",
                                "flex-manual",
                                "hepa-uv",
                                "shared",
                                "thermocycler-manual",
                                "dev_setup",
                            ],
                        },
                    },
                    required: ["filename"],
                },
            },
        ],
    };
});
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        if (request.params.name === "list_documents") {
            const { category } = request.params.arguments;
            let result = [];
            if (category) {
                const categoryDir = path.join(DOCS_DIR, category);
                try {
                    const files = await fs.readdir(categoryDir);
                    const mdFiles = files.filter((file) => file.endsWith(".md"));
                    result.push({ category, files: mdFiles });
                }
                catch (error) {
                    if (error.code === "ENOENT") {
                        throw new McpError(ErrorCode.InvalidParams, `not found in category "${category}"`);
                    }
                    throw error;
                }
            }
            else {
                for (const cat of AVAILABLE_CATEGORIES) {
                    const categoryDir = path.join(DOCS_DIR, cat);
                    try {
                        const files = await fs.readdir(categoryDir);
                        const mdFiles = files.filter((file) => file.endsWith(".md"));
                        if (mdFiles.length > 0) {
                            result.push({ category: cat, files: mdFiles });
                        }
                    }
                    catch (error) {
                        if (error.code !== "ENOENT") {
                            throw error;
                        }
                    }
                }
            }
            let responseText = JSON.stringify({
                categories: result,
                totalFiles: result.reduce((sum, cat) => sum + cat.files.length, 0),
            }, null, 2);
            return {
                content: [
                    {
                        type: "text",
                        text: responseText,
                    },
                ],
            };
        }
        if (request.params.name === "search_document") {
            const { filename, category } = request.params.arguments;
            if (!filename) {
                throw new McpError(ErrorCode.InvalidParams, "Please specify the filename.");
            }
            let filePath = null;
            let foundCategory = null;
            if (category) {
                filePath = path.join(DOCS_DIR, category, filename);
                foundCategory = category;
            }
            else {
                for (const cat of AVAILABLE_CATEGORIES) {
                    const candidatePath = path.join(DOCS_DIR, cat, filename);
                    try {
                        await fs.access(candidatePath);
                        filePath = candidatePath;
                        foundCategory = cat;
                        break;
                    }
                    catch {
                        // If the file does not exist, move on to the next category
                    }
                }
            }
            if (!filePath || !foundCategory) {
                throw new McpError(ErrorCode.InvalidParams, category
                    ? `File "${filename}" not found in category "${category}"`
                    : `File "${filename}" not found`);
            }
            try {
                const content = await fs.readFile(filePath, "utf-8");
                let responseText = `category: ${foundCategory}\nfile: ${filename}\n\n${content}`;
                return {
                    content: [
                        {
                            type: "text",
                            text: responseText,
                        },
                    ],
                };
            }
            catch (error) {
                if (error.code === "ENOENT") {
                    throw new McpError(ErrorCode.InvalidParams, `not found "${filename}"`);
                }
                throw error;
            }
        }
        if (request.params.name === "fetch_general") {
            const generalMdPath = path.join(DOCS_DIR, "general.md");
            try {
                const content = await fs.readFile(generalMdPath, "utf-8");
                return {
                    content: [
                        {
                            type: "text",
                            text: content,
                        },
                    ],
                };
            }
            catch (error) {
                if (error.code === "ENOENT") {
                    throw new McpError(ErrorCode.InvalidParams, `not found "general.md"`);
                }
                throw error;
            }
        }
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
    }
    catch (error) {
        if (error instanceof McpError) {
            throw error;
        }
        throw new McpError(ErrorCode.InternalError, `An unexpected error occurred: ${error}`);
    }
});
async function main() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error("MCP Server connected successfully");
    }
    catch (error) {
        console.error("Failed to start MCP server:", error);
        process.exit(1);
    }
}
// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled rejection at:", promise, "reason:", reason);
    process.exit(1);
});
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map