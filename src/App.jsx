import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import EventOverzicht from '@/pages/events/EventOverzicht'
import WorkshopOverzicht from '@/pages/workshops/WorkshopOverzicht'
import WorkshopDetail from '@/pages/workshops/WorkshopDetail'
import Profiel from '@/pages/profiel/Profiel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events" element={<EventOverzicht />} />
        <Route path="/workshops" element={<WorkshopOverzicht />} />
        <Route path="/workshops/:id" element={<WorkshopDetail />} />
        <Route path="/profiel" element={<Profiel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App