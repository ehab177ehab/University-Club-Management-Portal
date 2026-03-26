import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="text-3xl font-bold text-center mt-20 text-blue-600">University Club Portal</div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App