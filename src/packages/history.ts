import { Message } from './types'

export interface HistoryAdapter {
  createThread(): Promise<string>
  get(threadId: string): Promise<Message[]>
  appendResults(threadId: string, messages: Message[]): Promise<void>
}

export class InMemoryHistoryAdapter implements HistoryAdapter {
  private history: Map<string, Message[]> = new Map()

  async createThread(): Promise<string> {
    const threadId = crypto.randomUUID()
    this.history.set(threadId, [])
    return threadId
  }

  async get(threadId: string): Promise<Message[]> {
    return this.history.get(threadId) || []
  }

  // 1つのAgentが終わるとMessageの中身を追加する
  async appendResults(threadId: string, messages: Message[]): Promise<void> {
    const existingMessages = this.history.get(threadId) || []
    this.history.set(threadId, [...existingMessages, ...messages])
  }
}
