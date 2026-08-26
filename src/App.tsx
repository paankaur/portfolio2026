import { BrowserRouter, Routes, Route } from 'react-router'

import Home from '@/Home'
import CubeSim from '@/apps/Cube-Simulator/CubeSim'


function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cube-sim" element={<CubeSim />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
