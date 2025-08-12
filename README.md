# opentrons-document-mcp-server

## support

- Opentrons API
- Opentrons Flex
- Opentrons OT-2
- Opentrons Protocol Designer

this MCP server uses docs from [opentrons/opentrons/docs](https://github.com/opentrons/opentrons/tree/edge/docs)

## how to use

MCP clients can be configured to use this server by adding the following to their `mcpServers` section:

- Claude Desktop app
- Cursor✅
- VSCode
- Roo Code
- Windsurf
- Warp✅

```shell
{
  "mcpServers": {
    "opentrons": {
      "command": "npx",
      "args": [
        "-y",
        "opentrons-mcp-server@latest"
      ]
    }
  }
}
```

<img width="575" height="1842" alt="Image" src="https://github.com/user-attachments/assets/bb845573-afb8-4dc8-8521-a993ab2732fe" />
