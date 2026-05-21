import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, BookOpen, User, LogOut, ChevronRight } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const mockAankomendEvent = {
  titel: 'Studiedag Techniek 2026',
  datum: '2026-06-10',
  locatie: 'TCR Hoofdgebouw, Rotterdam',
}

const mockAantalWorkshops = 6

function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const voornaam = user?.name?.split(' ')[0] || 'Student'

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  function handleUitloggen() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Je bent uitgelogd')
    setTimeout(() => navigate('/login'), 600)
  }

  const menuItems = [
    { label: 'Workshops', desc: 'Bekijk en schrijf je in voor workshops', icon: BookOpen, path: '/workshops' },
    { label: 'Events', desc: 'Bekijk aankomende evenementen', icon: CalendarDays, path: '/events' },
    { label: 'Mijn profiel', desc: 'Dieetwensen en persoonlijke gegevens', icon: User, path: '/profiel' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1a3d2b] rounded-lg flex items-center justify-center">
            <span className="text-[#d4e84a] font-black text-xs">T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[#1a3d2b] font-bold text-xs tracking-tight">Techniek College</span>
            <span className="text-[#1a3d2b] font-bold text-xs tracking-tight">Rotterdam</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUitloggen}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50"
        >
          <LogOut className="w-3.5 h-3.5" />
          Uitloggen
        </motion.button>
      </motion.header>

      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-5">

        {/* Welkomst */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h1 className="text-2xl font-bold text-[#1a3d2b] tracking-tight">Hoi, {voornaam}! 👋</h1>
          <p className="text-sm text-gray-400 mt-1">Wat wil je doen vandaag?</p>
        </motion.div>

        {/* Aankomend event banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(26,61,43,0.2)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/events')}
          className="bg-[#1a3d2b] rounded-3xl p-6 cursor-pointer transition-all duration-200 relative overflow-hidden"
        >
          {/* Decoratieve cirkel achtergrond */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -right-2 -bottom-6 w-20 h-20 bg-[#d4e84a]/10 rounded-full" />

          <p className="text-[#d4e84a] text-xs font-bold mb-2 uppercase tracking-widest">Aankomend event</p>
          <h2 className="text-white text-base font-bold mb-4 relative">{mockAankomendEvent.titel}</h2>
          <div className="flex flex-col gap-1.5 relative">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <CalendarDays className="w-3.5 h-3.5 text-[#d4e84a]" />
              <span className="capitalize">{formatDatum(mockAankomendEvent.datum)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="text-[#d4e84a]">📍</span>
              <span>{mockAankomendEvent.locatie}</span>
            </div>
          </div>
        </motion.div>

        {/* Workshops teller */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(212,232,74,0.35)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/workshops')}
          className="bg-[#d4e84a] rounded-3xl p-6 cursor-pointer transition-all duration-200 flex items-center justify-between relative overflow-hidden"
        >
          <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-[#1a3d2b]/5 rounded-full" />
          <div>
            <p className="text-[#1a3d2b]/60 text-xs font-bold uppercase tracking-widest mb-1">Beschikbare workshops</p>
            <p className="text-[#1a3d2b] text-4xl font-black">{mockAantalWorkshops}</p>
          </div>
          <div className="bg-[#1a3d2b] p-4 rounded-2xl shadow-lg">
            <BookOpen className="w-6 h-6 text-[#d4e84a]" />
          </div>
        </motion.div>

        {/* Menu kaarten */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {menuItems.map(({ label, desc, icon: Icon, path }, index) => (
            <motion.div
              key={path}
              whileHover={{ backgroundColor: '#f9fafb', x: 4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(path)}
              className={`flex items-center gap-4 p-5 cursor-pointer transition-all duration-150 ${index !== menuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className="bg-[#eaf3de] p-3 rounded-2xl shrink-0">
                <Icon className="w-5 h-5 text-[#1a3d2b]" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold text-[#1a3d2b]">{label}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}

export default Home