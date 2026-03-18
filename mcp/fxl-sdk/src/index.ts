// ============================================================
// FXL SDK MCP Server — Cloudflare Worker entry point
// Implements MCP Streamable HTTP transport with read/write/meta tools
// ============================================================

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { z } from 'zod';
import { createSupabaseClient } from './supabase.js';
import { getStandards, getLearnings, getPitfalls, getChecklist, searchKnowledge } from './tools/read.js';
import { addLearning, addPitfall, promoteToStandard, registerProject } from './tools/write.js';
import { getSdkStatus, getProjectConfig } from './tools/meta.js';
import type { Env } from './types.js';

function createMcpServer(env: Env): McpServer {
  const server = new McpServer(
    {
      name: 'fxl-sdk',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  const db = createSupabaseClient(env);

  // ============================================================
  // READ tools
  // ============================================================

  server.tool(
    'get_standards',
    'Get SDK standards (stack rules, code conventions, etc). Optionally filter by category.',
    { category: z.string().optional().describe('Filter by category (e.g. "stack", "security", "database")') },
    async ({ category }) => {
      const standards = await getStandards(db, category);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(standards, null, 2) }],
      };
    },
  );

  server.tool(
    'get_learnings',
    'Get learnings captured from across projects. Optionally filter by category.',
    { category: z.string().optional().describe('Filter by category') },
    async ({ category }) => {
      const learnings = await getLearnings(db, category);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(learnings, null, 2) }],
      };
    },
  );

  server.tool(
    'get_pitfalls',
    'Get known pitfalls to avoid. Optionally filter by category.',
    { category: z.string().optional().describe('Filter by category') },
    async ({ category }) => {
      const pitfalls = await getPitfalls(db, category);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(pitfalls, null, 2) }],
      };
    },
  );

  server.tool(
    'get_checklist',
    'Get a specific checklist by name (e.g. "security", "structure", "typescript", "rls", "contract").',
    { name: z.string().describe('Checklist name or keyword to search for') },
    async ({ name }) => {
      const items = await getChecklist(db, name);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(items, null, 2) }],
      };
    },
  );

  server.tool(
    'search_knowledge',
    'Full-text search across all SDK knowledge (standards, learnings, pitfalls). Uses PostgreSQL text search with Portuguese config.',
    { query: z.string().describe('Search query text') },
    async ({ query }) => {
      const results = await searchKnowledge(db, query);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }],
      };
    },
  );

  // ============================================================
  // WRITE tools
  // ============================================================

  server.tool(
    'add_learning',
    'Record a new learning from a project. Learnings can later be promoted to standards.',
    {
      rule: z.string().describe('Short description of the learning'),
      context: z.string().describe('Detailed context: when/why this was learned'),
      category: z.string().describe('Category (e.g. "api", "database", "security", "frontend")'),
      source_repo: z.string().optional().describe('Repository where this was learned (e.g. "beachhouse-app")'),
      tags: z.array(z.string()).optional().describe('Cross-cutting tags (e.g. ["error-handling", "api"])'),
    },
    async ({ rule, context, category, source_repo, tags }) => {
      const learning = await addLearning(db, { rule, context, category, source_repo, tags });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(learning, null, 2) }],
      };
    },
  );

  server.tool(
    'add_pitfall',
    'Record a new pitfall (something to avoid). Helps prevent repeating mistakes across projects.',
    {
      rule: z.string().describe('What NOT to do'),
      context: z.string().describe('Why this is a problem, with details'),
      category: z.string().describe('Category (e.g. "api", "database", "security", "frontend")'),
      source_repo: z.string().optional().describe('Repository where this was discovered'),
      tags: z.array(z.string()).optional().describe('Cross-cutting tags'),
      severity: z.enum(['low', 'medium', 'high']).optional().describe('Severity level (default: medium)'),
    },
    async ({ rule, context, category, source_repo, tags, severity }) => {
      const pitfall = await addPitfall(db, { rule, context, category, source_repo, tags, severity });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(pitfall, null, 2) }],
      };
    },
  );

  server.tool(
    'promote_to_standard',
    'Promote a validated learning to a permanent SDK standard. Use when a learning has been confirmed across 2+ projects.',
    {
      learning_id: z.string().describe('UUID of the learning to promote'),
      details: z.string().optional().describe('Override details for the standard (defaults to learning context)'),
      examples: z.string().optional().describe('Code examples or usage patterns'),
    },
    async ({ learning_id, details, examples }) => {
      const standard = await promoteToStandard(db, { learning_id, details, examples });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(standard, null, 2) }],
      };
    },
  );

  server.tool(
    'register_project',
    'Register a new spoke project in the SDK knowledge base, or update an existing one. Called during scaffold to track all FXL projects.',
    {
      slug: z.string().describe('Project slug (e.g. "beachhouse")'),
      name: z.string().describe('Human-readable project name (e.g. "Beach House App")'),
      stack_choices: z
        .record(z.string(), z.string())
        .describe('Stack choices (e.g. { "platform": "web", "framework": "vite", "database": "supabase" })'),
    },
    async ({ slug, name, stack_choices }) => {
      const project = await registerProject(db, { slug, name, stack_choices });
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(project, null, 2) }],
      };
    },
  );

  // ============================================================
  // META tools
  // ============================================================

  server.tool(
    'get_sdk_status',
    'Get SDK knowledge base status: version, table counts, last update timestamp.',
    async () => {
      const status = await getSdkStatus(db);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(status, null, 2) }],
      };
    },
  );

  server.tool(
    'get_project_config',
    'Get project configuration by slug. Returns stack choices and metadata for a specific project.',
    { slug: z.string().describe('Project slug (e.g. "beachhouse")') },
    async ({ slug }) => {
      const config = await getProjectConfig(db, slug);
      if (!config) {
        return {
          content: [{ type: 'text' as const, text: `Project not found: ${slug}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(config, null, 2) }],
      };
    },
  );

  return server;
}

// ============================================================
// Auth middleware
// ============================================================

function validateAuth(request: Request, env: Env): boolean {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return false;

  return token === env.API_KEY;
}

function isWriteRequest(body: string): boolean {
  try {
    const parsed = JSON.parse(body) as { method?: string } | Array<{ method?: string }>;
    const messages = Array.isArray(parsed) ? parsed : [parsed];
    const writeTools = ['add_learning', 'add_pitfall', 'promote_to_standard', 'register_project'];

    for (const msg of messages) {
      if (msg.method === 'tools/call') {
        // Check if the tool name is a write tool
        // The params.name field contains the tool name
        const params = (msg as Record<string, unknown>).params as { name?: string } | undefined;
        if (params?.name && writeTools.includes(params.name)) {
          return true;
        }
      }
    }
  } catch {
    // Parse error — not a write request
  }
  return false;
}

// ============================================================
// CORS headers
// ============================================================

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id',
};

function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    newHeaders.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// ============================================================
// Cloudflare Worker export
// ============================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: 'fxl-sdk-mcp', version: '1.0.0' }), {
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    // Only handle /mcp path
    if (url.pathname !== '/mcp') {
      return new Response('Not Found', { status: 404, headers: CORS_HEADERS });
    }

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // Auth check for write operations
    if (request.method === 'POST') {
      // Clone the request to read body for auth check without consuming it
      const bodyText = await request.clone().text();

      if (isWriteRequest(bodyText)) {
        if (!validateAuth(request, env)) {
          return new Response(
            JSON.stringify({ error: 'Unauthorized: Bearer token required for write operations' }),
            { status: 401, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } },
          );
        }
      }
    }

    // Create MCP server and transport for each request (stateless mode)
    const mcpServer = createMcpServer(env);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
      enableJsonResponse: true,
    });

    await mcpServer.connect(transport);

    const response = await transport.handleRequest(request);
    return addCorsHeaders(response);
  },
} satisfies ExportedHandler<Env>;
