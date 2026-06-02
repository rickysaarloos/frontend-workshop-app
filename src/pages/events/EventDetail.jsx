import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, MapPin, Users, CheckCircle2 } from 'lucide-react'
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
  const [error, setError] = useState(null)
  const [ingeschreven, setIngeschreven] = useState(false)
  const [registreerLoading, setRegistreerLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    async function fetchEvent() {
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
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  async function handleRegistreer() {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    setRegistreerLoading(true)
    try {
      if (ingeschreven) {
        const res = await fetch(`${API_URL}/api/events/${id}/unregister`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        if (!res.ok) throw new Error('Uitschrijven mislukt')
        setIngeschreven(false)
        toast.success('Uitgeschreven van dit event')
      } else {
        const res = await fetch(`${API_URL}/api/events/${id}/register`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
        if (!res.ok) throw new Error('Inschrijven mislukt')
        setIngeschreven(true)
        toast.success('Succesvol ingeschreven!')
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setRegistreerLoading(false)
    }
  }

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

  const datum = event.days?.[0]?.date || event.start_date?.split(' ')?.[0] || ''
  const spotsLeft = event.spots_left ?? null
  const capacity = event.capacity ?? null
  const registered = event.registered ?? null
  const isFull = event.is_full ?? false
  const spotsPct = capacity ? Math.round((registered / capacity) * 100) : null

  return (
    <div className="min-h-screen bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 py-5 flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
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
      <div className="flex-1 bg-gray-50 rounded-t-[2rem] px-5 pt-6 pb-32 flex flex-col gap-4">

        {/* Titel + categorie */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <span className="text-xs bg-[#eaf3de] text-[#1a3d2b] font-semibold px-2 py-1 rounded-lg">
            {mapCategory(event.category)}
          </span>
          <h1 className="text-xl font-bold text-[#1a3d2b] mt-3 leading-snug">
            {event.title}
          </h1>
        </motion.div>

        {/* Info kaart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-5 border border-gray-100 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#eaf3de] rounded-xl flex items-center justify-center shrink-0">
                <CalendarDays className="w-4 h-4 text-[#1a3d2b]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Datum</p>
                <p className="font-semibold text-[#1a3d2b]">{formatDatum(datum)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#eaf3de] rounded-xl flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4 text-[#1a3d2b]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tijd</p>
                <p className="font-semibold text-[#1a3d2b]">{formatTijd(event.days)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#eaf3de] rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-[#1a3d2b]" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Locatie</p>
                <p className="font-semibold text-[#1a3d2b]">{event.location}</p>
              </div>
            </div>

            {/* Beschikbare plekken — alleen tonen als API het teruggeeft */}
            {capacity !== null && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#eaf3de] rounded-xl flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-[#1a3d2b]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Beschikbare plekken</p>
                  <p className="font-semibold text-[#1a3d2b]">
                    {isFull ? 'Vol' : `${spotsLeft} van ${capacity} plekken vrij`}
                  </p>
                  {spotsPct !== null && (
                    <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#1a3d2b] rounded-full transition-all"
                        style={{ width: `${spotsPct}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Beschrijving */}
        {event.description && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl p-5 border border-gray-100"
          >
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">Over dit event</p>
            <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
          </motion.div>
        )}

        {/* Meerdere dagen */}
        {event.days?.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-5 border border-gray-100"
          >
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Programma</p>
            <div className="flex flex-col gap-2">
              {event.days.map((dag, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[#1a3d2b] font-semibold">{formatDatum(dag.date)}</span>
                  <span className="text-gray-400">{dag.start_time} – {dag.end_time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* STICKY INSCHRIJF KNOP */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-50 px-5 py-4 border-t border-gray-100">
        <motion.button
          whileHover={{ scale: registreerLoading ? 1 : 1.02 }}
          whileTap={{ scale: registreerLoading ? 1 : 0.97 }}
          onClick={handleRegistreer}
          disabled={registreerLoading || isFull && !ingeschreven}
          className={`w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            ingeschreven
              ? 'bg-gray-200 text-gray-500'
              : isFull
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#d4e84a] text-[#1a3d2b]'
          }`}
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
            <>
              <CheckCircle2 className="w-4 h-4" />
              Ingeschreven · Uitschrijven
            </>
          ) : isFull ? (
            'Vol — niet meer beschikbaar'
          ) : (
            'Inschrijven'
          )}
        </motion.button>
      </div>
    </div>
  )
}