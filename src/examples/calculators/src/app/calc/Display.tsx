import React from 'react'

interface DisplayProps {
  currentValue: string
  history: string[]
}

const Display: React.FC<DisplayProps> = ({ currentValue, history }) => {
  return (
    <div className="bg-white p-4 rounded-t">
      <div className="w-full bg-black text-white p-2 text-right font-mono text-xl">
        {currentValue}
      </div>
      <div className="w-full max-h-20 overflow-auto text-right text-sm">
        {history.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  )
}

export default Display
