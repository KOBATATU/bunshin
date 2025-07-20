import { exec } from 'child_process'
import { config } from 'dotenv'
import { promises as fs } from 'fs'
import { promisify } from 'util'
import { z } from 'zod'
import { createAgent } from '../packages/agent'
import { createNetwork } from '../packages/network'
import { NetworkContext, Tool } from '../packages/types'

config()

const execAsync = promisify(exec)

// コマンド実行ツール
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

// ディレクトリ作成ツール
const createDirectoryTool: Tool = {
  name: 'create_directory',
  description: 'Create a directory if it does not exist',
  parameters: z.object({
    dirpath: z.string().describe('The path of the directory to create'),
  }),
  handler: async (args: { dirpath: string }, context: NetworkContext) => {
    try {
      console.log(`Creating directory: ${args.dirpath}`)
      await fs.mkdir(args.dirpath, { recursive: true })
      return {
        success: true,
        message: `Directory created successfully: ${args.dirpath}`,
        dirpath: args.dirpath,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  },
}

// 計算機アプリ作成エージェント
const calculatorAppAgent = createAgent({
  name: 'CalculatorAppAgent',
  system: `あなたはTypeScript、React、Node.js、Next.js App Router、Tailwind のエキスパートです。

  プロジェクトは指示された場所のディレクトリを対象にしてください．
重要: まず最初に必ず以下を実行してください：
1. プロジェクトの現在の状態を確認する（ディレクトリ構造、既存ファイル）
2. package.jsonを読み込んで依存関係を確認する
3. 既存のNext.js設定ファイルを確認する（next.config.js、tailwind.config.js等）
4. 指定されたディレクトリの現状を把握する

作業手順：
1. 【必須】現在のプロジェクト状況の調査
   - execute_command で ls -la や tree コマンドを使用してディレクトリ構造を確認
   - 対象ディレクトリの中身を確認
   - package.jsonを読み込んで現在の依存関係を把握
   - 既存の設定ファイルを確認

2. 【必須】Next.js App Routerの構造確認
   - app/layout.tsx の存在と内容確認
   - app/page.tsx の存在と内容確認
   - 必要に応じて適切な構造に修正

3. 必要な依存関係の追加
   - 不足している依存関係があれば npm install で追加

4. アプリケーションの実装
   - ユーザーの要求に従って完全に動作するアプリケーションを作成
   - エラーハンドリングも含めて実装

コードスタイルと構造：
- Standard.jsルールに従った簡潔で技術的なTypeScriptコードを記述
- 関数型プログラミングパターンを使用し、クラスは避ける
- コードの重複よりも反復と模様化を優先
- 2スペースインデント、セミコロンなし、シングルクォートを使用
- camelCaseで変数と関数を命名、PascalCaseでコンポーネントを命名

React ベストプラクティス：
- 関数コンポーネントとhooksを正しく実装
- useState、useEffect、useCallback、useMemoを適切に使用
- コンポーネントメモ化にReact.memo()を使用
- 制御されたコンポーネントを優先
- エラーバウンダリを実装

Next.js App Router：
- Server Componentsを優先し、'use client'の使用を最小化
- 適切なファイル構造とルーティングを実装
- パフォーマンス最適化を考慮
- use〇〇の関数を使うコンポーネントは、'use client'を必ず指定

UI とスタイリング：
- Tailwind CSSでレスポンシブデザインを実装
- モバイルファーストアプローチを使用
- コンポーネント固有のスタイルにはStylus modulesを使用

技術仕様：
- Next.js 15 App Router使用
- TypeScript対応
- Tailwind CSS + Stylus modules
- 関数型コンポーネント
- React hooksでの状態管理
- セマンティックHTML

重要な注意事項：
- 作業を始める前に必ず現在のプロジェクト状況を調査し、理解してから進める
- 既存のファイルがある場合は、それを尊重して適切に統合する
- 作業の各段階で結果を確認し、問題があれば修正する
- 推測ではなく、実際のファイルの中身を確認してから作業する

すべてのファイルの作成が完了したら、必ず「アプリ作成完了」というメッセージを含めてください。これが完了の合図です。`,
  tools: [executeCommandTool, writeFileTool, readFileTool, createDirectoryTool],
  model: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    defaultParameters: {
      max_tokens: 16384,
    },
  },
})

// ネットワーク作成と実行
async function main() {
  console.log('Calculator App Creation Agent Started!')

  if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in the environment variables.')
    console.error('Please create a .env file in the project root with:')
    console.error('OPENAI_API_KEY=your_openai_api_key_here')
    return
  }

  // ネットワークの作成
  const network = createNetwork({
    name: 'CalculatorAppNetwork',
    agents: [calculatorAppAgent],
    router: ({ network }) => {
      if (network.history.length === 1) {
        return calculatorAppAgent // 最初は計算機アプリエージェントを実行
      }
      // 現在のメッセージ内容をチェック
      const lastMessage = network.history[network.history.length - 1]

      // 「アプリ作成完了」が含まれていれば終了
      if (lastMessage && typeof lastMessage.content === 'string' && lastMessage.content.includes('アプリ作成完了')) {
        console.log('\n✅ App creation completed! Network will terminate.')
        return undefined // ネットワーク終了
      }

      return calculatorAppAgent
    },
    options: {
      maxIter: 10,
    },
  })

  try {
    console.log('\n--- Starting Calculator App Creation ---')

    const result = await network.run(
      `
        Next.jsを使用して、見た目も機能も使いやすい計算機を作ってください。
                
        プロジェクト情報：
        - プロジェクトは src/examples/calculators の中にあります
        - これはNext.jsのApp Routerを使用したプロジェクトです
        - src/examples/calculators/src/app はNext.jsのApp RouterのPage構造となります．
        
        計算機の機能要件：
        - 基本的な四則演算（+、-、*、/）
        - クリア機能とリセット機能
        - 結果表示と計算履歴
        - レスポンシブデザイン
        - TypeScriptでの型安全性
        - エラーハンドリング（ゼロ除算等）
  
        完了したら必ず「アプリ作成完了」と伝えてください。`,
    )

    console.log('\n--- Final Result ---')
    console.log('Final Response:', result)
    console.log('Total Messages:', result.length)
  } catch (error) {
    console.error('Error during app creation:', error)
  }

  console.log('\n✅ Calculator app creation process completed!')
}

main().catch(console.error)

export { main as runCalculatorAppAgent }
