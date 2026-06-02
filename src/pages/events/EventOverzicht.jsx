import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, MapPin, Search, Calendar } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'
const categorieen = ['Alle', 'Studiedag', 'Open dag', 'Gastcollege', 'Expo']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
}

function EventCard({ event, navigate, formatDatum, getDagenTot }) {
  const dagenTot = getDagenTot(event.datum)
  const isVoorbij = dagenTot < 0

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: '0 16px 36px rgba(26,61,43,0.13)' }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/events/${event.id}`)}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden cursor-pointer"
    >
      <div className={`h-0.5 w-full ${isVoorbij ? 'bg-gradient-to-r from-gray-200 to-gray-300' : 'bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]'}`} />

      <div className="p-5">
        <div className="flex justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className="text-xs bg-[#eaf3de] text-[#1a3d2b] font-semibold px-2 py-1 rounded-lg">
              {event.categorie}
            </span>

            <h2 className="font-bold text-[#1a3d2b] mt-2 text-sm leading-snug truncate">
              {event.titel}
            </h2>

            <p className="text-xs text-gray-400 mt-1 mb-3 line-clamp-2 leading-relaxed">
              {event.beschrijving}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                <CalendarDays className="w-3 h-3 text-gray-400" />
                <span className="capitalize">{formatDatum(event.datum)}</span>
              </span>
              {event.tijd && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {event.tijd}
                </span>
              )}
              {event.locatie && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {event.locatie}
                </span>
              )}
            </div>
          </div>

          <div className="text-right shrink-0 flex flex-col items-end justify-center">
            <p className={`text-lg font-bold ${isVoorbij ? 'text-gray-300' : 'text-[#1a3d2b]'}`}>
              {isVoorbij ? '–' : dagenTot}
            </p>
            <p className="text-xs text-gray-400">
              {isVoorbij ? 'voorbij' : 'dagen'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EventOverzicht() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [zoekterm, setZoekterm] = useState('')
  const [actieveCategorie, setActieveCategorie] = useState('Alle')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchEvents(token)
  }, [])

  async function fetchEvents(token) {
    try {
      const res = await fetch(`${API_URL}/api/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (res.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
        return
      }

      if (!res.ok) throw new Error(`Kon events niet ophalen (${res.status})`)

      const json = await res.json()

      const mapped = (json.data || []).map((e) => ({
        id: e.id,
        titel: e.title,
        beschrijving: e.description,
        locatie: e.location,
        categorie: mapCategory(e.category),
        datum: e.days?.[0]?.date || e.start_date?.split(' ')?.[0] || '',
        tijd: formatTimeRange(e.days),
        startDate: e.start_date,
      }))

      setEvents(mapped)
    } catch (err) {
      toast.error('Events ophalen mislukt')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function mapCategory(cat) {
    const map = {
      conference: 'Studiedag',
      open_day: 'Open dag',
      lecture: 'Gastcollege',
      expo: 'Expo',
    }
    return map[cat] || cat
  }

  function formatTimeRange(days) {
    if (!days?.length) return ''
    const d = days[0]
    return `${d.start_time} - ${d.end_time}`
  }

  function formatDatum(datum) {
    if (!datum) return ''
    return new Date(datum).toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })
  }

  function getDagenTot(datum) {
    if (!datum) return 0
    const verschil = new Date(datum) - new Date()
    return Math.ceil(verschil / (1000 * 60 * 60 * 24))
  }

  const gefilterd = events.filter((e) => {
    const matchZoek = e.titel?.toLowerCase().includes(zoekterm.toLowerCase())
    const matchCategorie = actieveCategorie === 'Alle' || e.categorie === actieveCategorie
    return matchZoek && matchCategorie
  })

  return (
    <div className="min-h-screen bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        className="px-6 py-5 flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => navigate('/home')}
          className="text-white/40 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="w-7 h-7 bg-[#d4e84a] rounded-lg flex items-center justify-center cursor-default"
        >
          <span className="text-[#1a3d2b] font-black text-xs">T</span>
        </motion.div>
        <div className="flex flex-col leading-none">
          <span className="text-white font-bold text-xs tracking-tight">Techniek College</span>
          <span className="text-white/40 text-xs">Rotterdam</span>
        </div>
      </motion.header>

      {/* Hero */}
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
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[#d4e84a] text-xs font-bold uppercase tracking-widest mb-2"
          >
            Aanbod
          </motion.p>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Events</h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {loading ? (
              <div className="h-6 w-36 bg-white/10 rounded-full animate-pulse" />
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">
                <Calendar className="w-3 h-3" />
                {events.length} events beschikbaar
              </span>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Witte content sectie */}
      <div className="flex-1 bg-[#e4e8e2] rounded-t-[2.5rem] px-5 pt-7 pb-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">

          {/* Zoekbalk */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <input
              type="text"
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              placeholder="Zoek een event..."
              className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1a3d2b] transition-all shadow-sm"
            />
          </div>

          {/* Categorie filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categorieen.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActieveCategorie(cat)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  actieveCategorie === cat
                    ? 'bg-[#1a3d2b] text-[#d4e84a]'
                    : 'bg-white text-gray-400 border border-gray-100'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={`${actieveCategorie}-${zoekterm}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="text-xs font-bold text-gray-400 uppercase tracking-widest"
            >
              {loading ? 'Laden...' : `${gefilterd.length} events gevonden`}
            </motion.p>
          </AnimatePresence>

          {/* Skeleton loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                  <div className="h-0.5 bg-gray-100 animate-pulse" />
                  <div className="p-5">
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 space-y-2.5">
                        <div className="h-5 bg-gray-100 rounded-lg w-20 animate-pulse" />
                        <div className="h-3.5 bg-gray-100 rounded-full w-48 animate-pulse" />
                        <div className="h-2.5 bg-gray-100 rounded-full w-full animate-pulse" />
                        <div className="h-2.5 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                        <div className="flex gap-2 pt-1">
                          <div className="h-6 bg-gray-100 rounded-lg w-24 animate-pulse" />
                          <div className="h-6 bg-gray-100 rounded-lg w-20 animate-pulse" />
                          <div className="h-6 bg-gray-100 rounded-lg w-16 animate-pulse" />
                        </div>
                      </div>
                      <div className="shrink-0 w-8 space-y-1">
                        <div className="h-6 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Event lijst */}
          <AnimatePresence mode="wait">
            {!loading && (
              <motion.div
                key={`${actieveCategorie}-${zoekterm}`}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className="flex flex-col gap-3"
              >
                {gefilterd.length === 0 ? (
                  <motion.div
                    variants={cardVariants}
                    className="bg-white rounded-3xl border border-gray-100 p-10 text-center"
                  >
                    <motion.div
                      animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                      className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    >
                      <Calendar className="w-5 h-5 text-gray-300" />
                    </motion.div>
                    <p className="text-sm font-semibold text-gray-400 mb-3">Geen events gevonden</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setZoekterm(''); setActieveCategorie('Alle') }}
                      className="text-xs text-[#1a3d2b] font-bold bg-[#eaf3de] px-3 py-1.5 rounded-lg hover:bg-[#d4e84a] transition-colors"
                    >
                      Filter wissen
                    </motion.button>
                  </motion.div>
                ) : (
                  gefilterd.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      navigate={navigate}
                      formatDatum={formatDatum}
                      getDagenTot={getDagenTot}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default EventOverzicht
