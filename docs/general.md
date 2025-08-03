# About Opentrons products

Opentrons offers some products. There are two types of robots. One is the latest liquid handling robot, Flex and the other is OT-2.
For Flex, and OT-2, Opentrons offers the Desktop application for both of them and touchscreen application for Flex. The robot is controlled by a protocol which is a python or a JSON file.
Opentrons offers a no code tool, Protocol Designer that allows users to create a protocol file with GUI.

## About API

Opentrons develops Python API to control robots.
The latest API version is 2.24 and it supports Flex and OT-2. For Flex, the oldest API version is 2.15

## About `opentrons-document-mcp-server`

Introducing how to use the MCP server tools:

1. First, use fetch_general once to retrieve overall information.
2. Next, use list_documents to get a list of accessible documents.
3. Finally, use search_document to locate the documents you need.
