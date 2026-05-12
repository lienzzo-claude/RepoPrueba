#!/usr/bin/env node
import "dotenv/config"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("[postgres-mcp] DATABASE_URL is not set")
  process.exit(1)
}

const pool = new pg.Pool({ connectionString, max: 4 })

const server = new Server(
  { name: "postgres-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } },
)

const tools = [
  {
    name: "query",
    description:
      "Run an arbitrary SQL statement (read or write) against the configured Postgres database. Returns rows for SELECT/RETURNING queries and rowCount otherwise. Use parameterised queries via $1, $2, … with the `params` array to avoid SQL injection.",
    inputSchema: {
      type: "object",
      properties: {
        sql: { type: "string", description: "The SQL statement to execute." },
        params: {
          type: "array",
          description: "Optional positional parameters for $1, $2, …",
          items: {},
        },
      },
      required: ["sql"],
    },
  },
  {
    name: "list_tables",
    description:
      "List user-visible tables (and their schemas) in the database. Useful to discover what exists before querying.",
    inputSchema: {
      type: "object",
      properties: {
        schema: {
          type: "string",
          description:
            "Optional schema name to filter by. Defaults to all non-system schemas.",
        },
      },
    },
  },
  {
    name: "describe_table",
    description:
      "Show the columns, types, nullability, and defaults for a given table.",
    inputSchema: {
      type: "object",
      properties: {
        table: { type: "string" },
        schema: { type: "string", description: "Defaults to 'public'." },
      },
      required: ["table"],
    },
  },
]

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }))

function asTextResult(value) {
  return {
    content: [
      {
        type: "text",
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  }
}

function asErrorResult(err) {
  const message = err instanceof Error ? err.message : String(err)
  return {
    isError: true,
    content: [{ type: "text", text: message }],
  }
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params

  try {
    if (name === "query") {
      const result = await pool.query(args.sql, args.params ?? [])
      return asTextResult({
        command: result.command,
        rowCount: result.rowCount,
        rows: result.rows,
      })
    }

    if (name === "list_tables") {
      const params = []
      let where = `table_schema NOT IN ('pg_catalog', 'information_schema')`
      if (args.schema) {
        params.push(args.schema)
        where = `table_schema = $1`
      }
      const result = await pool.query(
        `SELECT table_schema, table_name, table_type
         FROM information_schema.tables
         WHERE ${where}
         ORDER BY table_schema, table_name`,
        params,
      )
      return asTextResult(result.rows)
    }

    if (name === "describe_table") {
      const schema = args.schema ?? "public"
      const result = await pool.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_schema = $1 AND table_name = $2
         ORDER BY ordinal_position`,
        [schema, args.table],
      )
      return asTextResult(result.rows)
    }

    return asErrorResult(`Unknown tool: ${name}`)
  } catch (err) {
    return asErrorResult(err)
  }
})

const transport = new StdioServerTransport()
await server.connect(transport)
console.error("[postgres-mcp] ready on stdio")
