import { z } from 'zod'
import { NetworkContext, Tool } from './types'
export function createTool<T>(options: {
  name: string
  description: string
  parameters: z.ZodObject<any>
  handler: (args: any, context: NetworkContext<T>) => Promise<any>
}): Tool<T> {
  return options
}
