import { z } from 'zod'
export interface Agent<T = any> {
  name: string
  system: string | ((context: { network?: any }) => string)
  tools?: Tool<T>[]
  model: LLMConfig
  invoke(input: string, context?: NetworkContext<T>): Promise<InterfaceResult>
}

export interface InterfaceResult {
  content: string
  toolCalls: { tool: Tool; content: any }[]
  usage: { tokens: number; time: number }
}

export interface Tool<T = any> {
  name: string
  description: string
  parameters: z.ZodObject<any>
  handler: (args: any, context: NetworkContext<T>) => Promise<any>
}

export interface NetworkContext<T = any> {
  network?: Network<T>
  step?: {
    run: (name: string, fn: () => Promise<any>) => Promise<any>
  }
}

export interface LLMConfig {
  provider: 'openai'
  model: 'gpt-4o-mini'
  defaultParameters?: Record<string, any>
}

export interface Network<T = any> {
  name: string
  agents: Map<string, Agent<T>>
  state: StateKV<T>
  router: RouterFunction<T> | Agent<T>
  history: Message[]
  run(input: string): Promise<any>
}

export interface StateKV<T = any> {
  get<K extends keyof T>(key: K): T[K] | undefined
  set<K extends keyof T>(key: K, value: T[K]): void
  has<K extends keyof T>(key: K): boolean
}

export type RouterFunction<T> = (args: { network: Network<T> }) => Agent<T> | undefined
export interface Message {
  // userはユーザーからの入力, assistantはAIの応答, toolはツールの呼び出し名
  role: 'user' | 'assistant' | 'tool'
  content: string
  agent?: { name: string }
}
