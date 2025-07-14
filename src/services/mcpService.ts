
import {
  prepareTools,
  callOpenAIFunctionAndProcessToolCalls
} from 'mcp-uiux/dist/MCPClient.js';

export class MCPService {
  private static instance: MCPService;
  private mcpClient: any;
  private tools: any[];
  private toolsFunctionCall: any[];
  private systemPrompts: any[];

  private constructor() {}

  public static getInstance(): MCPService {
    if (!MCPService.instance) {
      MCPService.instance = new MCPService();
    }
    return MCPService.instance;
  }

  public getTools(): any[] {  
    return this.tools;
  }

  public async initialize(mcpUrl?: string): Promise<void> {
    // console.log(mcpUrl);
    try {
      const url = mcpUrl || "http://localhost:2035";
      const result = await prepareTools(url);
      const { mcpClient, tools, toolsFunctionCall, systemPrompts } = result as Record<string, unknown>;
      
      this.mcpClient = mcpClient;
      this.tools = tools as unknown[];
      // console.log(this.tools);
      this.toolsFunctionCall = toolsFunctionCall as unknown[];
      this.systemPrompts = systemPrompts as unknown[];
      return true;
    } catch (error) {
      console.error('MCP服务初始化失败:', error);
      throw error;
    }
  }

  public async searchAndEnrich(title: string, apiKey: string, apiUrl: string, model: string, mcpUrl?: string): Promise<string> {
    try {
      if (!this.mcpClient) {
        await this.initialize(mcpUrl);
      }

      const knowledgeTools = this.toolsFunctionCall.filter((tool:any) => {
        const functionName = tool?.function?.name as string;
        return ['browser.browser_search'].includes(functionName);
      });

      const systemPrompt = "判断是否需要调用bing搜索引擎补充信息，如果需要，则调用";
      
      // 工具调用
      const toolsResult = await callOpenAIFunctionAndProcessToolCalls(
        systemPrompt,
        `请搜索关于"${title}"的相关信息，包括行业背景、目标受众、相关趋势等，帮助生成更丰富的标题变体。`,
        knowledgeTools as [],
        model,
        apiKey,
        apiUrl,
        (chunk: unknown) => {
          // console.log(chunk);
        }
      );

      let enrichedInfo = '';
      
      for (const item of toolsResult) {
        const tool = this.tools.find((t: unknown) => {
          const toolObj = t as Record<string, unknown>;
          return toolObj.name === (item as Record<string, unknown>).name;
        });
        if (tool) {
          const toolObj = tool as Record<string, unknown>;
          const result = await (toolObj.execute as (args: unknown) => Promise<string>)((item as Record<string, unknown>).arguments);
          // console.log(result);
          try {
            const res = JSON.parse(result[0].text);
            if(res.success){
              // console.log(res.items);
              for (const item of res.items) {
                enrichedInfo += `\n# ${item.title}\n${item.description}\n\n`;
              }
            }
          } catch (error) {
            // 忽略解析错误
          }
          
        }
      }

      return enrichedInfo;
    } catch (error) {
      console.error('MCP搜索失败:', error);
      return '';
    }
  }

  public async disconnect(): Promise<void> {
    if (this.mcpClient) {
      await this.mcpClient.disconnect();
    }
  }
}

export default MCPService; 