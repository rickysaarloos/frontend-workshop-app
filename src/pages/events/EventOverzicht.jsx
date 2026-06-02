import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, MapPin, Search } from 'lucide-react'
import Footer from '@/components/Footer'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'
const categorieen = ['Alle', 'Studiedag', 'Open dag', 'Gastcollege', 'Expo']

function EventOverzicht() {
  const navigate = useNavigate()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [zoekterm, setZoekterm] = useState('')
  const [actieveCategorie, setActieveCategorie] = useState('Alle')

  useEffect(() => {
    // Token lezen binnen useEffect zodat het altijd up-to-date is
    const token = localStorage.getItem('token')

    if (!token) {
      navigate('/login')
      return
    }

    async function fetchEvents() {
      try {
        setLoading(true)

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

        if (!res.ok) {
          throw new Error(`Kon events niet ophalen (${res.status})`)
        }

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
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

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
      month: 'long',
    })
  }

  function getDagenTot(datum) {
    if (!datum) return 0
    const verschil = new Date(datum) - new Date()
    return Math.ceil(verschil / (1000 * 60 * 60 * 24))
  }

  const gefilterd = events.filter((e) => {
    const matchZoek = e.titel?.toLowerCase().includes(zoekterm.toLowerCase())
    const matchCategorie =
      actieveCategorie === 'Alle' || e.categorie === actieveCategorie
    return matchZoek && matchCategorie
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a3d2b] text-white">
        <div className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Laden...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a3d2b] text-red-300 px-6 text-center">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a3d2b] flex flex-col">

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-5 flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="text-white/40 hover:text-white p-1.5"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        <div className="flex flex-col leading-none">
          <span className="text-white font-bold text-xs">Techniek College</span>
          <span className="text-white/40 text-xs">Rotterdam</span>
        </div>
      </motion.header>

      {/* CONTENT */}
      <div className="flex-1 bg-gray-50 rounded-t-[2rem] px-5 pt-6 pb-8">

        {/* Zoekbalk */}
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            placeholder="Zoek een event..."
            className="w-full bg-white border border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1a3d2b] transition-all"
          />
        </div>

        {/* Categorie filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categorieen.map((cat) => (
            <button
              key={cat}
              onClick={() => setActieveCategorie(cat)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
                actieveCategorie === cat
                  ? 'bg-[#1a3d2b] text-[#d4e84a]'
                  : 'bg-white text-gray-400 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          {gefilterd.length} events gevonden
        </p>

        <AnimatePresence mode="wait">
          <motion.div className="flex flex-col gap-3">
            {gefilterd.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-400 text-center mt-10"
              >
                Geen events gevonden.
              </motion.p>
            ) : (
              gefilterd.map((event) => {
                const dagenTot = getDagenTot(event.datum)

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="bg-white rounded-3xl p-5 cursor-pointer border border-gray-100 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs bg-[#eaf3de] text-[#1a3d2b] font-semibold px-2 py-1 rounded-lg">
                          {event.categorie}
                        </span>

                        <h2 className="font-bold text-[#1a3d2b] mt-2 truncate">
                          {event.titel}
                        </h2>

                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {event.beschrijving}
                        </p>

                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                          <div className="flex gap-2 items-center">
                            <CalendarDays className="w-3 h-3 shrink-0" />
                            {formatDatum(event.datum)}
                          </div>
                          <div className="flex gap-2 items-center">
                            <Clock className="w-3 h-3 shrink-0" />
                            {event.tijd}
                          </div>
                          <div className="flex gap-2 items-center">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {event.locatie}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className={`text-lg font-bold ${dagenTot < 0 ? 'text-gray-300' : 'text-[#1a3d2b]'}`}>
                          {dagenTot < 0 ? '–' : dagenTot}
                        </p>
                        <p className="text-xs text-gray-400">
                          {dagenTot < 0 ? 'voorbij' : 'dagen'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  )
}

export default EventOverzicht