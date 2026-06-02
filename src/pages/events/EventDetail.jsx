import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, MapPin, Users, CheckCircle, Calendar } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'

function mapCategory(cat) {
  const map = {
    conference: 'Studiedag',
    open_day: 'Open dag',
    lecture: 'Gastcollege',
    expo: 'Expo',
  }
  return map[cat] || cat
}

function formatDatum(datum) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatDatumKort(datum) {
  if (!datum) return ''
  return new Date(datum).toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTijd(days) {
  if (!days?.length) return ''
  const d = days[0]
  return `${d.start_time} - ${d.end_time}`
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ingeschreven, setIngeschreven] = useState(false)
  const [registreerLoading, setRegistreerLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchEvent(token)
  }, [id])

  async function fetchEvent(token) {
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      if (res.status === 401) { navigate('/login'); return }
      if (!res.ok) throw new Error(`Kon event niet ophalen (${res.status})`)

      const json = await res.json()
      const e = json.data
      setEvent(e)
      setIngeschreven(e.is_registered ?? false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegistreer() {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    setRegistreerLoading(true)
    try {
      if (ingeschreven) {
        const res = await fetch(`${API_URL}/api/events/${id}/unregister`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Uitschrijven mislukt')
        setIngeschreven(false)
        toast.success(data.message || 'Uitgeschreven van dit event')
      } else {
        const res = await fetch(`${API_URL}/api/events/${id}/register`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Inschrijven mislukt')
        setIngeschreven(true)
        toast.success(data.message || 'Succesvol ingeschreven!')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRegistreerLoading(false)
    }
  }

  const datum = event?.days?.[0]?.date || event?.start_date?.split(' ')?.[0] || ''
  const spotsLeft = event?.spots_left ?? null
  const capacity = event?.capacity ?? null
  const registered = event?.registered ?? null
  const isFull = event?.is_full ?? false
  const spotsPct = capacity ? Math.round((registered / capacity) * 100) : null

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
          onClick={() => navigate(-1)}
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
            Event
          </motion.p>

          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-56 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-4 w-24 bg-white/10 rounded-full animate-pulse" />
            </div>
          ) : event ? (
            <>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight mb-2">
                {event.title}
              </h1>
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">
                <Calendar className="w-3 h-3" />
                {mapCategory(event.category)}
              </span>
            </>
          ) : null}
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#e4e8e2] rounded-t-[2.5rem] px-5 pt-7 pb-10">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                  <div className="h-0.5 bg-gray-100 animate-pulse" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 w-32 bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-3 w-full bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Niet gevonden */}
          {!loading && !event && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 p-10 text-center"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400 mb-3">Event niet gevonden</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/events')}
                className="text-xs text-[#1a3d2b] font-bold bg-[#eaf3de] px-3 py-1.5 rounded-lg hover:bg-[#d4e84a] transition-colors"
              >
                Terug naar overzicht
              </motion.button>
            </motion.div>
          )}

          {!loading && event && (
            <>
              {/* Ingeschreven badge */}
              <AnimatePresence>
                {ingeschreven && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 bg-[#1a3d2b] text-[#d4e84a] px-4 py-3 rounded-2xl text-sm font-bold"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Je bent ingeschreven voor dit event
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info kaart */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.1 }}
                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm"
              >
                <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                <div className="p-5 flex flex-col gap-4">

                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30 p-2.5 rounded-xl shrink-0">
                      <CalendarDays className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Datum</p>
                      <p className="text-sm font-semibold text-[#1a3d2b] capitalize">
                        {formatDatum(datum)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30 p-2.5 rounded-xl shrink-0">
                      <Clock className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Tijd</p>
                      <p className="text-sm font-semibold text-[#1a3d2b]">{formatTijd(event.days)}</p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30 p-2.5 rounded-xl shrink-0">
                        <MapPin className="w-4 h-4 text-[#1a3d2b]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Locatie</p>
                        <p className="text-sm font-semibold text-[#1a3d2b]">{event.location}</p>
                      </div>
                    </div>
                  )}

                  {capacity !== null && (
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${isFull ? 'bg-red-50' : 'bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30'}`}>
                        <Users className={`w-4 h-4 ${isFull ? 'text-red-400' : 'text-[#1a3d2b]'}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400">Beschikbare plekken</p>
                        <p className={`text-sm font-semibold ${isFull ? 'text-red-500' : 'text-[#1a3d2b]'}`}>
                          {isFull ? 'Vol — geen plekken meer beschikbaar' : `${spotsLeft} van ${capacity} plekken vrij`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Voortgangsbalk */}
                  {spotsPct !== null && (
                    <div className="flex items-center gap-2.5">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${spotsPct}%` }}
                          transition={{ duration: 0.9, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                          className={`h-full rounded-full ${isFull ? 'bg-gradient-to-r from-red-300 to-red-400' : 'bg-gradient-to-r from-[#1a3d2b] to-[#4a8c60]'}`}
                        />
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${isFull ? 'text-red-400' : 'text-[#1a3d2b]'}`}>
                        {registered}/{capacity}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Beschrijving */}
              {event.description && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.18 }}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                  <div className="p-5">
                    <h2 className="text-sm font-bold text-[#1a3d2b] mb-3">Over dit event</h2>
                    <p className="text-sm text-gray-500 leading-relaxed">{event.description}</p>
                  </div>
                </motion.div>
              )}

              {/* Meerdere dagen / programma */}
              {event.days?.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.26 }}
                  className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm"
                >
                  <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                  <div className="p-5">
                    <h2 className="text-sm font-bold text-[#1a3d2b] mb-3">Programma</h2>
                    <div className="flex flex-col gap-2">
                      {event.days.map((dag, i) => (
                        <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                          <span className="text-[#1a3d2b] font-semibold capitalize">{formatDatumKort(dag.date)}</span>
                          <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg">{dag.start_time} – {dag.end_time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actie knop */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.34 }}
              >
                <motion.button
                  whileHover={{ scale: registreerLoading ? 1 : 1.02 }}
                  whileTap={{ scale: registreerLoading ? 1 : 0.98 }}
                  onClick={handleRegistreer}
                  disabled={registreerLoading || (isFull && !ingeschreven)}
                  className={`w-full rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors
                    ${ingeschreven
                      ? 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'
                      : isFull
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-[#d4e84a] text-[#1a3d2b] hover:bg-[#c8dc3e]'
                    } disabled:opacity-60`}
                >
                  {registreerLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Bezig...
                    </>
                  ) : ingeschreven ? (
                    'Uitschrijven'
                  ) : isFull ? (
                    'Vol — niet meer beschikbaar'
                  ) : (
                    'Inschrijven'
                  )}
                </motion.button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
