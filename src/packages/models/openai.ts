import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { InterfaceResult, LLMConfig, Message, Tool } from '../types'

function mapToOpenAIMessages(messages: Message[]): ChatCompletionMessageParam[] {
  return messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }))
}
/**
 *
 * @param config
 * @param system
 * @param message
 * @param tools
 *
 * 流れはsystemによってAgentの人格を決定．内部で定義しているtoolを選択させる
 */
export async function invokeOpenAI<T>(
  config: LLMConfig,
  system: string,
  message: Message[],
  tools: Tool<T>[],
): Promise<InterfaceResult> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  //   system roleはAIの人格や定義そのもの．あなたはReactのエキスパートです．みたいな最初に設定するコンテキスト
  const openaiMessages: ChatCompletionMessageParam[] = [
    { role: 'system', content: system },
    ...mapToOpenAIMessages(message),
  ]

  console.log('OpenAI messages:', openaiMessages)

  // messageの過去のやり取りと共にmodelに渡す https://platform.openai.com/docs/api-reference/chat/create
  const response = await openai.chat.completions.create({
    model: config.model,
    messages: openaiMessages,

    tool_choice: 'auto',
    // AIが外部関数を呼び出すための設定
    tools: tools.map((tool) => ({
      type: 'function',

      function: {
        name: tool.name,
        description: tool.description,
        parameters: zodToJsonSchema(tool.parameters, 'schema').definitions?.schema,
      },
    })),
    ...config.defaultParameters,
  })
  console.log('OpenAI response:', response.choices[0].message.tool_calls?.length)
  console.log('OpenAI response:', response.choices[0].message.tool_calls)

  const result: InterfaceResult = {
    content: response.choices[0].message.content || '',
    toolCalls:
      response.choices[0].message.tool_calls?.map((call) => {
        return {
          tool: tools.find((tool) => tool.name === call.function.name)!,
          content: JSON.parse(call.function.arguments),
        }
      }) || [],
    usage: {
      tokens: response.usage?.total_tokens || 0,
      time: response.created || 0,
    },
  }

  return result
}
