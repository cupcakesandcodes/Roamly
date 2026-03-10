import { Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import LandingPage from './pages/LandingPage'
import DiscoverPage from './pages/DiscoverPage'
import TripDetailsPage from './pages/TripDetailsPage'
import TravellerDashboard from './pages/TravellerDashboard'
import AgentDashboard from './pages/AgentDashboard'
import TripBuilder from './pages/TripBuilder'
import AIPlanner from './pages/AIPlanner'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import TravelerOnboarding from './pages/auth/TravelerOnboarding'
import TravelerProfile from './pages/auth/TravelerProfile'
import AgentOnboarding from './pages/auth/AgentOnboarding'
import AgencyProfile from './pages/AgencyProfile'
import LegacyTripDetails from './pages/LegacyTripDetails'
import TripHubPage from './pages/TripHubPage'
import DirectMessagePage from './pages/DirectMessagePage'
import Navbar from './components/Navbar'

const PAGES_WITH_OWN_NAV = ['/dashboard', '/agent/dashboard', '/agent/trip-builder', '/ai-planner', '/signup', '/login', '/onboarding', '/trip-hub', '/messages', '/become-agent']

function App() {
  const location = useLocation()
  const hideGlobalNav = PAGES_WITH_OWN_NAV.some(p => location.pathname.startsWith(p))

  return (
    <div className="min-h-screen bg-surface">
      {!hideGlobalNav && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/trip/:id" element={<TripDetailsPage />} />
        <Route path="/dashboard" element={<TravellerDashboard />} />
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/trip-builder" element={<TripBuilder />} />
        <Route path="/ai-planner" element={<AIPlanner />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/become-agent" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding/traveler" element={<TravelerOnboarding />} />
        <Route path="/onboarding/agent" element={<AgentOnboarding />} />
        <Route path="/profile/me" element={<TravelerProfile />} />
        <Route path="/profile/:uid" element={<TravelerProfile />} />
        <Route path="/agency/:uid" element={<AgencyProfile />} />
        <Route path="/agency/:uid/legacy/:portfolioId" element={<LegacyTripDetails />} />
        <Route path="/trip-hub/:id" element={<TripHubPage />} />
        <Route path="/messages/:chatId" element={<DirectMessagePage />} />
      </Routes>
      <Analytics />
    </div>
  )
}

export default App
