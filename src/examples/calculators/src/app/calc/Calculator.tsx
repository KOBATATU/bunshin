'use client'
import { useState } from 'react'
import Button from './Button'
import Display from './Display'

const Calculator = () => {
  const [currentValue, setCurrentValue] = useState<string>('0')
  const [previousValue, setPreviousValue] = useState<string | null>(null)
  const [operation, setOperation] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])

  const handleInput = (value: string) => {
    if (currentValue === '0') {
      setCurrentValue(value)
    } else {
      setCurrentValue(currentValue + value)
    }
  }

  const handleOperation = (op: string) => {
    if (operation && previousValue !== null) {
      const result = calculate(parseFloat(previousValue), parseFloat(currentValue), operation)
      setCurrentValue(String(result))
      setHistory([...history, `${previousValue} ${operation} ${currentValue} = ${result}`])
    } else {
      setPreviousValue(currentValue)
    }
    setOperation(op)
    setCurrentValue('0')
  }

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '*':
        return a * b
      case '/':
        if (b === 0) {
          alert('Division by zero is not allowed')
          return a
        }
        return a / b
      default:
        return b
    }
  }

  const handleClear = () => {
    setCurrentValue('0')
    setPreviousValue(null)
    setOperation(null)
  }

  const handleEqual = () => {
    if (operation && previousValue !== null) {
      const result = calculate(parseFloat(previousValue), parseFloat(currentValue), operation)
      setCurrentValue(String(result))
      setHistory([...history, `${previousValue} ${operation} ${currentValue} = ${result}`])
      setPreviousValue(null)
      setOperation(null)
    }
  }

  return (
    <div className="bg-gray-200 p-4 rounded-lg shadow-md">
      <Display currentValue={currentValue} history={history} />
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[...'789/456*123-0.=+'].map((key) => (
          <Button
            key={key}
            label={key}
            onClick={() => {
              if ('0123456789'.includes(key)) {
                handleInput(key)
              } else if ('+-*/'.includes(key)) {
                handleOperation(key)
              } else if (key === '=') {
                handleEqual()
              } else if (key === 'C') {
                handleClear()
              }
            }}
          />
        ))}
        <Button label="C" onClick={handleClear} />
      </div>
    </div>
  )
}

export default Calculator
