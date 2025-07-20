import { HistoryAdapter, InMemoryHistoryAdapter } from './history'
import { SimpleStateKV } from './state'
import { Agent, Message, Network, RouterFunction } from './types'

export function createNetwork<T>(options: {
  name: string
  agents: Agent[]
  router: RouterFunction<T> | Agent<T>
  history?: HistoryAdapter
  options?: {
    //無限ループを防ぐための最大反復回数
    maxIter?: number
  }
}): Network<T> {
  const agentsMap = new Map(options.agents.map((agent) => [agent.name, agent]))
  const state = new SimpleStateKV<T>()
  const historyAdapter = options.history || new InMemoryHistoryAdapter()
  const history: Message[] = []
  const maxIter = options.options?.maxIter || 10

  const run = async (input: string): Promise<Message[]> => {
    const threadId = (await historyAdapter.createThread?.()) || 'default'
    history.push({ role: 'user', content: input })

    let maxIterations: number = maxIter

    while (maxIterations > 0) {
      maxIterations--
      let nextAgent: Agent<T> | undefined
      if ('invoke' in options.router) {
        const routerAgent = await (options.router as Agent<T>).invoke(
          JSON.stringify({ history, state: state.getAll() }),
          { network },
        )
        nextAgent = agentsMap.get(routerAgent.content)
      } else {
        nextAgent = (options.router as RouterFunction<T>)({ network })
      }

      if (!nextAgent) break
      const result = await nextAgent.invoke(input, { network })
      // historyにmodel結果を追加
      history.push({ role: 'assistant', content: result.content, agent: { name: nextAgent.name } })
    }

    await historyAdapter.appendResults(threadId, history)
    return history
  }

  const network: Network<T> = {
    name: options.name,
    agents: agentsMap,
    state,
    router: options.router,
    history,
    run,
  }
  return network
}
