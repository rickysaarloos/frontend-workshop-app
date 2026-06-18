import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, MapPin, Search, Calendar, Moon, Sun } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'
 
import { API_URL } from '@/lib/config'
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
 
function EventCard({ event, navigate, formatDatum, getDagenTot, dark }) {
  const d = dark
  const dagenTot = getDagenTot(event.datum)
  const isVoorbij = dagenTot < 0
 
  const cardBg    = d ? 'bg-[#1c1c1e]'       : 'bg-white'
  const cardBord  = d ? 'border-white/[0.07]' : 'border-gray-100'
  const catBg     = d ? 'bg-[#d4e84a]/12 text-[#d4e84a]' : 'bg-[#eaf3de] text-[#1a3d2b]'
  const titleClr  = d ? 'text-white'          : 'text-[#1a3d2b]'
  const subClr    = d ? 'text-white/70'       : 'text-gray-500'
  const metaBg    = d ? 'bg-white/[0.06]'     : 'bg-gray-50'
  const metaClr   = d ? 'text-white/70'       : 'text-gray-500'
  const metaIcon  = d ? 'text-white/60'       : 'text-gray-500'
  const countClr  = isVoorbij ? (d ? 'text-white/20' : 'text-gray-300') : (d ? 'text-white' : 'text-[#1a3d2b]')
 
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: d ? '0 16px 36px rgba(0,0,0,0.4)' : '0 16px 36px rgba(26,61,43,0.13)' }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/events/${event.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/events/${event.id}`) } }}
      className={`${cardBg} rounded-3xl border ${cardBord} overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]`}
    >
      <div className={`h-0.5 w-full ${isVoorbij ? (d ? 'bg-white/10' : 'bg-gradient-to-r from-gray-200 to-gray-300') : 'bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]'}`} />
 
      <div className="p-5">
        <div className="flex justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${catBg}`}>
              {event.categorie}
            </span>
 
            <h2 className={`font-bold mt-2 text-sm leading-snug truncate ${titleClr}`}>
              {event.titel}
            </h2>
 
            <p className={`text-xs mt-1 mb-3 line-clamp-2 leading-relaxed ${subClr}`}>
              {event.beschrijving}
            </p>
 
            <div className="flex flex-wrap gap-2">
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${metaBg} ${metaClr}`}>
                <CalendarDays className={`w-3 h-3 ${metaIcon}`} />
                <span className="capitalize">{formatDatum(event.datum)}</span>
              </span>
              {event.tijd && (
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${metaBg} ${metaClr}`}>
                  <Clock className={`w-3 h-3 ${metaIcon}`} />
                  {event.tijd}
                </span>
              )}
              {event.locatie && (
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${metaBg} ${metaClr}`}>
                  <MapPin className={`w-3 h-3 ${metaIcon}`} />
                  {event.locatie}
                </span>
              )}
            </div>
          </div>
 
          <div className="text-right shrink-0 flex flex-col items-end justify-center">
            <p className={`text-lg font-bold ${countClr}`}>
              {isVoorbij ? '–' : dagenTot}
            </p>
            <p className={`text-xs ${d ? 'text-white/60' : 'text-gray-500'}`}>
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
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
 
  function toggleDark() {
    setDark(d => {
      const next = !d
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }
 
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
    const day = days[0]
    return `${day.start_time} - ${day.end_time}`
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
 
  const d = dark
  const contentBg  = d ? 'bg-[#111111]'       : 'bg-[#e4e8e2]'
  const cardBg     = d ? 'bg-[#1c1c1e]'       : 'bg-white'
  const cardBorder = d ? 'border-white/[0.07]' : 'border-gray-100'
  const skelBg     = d ? 'bg-white/[0.07]'    : 'bg-gray-100'
  const labelClr   = d ? 'text-white/60'       : 'text-gray-500'
 
  return (
    <div className="min-h-[100dvh] bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />
 
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        className="px-6 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => navigate('/home')}
            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
            aria-label="Terug naar home"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <img
            src="/img/techniek-college-rotterdam2.jpg"
            alt="Techniek College Rotterdam"
            className="h-8 w-auto object-contain rounded"
          />
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-xs tracking-tight">Techniek College</span>
            <span className="text-white/50 font-medium text-xs tracking-tight">Rotterdam</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.88 }}
          onClick={toggleDark}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
          aria-label="Wissel kleurmodus"
        >
          <AnimatePresence mode="wait">
            {dark ? (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 40, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <Sun className="w-4 h-4" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: 40, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -40, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <Moon className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
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
 
      {/* Content sectie */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pt-7 pb-10`}>
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
 
          {/* Zoekbalk */}
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${d ? 'text-white/20' : 'text-gray-300'}`} />
            <input
              type="text"
              value={zoekterm}
              onChange={(e) => setZoekterm(e.target.value)}
              placeholder="Zoek een event..."
              className={`w-full rounded-2xl pl-10 pr-4 py-3 text-sm outline-none transition-all shadow-sm border focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                d
                  ? 'bg-[#1c1c1e] border-white/[0.07] text-white placeholder:text-white/40 focus:border-white/20'
                  : 'bg-white border-gray-100 text-[#1a3d2b] focus:border-[#1a3d2b]'
              }`}
            />
          </div>
 
          {/* Categorie filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categorieen.map((cat) => (
              <motion.button
                key={cat}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActieveCategorie(cat)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                  actieveCategorie === cat
                    ? 'bg-[#1a3d2b] text-[#d4e84a]'
                    : d
                    ? 'bg-[#1c1c1e] border border-white/[0.07] text-white/70'
                    : 'bg-white text-gray-500 border border-gray-100'
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
              className={`text-xs font-bold uppercase tracking-widest ${labelClr}`}
            >
              {loading ? 'Laden...' : `${gefilterd.length} events gevonden`}
            </motion.p>
          </AnimatePresence>
 
          {/* Skeleton loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden`}>
                  <div className={`h-0.5 ${skelBg} animate-pulse`} />
                  <div className="p-5">
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 space-y-2.5">
                        <div className={`h-5 ${skelBg} rounded-lg w-20 animate-pulse`} />
                        <div className={`h-3.5 ${skelBg} rounded-full w-48 animate-pulse`} />
                        <div className={`h-2.5 ${skelBg} rounded-full w-full animate-pulse`} />
                        <div className={`h-2.5 ${skelBg} rounded-full w-3/4 animate-pulse`} />
                        <div className="flex gap-2 pt-1">
                          <div className={`h-6 ${skelBg} rounded-lg w-24 animate-pulse`} />
                          <div className={`h-6 ${skelBg} rounded-lg w-20 animate-pulse`} />
                          <div className={`h-6 ${skelBg} rounded-lg w-16 animate-pulse`} />
                        </div>
                      </div>
                      <div className="shrink-0 w-8 space-y-1">
                        <div className={`h-6 ${skelBg} rounded animate-pulse`} />
                        <div className={`h-3 ${skelBg} rounded animate-pulse`} />
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
                    className={`${cardBg} rounded-3xl border ${cardBorder} p-10 text-center`}
                  >
                    <motion.div
                      animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                      className={`w-12 h-12 ${d ? 'bg-white/[0.05]' : 'bg-gray-50'} rounded-2xl flex items-center justify-center mx-auto mb-3`}
                    >
                      <Calendar className={`w-5 h-5 ${d ? 'text-white/20' : 'text-gray-300'}`} />
                    </motion.div>
                    <p className={`text-sm font-semibold mb-3 ${d ? 'text-white/70' : 'text-gray-500'}`}>Geen events gevonden</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setZoekterm(''); setActieveCategorie('Alle') }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                        d
                          ? 'text-[#d4e84a] bg-[#d4e84a]/10 hover:bg-[#d4e84a]/20'
                          : 'text-[#1a3d2b] bg-[#eaf3de] hover:bg-[#d4e84a]'
                      }`}
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
                      dark={dark}
                    />
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  )
}
 
export default EventOverzicht