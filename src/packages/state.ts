import { StateKV } from './types'

/**
 * Agentで使用されるシンプルな状態管理クラス
 * pinia, zustandと同様のような機能
 */
export class SimpleStateKV<T> implements StateKV<T> {
  private store: Partial<T> = {}

  get<K extends keyof T>(key: K): T[K] | undefined {
    return this.store[key]
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    this.store[key] = value
  }

  has<K extends keyof T>(key: K): boolean {
    return key in this.store
  }

  getAll(): Partial<T> {
    return { ...this.store }
  }
}
