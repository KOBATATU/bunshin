import Calculator from './calc/Calculator'

export default function Home() {
  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold text-center mb-4'>Calculator</h1>
      <Calculator />
    </div>
  )
}
