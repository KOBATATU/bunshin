import { exec } from 'child_process'
import { config } from 'dotenv'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { z } from 'zod'
import { createAgent } from '../packages/agent'
import { NetworkContext, Tool } from '../packages/types'

config()

const execAsync = promisify(exec)

const executeCommandTool: Tool = {
  name: 'execute_command',
  description: 'Execute a shell command and return the output',
  parameters: z.object({
    command: z.string().describe('The shell command to execute'),
  }),
  handler: async (args: { command: string }, context: NetworkContext) => {
    try {
      console.log(`Executing command: ${args.command}`)
      const { stdout, stderr } = await execAsync(args.command)
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}

// ファイル書き込みツール
const writeFileTool: Tool = {
  name: 'write_file',
  description: 'Write content to a file',
  parameters: z.object({
    filepath: z.string().describe('The path where the file should be written'),
    content: z.string().describe('The content to write to the file'),
  }),
  handler: async (args: { filepath: string; content: string }, context: NetworkContext) => {
    try {
      console.log(`Writing to file: ${args.filepath}`)
      await fs.writeFile(args.filepath, args.content, 'utf-8')
      return {
        success: true,
        message: `File written successfully to ${args.filepath}`,
        filepath: args.filepath,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}

// ファイル読み込みツール
const readFileTool: Tool = {
  name: 'read_file',
  description: 'Read content from a file',
  parameters: z.object({
    filepath: z.string().describe('The path of the file to read'),
  }),
  handler: async (args: { filepath: string }, context: NetworkContext) => {
    try {
      console.log(`Reading file: ${args.filepath}`)
      const content = await fs.readFile(args.filepath, 'utf-8')
      return {
        success: true,
        content,
        filepath: args.filepath,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}

// サンプルエージェント作成と実行
async function main() {
  console.log('🚀 Developer Agent Started!')

  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in the environment variables.')
    console.error('Please create a .env file in the project root with:')
    console.error('OPENAI_API_KEY=your_openai_api_key_here')
    return
  }

  const developerAgent = createAgent({
    name: 'DeveloperAgent',
    system: `あなたは開発者アシスタントです。
  ユーザーの要求に応じて、ファイルの作成・読み込み、コマンドの実行を行います。
  
  1. execute_command (ls) - ディレクトリ確認
  2. write_file - ファイル作成
  3. read_file - 作成したファイルの確認`,
    tools: [executeCommandTool, writeFileTool, readFileTool],
    model: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      defaultParameters: {
        max_tokens: 16384,
      },
    },
  })

  try {
    // サンプル1: 複数ツール使用を強制
    console.log('\n--- Sample 1: Multi-step file creation ---')
    const result1 = await developerAgent.invoke(
      `
  toolは3つ以上選択して
   最初にlsコマンドを実行して現在のディレクトリの内容を確認
   "hello.txt"ファイルを作成して「Hello, World! This is a test file created by the agent.」という内容を書き込み
   作成したファイルの内容をread_fileツールで読み取って確認
 `,
    )
    console.log('Agent Response:', result1.content)
    console.log('Tool Calls:', result1.toolCalls.length)

    console.log('result:', JSON.stringify(result1.content))
  } catch (error) {
    console.error('Error during execution:', error)
  }

  console.log('\n✅ All samples completed!')
}

main().catch(console.error)

export { main as runSimpleAgentExample }
