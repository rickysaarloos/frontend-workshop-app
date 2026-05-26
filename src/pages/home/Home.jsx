import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, BookOpen, User, LogOut, ArrowRight } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const mockAankomendEvent = {
  titel: 'Studiedag Techniek 2026',
  datum: '2026-06-10',
  locatie: 'TCR Hoofdgebouw, Rotterdam',
}

const mockAantalWorkshops = 6

// 🔧 MOCK — later vervangen met API call: await getIngeschrevenWorkshops()
const mockIngeschreven = [
  { id: 1, titel: 'Workshop Lassen', datum: '2026-06-10', tijd: '09:00 - 12:00', locatie: 'Lokaal B203' },
  { id: 3, titel: 'Workshop Elektrotechniek', datum: '2026-06-12', tijd: '10:00 - 13:00', locatie: 'Practicum C105' },
]

function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const voornaam = user?.name?.split(' ')[0] || 'Student'

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  function formatKorteDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', {
      day: 'numeric', month: 'short',
    })
  }

  function handleUitloggen() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Je bent uitgelogd')
    setTimeout(() => navigate('/login'), 600)
  }

  return (
    <div className="min-h-screen bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#d4e84a] rounded-lg flex items-center justify-center">
            <span className="text-[#1a3d2b] font-black text-sm">T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-xs tracking-tight">Techniek College</span>
            <span className="text-white/50 font-medium text-xs tracking-tight">Rotterdam</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUitloggen}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          Uitloggen
        </motion.button>
      </motion.header>

      {/* Hero sectie */}
      <div className="px-6 pt-4 pb-10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#d4e84a]/5 rounded-full pointer-events-none" />
        <div className="absolute -left-10 bottom-0 w-48 h-48 bg-white/3 rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <p className="text-[#d4e84a] text-xs font-bold uppercase tracking-widest mb-2">Workshop app</p>
          <h1 className="text-4xl font-black text-white leading-none tracking-tight mb-1">
            Hoi,<br />{voornaam}!
          </h1>
          <p className="text-white/40 text-sm mt-3">Wat wil je doen vandaag?</p>
        </motion.div>
      </div>

      {/* Witte content sectie */}
      <div className="flex-1 bg-gray-50 rounded-t-[2rem] px-5 pt-7 pb-8 flex flex-col gap-4">

        {/* Aankomend event banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          whileHover={{ scale: 1.02, boxShadow: '0 16px 40px rgba(26,61,43,0.18)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/events')}
          className="bg-[#1a3d2b] rounded-3xl p-6 cursor-pointer relative overflow-hidden"
        >
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-[#d4e84a]/8 rounded-full" />
          <div className="absolute right-4 -bottom-8 w-20 h-20 bg-white/4 rounded-full" />
          <div className="flex items-start justify-between relative">
            <div className="flex-1">
              <p className="text-[#d4e84a] text-xs font-bold uppercase tracking-widest mb-2">Aankomend event</p>
              <h2 className="text-white text-base font-bold mb-4 leading-snug">{mockAankomendEvent.titel}</h2>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <CalendarDays className="w-3.5 h-3.5 text-[#d4e84a] shrink-0" />
                  <span className="capitalize">{formatDatum(mockAankomendEvent.datum)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span className="text-[#d4e84a] shrink-0">📍</span>
                  <span>{mockAankomendEvent.locatie}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#d4e84a]/20 p-2 rounded-xl ml-4 shrink-0">
              <ArrowRight className="w-4 h-4 text-[#d4e84a]" />
            </div>
          </div>
        </motion.div>

        {/* 3 kaarten */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          className="grid grid-cols-3 gap-3"
        >
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(212,232,74,0.3)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/workshops')}
            className="col-span-1 bg-[#d4e84a] rounded-2xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px]"
          >
            <BookOpen className="w-5 h-5 text-[#1a3d2b]" />
            <div>
              <p className="text-[#1a3d2b] text-2xl font-black leading-none">{mockAantalWorkshops}</p>
              <p className="text-[#1a3d2b]/60 text-xs font-semibold mt-0.5">workshops</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(26,61,43,0.1)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/events')}
            className="col-span-1 bg-white rounded-2xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px] border border-gray-100"
          >
            <CalendarDays className="w-5 h-5 text-[#1a3d2b]" />
            <div>
              <p className="text-[#1a3d2b] text-xs font-bold leading-tight">Alle events</p>
              <ArrowRight className="w-3.5 h-3.5 text-[#1a3d2b]/40 mt-1" />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(26,61,43,0.1)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/profiel')}
            className="col-span-1 bg-[#1a3d2b] rounded-2xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px]"
          >
            <User className="w-5 h-5 text-[#d4e84a]" />
            <div>
              <p className="text-white text-xs font-bold leading-tight">Mijn profiel</p>
              <ArrowRight className="w-3.5 h-3.5 text-white/30 mt-1" />
            </div>
          </motion.div>
        </motion.div>

        {/* Snel navigeren */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1"
        >
          Snel navigeren
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.4 }}
          className="bg-white rounded-3xl border border-gray-100 overflow-hidden"
        >
          {[
            { label: 'Workshops', desc: 'Bekijk en schrijf je in', icon: BookOpen, path: '/workshops', kleur: 'bg-[#d4e84a]', iconKleur: 'text-[#1a3d2b]' },
            { label: 'Events', desc: 'Aankomende evenementen', icon: CalendarDays, path: '/events', kleur: 'bg-[#eaf3de]', iconKleur: 'text-[#1a3d2b]' },
            { label: 'Mijn profiel', desc: 'Gegevens en dieetwensen', icon: User, path: '/profiel', kleur: 'bg-[#1a3d2b]', iconKleur: 'text-[#d4e84a]' },
          ].map(({ label, desc, icon: Icon, path, kleur, iconKleur }, index, arr) => (
            <motion.div
              key={path}
              whileHover={{ backgroundColor: '#f9fafb', x: 3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(path)}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-all duration-150 ${index !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
            >
              <div className={`${kleur} p-2.5 rounded-xl shrink-0`}>
                <Icon className={`w-4 h-4 ${iconKleur}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1a3d2b]">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
            </motion.div>
          ))}
        </motion.div>

        {/* ── JOUW INGESCHREVEN WORKSHOPS ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1"
        >
          Jouw workshops
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5 }}
          className="flex flex-col gap-2"
        >
          {mockIngeschreven.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center">
              <p className="text-sm text-gray-400">Je bent nog niet ingeschreven voor workshops</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/workshops')}
                className="mt-3 bg-[#1a3d2b] text-[#d4e84a] text-xs font-bold px-4 py-2 rounded-xl"
              >
                Bekijk workshops →
              </motion.button>
            </div>
          ) : (
            <>
              {mockIngeschreven.map((workshop, index) => (
                <motion.div
                  key={workshop.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.07 }}
                  whileHover={{ scale: 1.01, boxShadow: '0 4px 16px rgba(26,61,43,0.08)' }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => navigate(`/workshops/${workshop.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 px-4 py-3.5 cursor-pointer flex items-center gap-3 transition-all duration-150"
                >
                  {/* Datum blokje */}
                  <div className="bg-[#1a3d2b] rounded-xl px-2.5 py-2 text-center shrink-0 min-w-[44px]">
                    <p className="text-[#d4e84a] text-xs font-black leading-none">
                      {new Date(workshop.datum).getDate()}
                    </p>
                    <p className="text-white/50 text-[10px] font-medium mt-0.5 capitalize">
                      {new Date(workshop.datum).toLocaleDateString('nl-NL', { month: 'short' })}
                    </p>
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#1a3d2b]">{workshop.titel}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{workshop.tijd} · {workshop.locatie}</p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                </motion.div>
              ))}

              {/* Alle workshops bekijken link */}
              <motion.button
                whileHover={{ x: 2 }}
                onClick={() => navigate('/workshops')}
                className="flex items-center gap-1.5 text-xs text-[#1a3d2b] font-bold px-1 pt-1 hover:underline underline-offset-2"
              >
                Alle workshops bekijken
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </>
          )}
        </motion.div>

      </div>
    </div>
  )
}

export default Home