// MCP service - for Bing search and information enrichment

interface MCPConfig {
  mcpUrl: string;
}

class MCPService {
  private config: MCPConfig;

  constructor(config: MCPConfig) {
    this.config = config;
  }

  // Initialize MCP service
  async initialize(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.mcpUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('MCP service initialization failed:', error);
      return false;
    }
  }

  // Search using Bing
  async searchBing(query: string): Promise<string> {
    try {
      const response = await fetch(`${this.config.mcpUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          max_results: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      return data.results || '';
    } catch (error) {
      console.error('Bing search failed:', error);
      return '';
    }
  }

  // Enrich information using MCP
  async enrichInformation(title: string): Promise<string> {
    const systemPrompt = "Determine if Bing search engine needs to be called to supplement information, if needed, then call it";
    const userPrompt = `Please search for relevant information about "${title}", including industry background, target audience, related trends, etc., to help generate richer title variants.`;

    try {
      // Tool call
      const searchResults = await this.searchBing(title);
      if (searchResults) {
        return `Based on search results: ${searchResults}`;
      }
      return '';
    } catch (error) {
      console.error('Information enrichment failed:', error);
      return '';
    }
  }
}

export default MCPService; 