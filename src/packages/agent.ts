import { invokeOpenAI } from './models'
import { Agent, InterfaceResult, LLMConfig, Message, NetworkContext, Tool } from './types'

export function createAgent<T>(options: {
  name: string
  system: string | ((context: { network?: any }) => string)
  tools?: Tool<T>[]
  model: LLMConfig
}): Agent<T> {
  const tools = options.tools || []
  async function invoke(input: string, context?: NetworkContext<T>): Promise<InterfaceResult> {
    const system = typeof options.system === 'function' ? options.system(context || {}) : options.system

    const history = context?.network?.history || []
    // 初手
    const messages: Message[] = history.length > 0 ? [...history] : [{ role: 'user', content: input }]

    let result: InterfaceResult
    switch (options.model.provider) {
      case 'openai':
        result = await invokeOpenAI<T>(options.model, system, messages, tools)
        break
      default:
        throw new Error(`Unsupported model provider: ${options.model.provider}`)
    }

    console.log(`Agent result:`, result)
    for (const toolCall of result.toolCalls) {
      const toolResult = await toolCall.tool.handler(toolCall.content, context || {})
      result.content += `\n\nTool ${toolCall.tool.name} result: ${JSON.stringify(toolResult)}`
    }
    return result
  }

  return {
    ...options,
    invoke,
  }
}
