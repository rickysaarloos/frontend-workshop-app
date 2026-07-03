import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import EventOverzicht from '@/pages/events/EventOverzicht'
import WorkshopOverzicht from '@/pages/workshops/WorkshopOverzicht'
import WorkshopDetail from '@/pages/workshops/WorkshopDetail'
import Profiel from '@/pages/profiel/Profiel'
import Home from '@/pages/home/Home'
import EventDetail from '@/pages/events/EventDetail'
import Meldingen from '@/pages/meldingen/Meldingen'
import ScanAanwezigheid from '@/pages/scan/ScanAanwezigheid'


// Alle routes van de app op één plek. Elke <Route> koppelt een pad rechtstreeks
// aan een pagina-component uit src/pages — er is geen geneste routing of layout-
// wrapper, elke pagina regelt zijn eigen header/footer.
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
        <Route path="/home" element={<Home />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/meldingen" element={<Meldingen />} />
        <Route path="/scan" element={<ScanAanwezigheid />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App