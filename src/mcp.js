// ============================================
// MCP — SuperProfile MCP Client
// ============================================

const MCP_ENDPOINT = 'https://mcp.superprofile.bio/mcp';

let mcpInitialized = false;
let availableTools = [];

/**
 * Initialize the MCP connection
 * MCP uses JSON-RPC 2.0 protocol
 */
export async function initMCP() {
  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'triggerly',
            version: '1.0.0'
          }
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      mcpInitialized = true;
      console.log('MCP initialized:', data);
      // List available tools
      await listTools();
      return data;
    }
  } catch (e) {
    console.log('MCP init (will use fallback):', e.message);
  }
  return null;
}

/**
 * List available MCP tools
 */
export async function listTools() {
  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      })
    });

    if (response.ok) {
      const data = await response.json();
      availableTools = data.result?.tools || [];
      console.log('MCP tools available:', availableTools.length);
      return availableTools;
    }
  } catch (e) {
    console.log('MCP list tools:', e.message);
  }
  return [];
}

/**
 * Call an MCP tool
 */
export async function callTool(toolName, args = {}) {
  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.result || data;
    }
  } catch (e) {
    console.log(`MCP call ${toolName}:`, e.message);
  }
  return null;
}

/**
 * Get SuperProfile products via MCP
 */
export async function getProducts() {
  const result = await callTool('get_products', {});
  if (result?.content) {
    try {
      const text = result.content.find(c => c.type === 'text');
      return text ? JSON.parse(text.text) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Get SuperProfile content/links via MCP
 */
export async function getContent() {
  const result = await callTool('get_content', {});
  if (result?.content) {
    try {
      const text = result.content.find(c => c.type === 'text');
      return text ? JSON.parse(text.text) : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Add product to content via MCP
 */
export async function addProductToContent(productId, contentId) {
  return await callTool('add_product_to_content', {
    product_id: productId,
    content_id: contentId
  });
}

/**
 * Get analytics data via MCP
 */
export async function getAnalytics(options = {}) {
  return await callTool('get_analytics', options);
}

export function getAvailableTools() {
  return availableTools;
}

export function isMCPReady() {
  return mcpInitialized;
}
