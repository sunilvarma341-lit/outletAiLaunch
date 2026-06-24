import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLaunch from './AppLaunch'
import ConfigPanel from './ConfigPanel'
import './App.css'

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<AppLaunch />} />
        <Route path="/config" element={<ConfigPanel />} />
      </Routes>
    </Router>
  )
}

export default App
