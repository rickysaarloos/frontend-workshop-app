import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  ChevronLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Calendar,
  Moon,
  Sun
} from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'

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
  const day = days[0]
  return `${day.start_time} - ${day.end_time}`
}

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ingeschreven, setIngeschreven] = useState(false)
  const [registreerLoading, setRegistreerLoading] = useState(false)
  const [dark, setDark] = useState(() =>
    localStorage.getItem('theme') === 'dark'
  )

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

      if (res.status === 401) {
        navigate('/login')
        return
      }

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
    if (!token) {
      navigate('/login')
      return
    }

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

        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Uitschrijven mislukt')

        setIngeschreven(false)
        toast.success(data.message || 'Uitgeschreven van dit event')
      } else {
        const res = await fetch(`${API_URL}/api/events/${id}/register`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
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

  const datum =
    event?.days?.[0]?.date || event?.start_date?.split(' ')?.[0] || ''

  const spotsLeft = event?.spots_left ?? null
  const capacity = event?.capacity ?? null
  const registered = event?.registered ?? null
  const isFull = event?.is_full ?? false

  const spotsPct = capacity
    ? Math.round((registered / capacity) * 100)
    : null

  const d = dark

  const contentBg = d ? 'bg-[#111111]' : 'bg-[#e4e8e2]'
  const cardBg = d ? 'bg-[#1c1c1e]' : 'bg-white'
  const cardBorder = d ? 'border-white/[0.07]' : 'border-gray-100'
  const skelBg = d ? 'bg-white/[0.07]' : 'bg-gray-100'
  const titleClr = d ? 'text-white' : 'text-[#1a3d2b]'
  const subClr = d ? 'text-white/45' : 'text-gray-400'
  const iconBg =
    d
      ? 'bg-[#d4e84a]/12'
      : 'bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30'
  const iconClr = d ? 'text-[#d4e84a]' : 'text-[#1a3d2b]'
  const barBg = d ? 'bg-white/10' : 'bg-gray-100'
  const rowBorder = d ? 'border-white/[0.05]' : 'border-gray-50'

  return (
    <div className="min-h-[100dvh] bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />

      {/* REST VAN JE UI EXACT ZOALS JE HEM HEBT */}
      {/* + Footer onderaan */}
      <Footer />
    </div>
  )
}