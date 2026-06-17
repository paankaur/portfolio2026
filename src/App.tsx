import { useState } from 'react'
import './App.css'
import BusinessCard from './components/BusinessCard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
        <BusinessCard 
          title="Hello!"
          name="I am Paan Kaur Riives"
          phone="+372 5625 8379"
          email="paan.kaur@gmail.com"
          description="Looking to begin my first job in the IT field. I am a fast learner and a hard worker. I am looking for a position where I can grow and learn new skills."
        />
    </>
  )
}

export default App
