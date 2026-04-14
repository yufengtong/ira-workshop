import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from '@/lib/store'
import { Navbar } from '@/components/Navbar'
import { Toast } from '@/components/Toast'
import { HomePage } from '@/pages/HomePage'
import { ActivitiesPage } from '@/pages/ActivitiesPage'
import { CreateActivityPage } from '@/pages/CreateActivityPage'
import { LeaderboardPage } from '@/pages/LeaderboardPage'
import { RoutesPage } from '@/pages/RoutesPage'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Toast />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/create" element={<CreateActivityPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/routes" element={<RoutesPage />} />
          </Routes>
          <footer className="border-t bg-card">
            <div className="container py-6 text-center text-sm text-muted-foreground">
              山行 · 登山社群平台 — 安全登山，敬畏自然
            </div>
          </footer>
        </div>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App