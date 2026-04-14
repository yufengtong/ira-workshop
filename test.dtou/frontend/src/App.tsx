import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import IndustryView from './pages/IndustryView'
import CompanyView from './pages/CompanyView'
import StrategyDashboard from './pages/StrategyDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndustryView />} />
          <Route path="industry" element={<IndustryView />} />
          <Route path="company" element={<CompanyView />} />
          <Route path="strategy" element={<StrategyDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
