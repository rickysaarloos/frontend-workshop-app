import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, BookOpen, User, LogOut, ArrowRight, MapPin } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'

function Home() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const voornaam = user?.name?.split(' ')[0]

  const [workshops, setWorkshops] = useState([])
  const [aankomendEvent, setAankomendEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchData(token)
  }, [])

  async function fetchData(token) {
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }

    try {
      const [workshopsRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/api/workshops`, { headers }),
        fetch(`${API_URL}/api/events`, { headers }),
      ])

      if (workshopsRes.status === 401 || eventsRes.status === 401) {
        navigate('/login')
        return
      }

      const [workshopsJson, eventsJson] = await Promise.all([
        workshopsRes.json(),
        eventsRes.json(),
      ])

      setWorkshops(workshopsJson.data || [])

      const vandaag = new Date()
      vandaag.setHours(0, 0, 0, 0)
      const komende = (eventsJson.data || [])
        .filter((e) => {
          const datum = new Date(e.days?.[0]?.date || e.start_date?.split(' ')?.[0] || 0)
          return datum >= vandaag
        })
        .sort((a, b) => {
          const da = new Date(a.days?.[0]?.date || a.start_date?.split(' ')?.[0] || 0)
          const db = new Date(b.days?.[0]?.date || b.start_date?.split(' ')?.[0] || 0)
          return da - db
        })

      setAankomendEvent(komende[0] || null)
    } catch {
      toast.error('Gegevens ophalen mislukt')
    } finally {
      setLoading(false)
    }
  }

  const ingeschrevenWorkshops = workshops.filter((w) => w.is_registered)
  const aantalWorkshops = workshops.length

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

  return (
    <div className="min-h-screen bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 40 }}
        className="px-6 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="w-7 h-7 bg-[#d4e84a] rounded-lg flex items-center justify-center cursor-default"
          >
            <span className="text-[#1a3d2b] font-black text-xs">T</span>
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-xs tracking-tight">Techniek College</span>
            <span className="text-white/50 font-medium text-xs tracking-tight">Rotterdam</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleUitloggen}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          Uitloggen
        </motion.button>
      </motion.header>

      {/* Hero sectie */}
      <div className="px-6 pt-2 pb-10 relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.1, 0.06] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-16 -top-8 w-64 h-64 bg-[#d4e84a] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -left-20 bottom-0 w-48 h-48 bg-[#d4e84a] rounded-full pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.15 }}
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
            className="text-[#d4e84a] text-xs font-bold uppercase tracking-widest mb-2"
          >
            Workshop app
          </motion.p>
          <h1 className="text-4xl font-black text-white leading-none tracking-tight mb-1">
            Hoi,<br />{voornaam}!
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.44 }}
            className="text-white/40 text-sm mt-3"
          >
            Wat wil je doen vandaag?
          </motion.p>
        </motion.div>
      </div>

      {/* Content sectie */}
      <div className="flex-1 bg-[#e4e8e2] rounded-t-[2.5rem] px-5 pt-7 pb-10 flex flex-col gap-4">

        {/* Aankomend event banner */}
        {loading ? (
          <div className="bg-[#1a3d2b]/60 rounded-3xl p-6 h-36 animate-pulse" />
        ) : aankomendEvent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.28 }}
            whileHover={{ y: -3, boxShadow: '0 20px 48px rgba(26,61,43,0.28)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/events/${aankomendEvent.id}`)}
            className="bg-[#1a3d2b] rounded-3xl p-6 cursor-pointer relative overflow-hidden"
          >
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-8 -top-8 w-32 h-32 bg-[#d4e84a] rounded-full pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.07, 0.04] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              className="absolute right-8 -bottom-10 w-24 h-24 bg-white rounded-full pointer-events-none"
            />

            <div className="flex items-start justify-between relative">
              <div className="flex-1">
                <p className="text-[#d4e84a] text-xs font-bold uppercase tracking-widest mb-2">Aankomend event</p>
                <h2 className="text-white text-base font-bold mb-4 leading-snug">{aankomendEvent.title}</h2>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <CalendarDays className="w-3.5 h-3.5 text-[#d4e84a] shrink-0" />
                    <span className="capitalize">
                      {formatDatum(aankomendEvent.days?.[0]?.date || aankomendEvent.start_date?.split(' ')?.[0])}
                    </span>
                  </div>
                  {aankomendEvent.location && (
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <MapPin className="w-3.5 h-3.5 text-[#d4e84a] shrink-0" />
                      <span>{aankomendEvent.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white/10 p-2 rounded-xl ml-4 shrink-0">
                <ArrowRight className="w-4 h-4 text-[#d4e84a]" />
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* 3 quick-action kaarten */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.38 }}
          className="grid grid-cols-3 gap-3"
        >
          <motion.div
            whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(212,232,74,0.35)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/workshops')}
            className="col-span-1 bg-[#d4e84a] rounded-2xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px]"
          >
            <BookOpen className="w-5 h-5 text-[#1a3d2b]" />
            <div>
              {loading ? (
                <div className="h-7 w-8 bg-[#1a3d2b]/10 rounded-lg animate-pulse mb-1" />
              ) : (
                <p className="text-[#1a3d2b] text-2xl font-black leading-none">{aantalWorkshops}</p>
              )}
              <p className="text-[#1a3d2b]/60 text-xs font-semibold mt-0.5">workshops</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(26,61,43,0.1)' }}
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
            whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(26,61,43,0.2)' }}
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
          transition={{ delay: 0.5 }}
          className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1"
        >
          Snel navigeren
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.54 }}
          className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm"
        >
          {[
            { label: 'Workshops', desc: 'Bekijk en schrijf je in', icon: BookOpen, path: '/workshops', kleur: 'bg-[#d4e84a]', iconKleur: 'text-[#1a3d2b]' },
            { label: 'Events', desc: 'Aankomende evenementen', icon: CalendarDays, path: '/events', kleur: 'bg-[#eaf3de]', iconKleur: 'text-[#1a3d2b]' },
            { label: 'Mijn profiel', desc: 'Gegevens en dieetwensen', icon: User, path: '/profiel', kleur: 'bg-[#1a3d2b]', iconKleur: 'text-[#d4e84a]' },
          ].map(({ label, desc, icon: Icon, path, kleur, iconKleur }, index, arr) => (
            <motion.div
              key={path}
              whileHover={{ x: 4, backgroundColor: '#f8faf7' }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(path)}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors duration-150 ${index !== arr.length - 1 ? 'border-b border-gray-50' : ''}`}
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

        {/* Jouw workshops */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.62 }}
          className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1"
        >
          Jouw workshops
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.66 }}
          className="flex flex-col gap-2"
        >
          {loading ? (
            [1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-0.5 bg-gray-100 animate-pulse" />
                <div className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 bg-gray-100 rounded-xl animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full w-40 animate-pulse" />
                    <div className="h-2.5 bg-gray-100 rounded-full w-28 animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : ingeschrevenWorkshops.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 mb-3">Je bent nog niet ingeschreven voor workshops</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/workshops')}
                className="text-xs text-[#1a3d2b] font-bold bg-[#eaf3de] px-3 py-1.5 rounded-lg hover:bg-[#d4e84a] transition-colors"
              >
                Bekijk workshops
              </motion.button>
            </div>
          ) : (
            <>
              {ingeschrevenWorkshops.map((workshop, index) => {
                const datum = workshop.start_date?.split(' ')?.[0] || ''
                const tijdStart = workshop.start_date?.split(' ')?.[1] || ''
                const tijdEind = workshop.end_date?.split(' ')?.[1] || ''

                return (
                  <motion.div
                    key={workshop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.72 + index * 0.1 }}
                    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(26,61,43,0.1)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/workshops/${workshop.id}`)}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden cursor-pointer shadow-sm"
                  >
                    <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                    <div className="px-4 py-3.5 flex items-center gap-3">
                      <div className="bg-[#1a3d2b] rounded-xl px-2.5 py-2 text-center shrink-0 min-w-[44px]">
                        <p className="text-[#d4e84a] text-xs font-black leading-none">
                          {new Date(datum).getDate()}
                        </p>
                        <p className="text-white/50 text-[10px] font-medium mt-0.5 capitalize">
                          {new Date(datum).toLocaleDateString('nl-NL', { month: 'short' })}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#1a3d2b] truncate">{workshop.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {tijdStart} – {tijdEind} · {workshop.location}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </div>
                  </motion.div>
                )
              })}

              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
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
