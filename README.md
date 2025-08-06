# opentrons-document-mcp-server

## support

- Opentrons API
- Opentrons Flex
- Opentrons OT-2
- Opentrons Protocol Designer

this MCP server uses docs from [opentrons/opentrons/docs](https://github.com/opentrons/opentrons/tree/edge/docs)

## how to use

```shell
{
  "mcpServers": {
    "opentrons": {
      "command": "npx",
      "args": [
        "-y",
        "opentrons-mcp-server@latest",
      ]
    }
  }
}
```
