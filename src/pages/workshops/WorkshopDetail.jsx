import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, Users, CheckCircle, MapPin, BookOpen, User, Tag, Moon, Sun, AlertTriangle, ClipboardList, Leaf, HelpCircle, ChevronDown, Download, ScanLine, MessageSquare, Star, Send, ArrowLeftRight } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'

import { API_URL } from '@/lib/config'

const EASE = [0.22, 1, 0.36, 1]

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function WorkshopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [workshop, setWorkshop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ingeschreven, setIngeschreven] = useState(false)
  const [registratieLoading, setRegistratieLoading] = useState(false)
  const [geselecteerdeSessie, setGeselecteerdeSessie] = useState(null)
  const [faq, setFaq] = useState([])
  const [faqLoading, setFaqLoading] = useState(false)
  const [openFaqId, setOpenFaqId] = useState(null)
  const [aanwezigheidGeregistreerd, setAanwezigheidGeregistreerd] = useState(false)
  const [aanwezigheidLoading, setAanwezigheidLoading] = useState(false)
  const [vragenlijst, setVragenlijst] = useState([])
  const [vragenlijstLoading, setVragenlijstLoading] = useState(false)
  const [antwoorden, setAntwoorden] = useState({})
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackVerzonden, setFeedbackVerzonden] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const shouldReduce = useReducedMotion()

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
    fetchWorkshop()
    fetchFaq()
    fetchVragenlijst()
  }, [id])

  async function fetchVragenlijst() {
    setVragenlijstLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/workshops/${id}/vragenlijst`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setVragenlijst(data.data || [])
      setFeedbackVerzonden(data.feedback_submitted || data.data?.feedback_submitted || false)
    } catch (error) {
      console.error('Vragenlijst ophalen mislukt:', error)
    } finally {
      setVragenlijstLoading(false)
    }
  }

  async function fetchFaq() {
    setFaqLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/workshops/${id}/faq`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setFaq(data.data || [])
    } catch (error) {
      console.error('FAQ ophalen mislukt:', error)
    } finally {
      setFaqLoading(false)
    }
  }

  async function fetchWorkshop() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/workshops/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setWorkshop(data.data)
      setIngeschreven(data.data.is_registered)
      setAanwezigheidGeregistreerd(data.data.is_attended || false)
    } catch (error) {
      toast.error('Workshop ophalen mislukt')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleInschrijven() {
    const isSessionMode = workshop.registration_mode === 'session'
    if (isSessionMode && !geselecteerdeSessie) {
      toast.error('Kies eerst een sessie')
      return
    }

    setRegistratieLoading(true)
    try {
      const token = localStorage.getItem('token')
      const body = isSessionMode ? { session_id: geselecteerdeSessie } : {}
      const response = await fetch(`${API_URL}/api/workshops/${id}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      toast.success(data.message || 'Je bent ingeschreven!')
      await fetchWorkshop()
    } catch (error) {
      toast.error(error.message || 'Inschrijven mislukt')
    } finally {
      setRegistratieLoading(false)
    }
  }

  async function handleAanwezigheidRegistreren() {
    setAanwezigheidLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/workshops/${id}/aanwezigheid`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      toast.success(data.message || 'Aanwezigheid geregistreerd!')
      setAanwezigheidGeregistreerd(true)
      await fetchWorkshop()
    } catch (error) {
      toast.error(error.message || 'Registratie mislukt')
    } finally {
      setAanwezigheidLoading(false)
    }
  }

  function setAntwoord(vraagId, waarde) {
    setAntwoorden(prev => ({ ...prev, [vraagId]: waarde }))
  }

  async function handleFeedbackVersturen(e) {
    e.preventDefault()

    const onbeantwoord = vragenlijst.filter(
      v => v.required && (antwoorden[v.id] === undefined || antwoorden[v.id] === '')
    )
    if (onbeantwoord.length > 0) {
      toast.error('Beantwoord eerst alle verplichte vragen')
      return
    }

    setFeedbackLoading(true)
    try {
      const token = localStorage.getItem('token')
      const answers = vragenlijst
        .filter(v => antwoorden[v.id] !== undefined && antwoorden[v.id] !== '')
        .map(v => ({ question_id: v.id, answer: antwoorden[v.id] }))
      const response = await fetch(`${API_URL}/api/workshops/${id}/feedback`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      toast.success(data.message || 'Bedankt voor je feedback!')
      setFeedbackVerzonden(true)
    } catch (error) {
      toast.error(error.message || 'Enquête versturen mislukt')
    } finally {
      setFeedbackLoading(false)
    }
  }

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  const d = dark
  const contentBg  = d ? 'bg-[#111111]'        : 'bg-[#e4e8e2]'
  const cardBg     = d ? 'bg-[#1c1c1e]'        : 'bg-white'
  const cardBorder = d ? 'border-white/[0.08]' : 'border-black/[0.06]'
  const hairline   = d ? 'border-white/[0.07]' : 'border-[#1a3d2b]/[0.07]'
  const skelBg     = d ? 'bg-white/[0.07]'     : 'bg-black/[0.05]'
  const titleClr   = d ? 'text-white'          : 'text-[#1a3d2b]'
  const bodyClr    = d ? 'text-white/60'       : 'text-[#1a3d2b]/70'
  const subClr     = d ? 'text-white/40'       : 'text-[#1a3d2b]/45'
  const labelClr   = d ? 'text-white/35'       : 'text-[#1a3d2b]/45'
  const cardShadow = d ? 'shadow-[0_2px_24px_rgba(0,0,0,0.30)]' : 'shadow-[0_1px_2px_rgba(26,61,43,0.04),0_18px_40px_-24px_rgba(26,61,43,0.22)]'
  const barBg      = d ? 'bg-white/10'         : 'bg-[#1a3d2b]/[0.08]'
  const headIcon   = d ? 'text-white/45'       : 'text-[#1a3d2b]/55'

  // Rustige, getierde motion — respecteert useReducedMotion
  const stack = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }
  const rise = shouldReduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }

  return (
    <div className="min-h-[100dvh] bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex items-center justify-between px-6 py-5"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => navigate('/workshops')}
            className="rounded-xl p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
          <img
            src="/img/techniek-college-rotterdam2.jpg"
            alt="Techniek College Rotterdam"
            className="h-8 w-auto rounded object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold tracking-tight text-white">Techniek College</span>
            <span className="text-xs font-medium tracking-tight text-white/50">Rotterdam</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
          aria-label="Wissel kleurmodus"
        >
          <AnimatePresence mode="wait">
            {dark ? (
              <motion.div
                key="sun"
                initial={shouldReduce ? false : { opacity: 0, rotate: -40, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={shouldReduce ? {} : { opacity: 0, rotate: 40, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <Sun className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={shouldReduce ? false : { opacity: 0, rotate: 40, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={shouldReduce ? {} : { opacity: 0, rotate: -40, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                <Moon className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.header>

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pb-12 pt-3">
        {/* Statische, rustige gloed */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d4e84a]/[0.08] blur-2xl" />

        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="relative max-w-2xl"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4e84a]">
            Workshop
          </p>

          {loading ? (
            <div className="space-y-3">
              <div className="h-9 w-64 animate-pulse rounded-xl bg-white/10" />
              <div className="h-5 w-36 animate-pulse rounded-full bg-white/10" />
            </div>
          ) : workshop ? (
            <>
              <h1 className="mb-3 text-[2rem] font-black leading-[1.02] tracking-[-0.03em] text-white md:text-[2.6rem]">
                {workshop.title}
              </h1>
              {workshop.teacher && (
                <span className="inline-flex items-center gap-2 text-sm font-medium text-white/55">
                  <User className="h-4 w-4 text-[#d4e84a]" />
                  {workshop.teacher}
                </span>
              )}
            </>
          ) : null}
        </motion.div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pb-10 pt-8 transition-colors duration-300`}>
        <div className="mx-auto flex max-w-2xl flex-col gap-5">

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${cardBg} rounded-[26px] border ${cardBorder} p-5`}>
                  <div className="space-y-3">
                    <div className={`h-4 w-32 animate-pulse rounded-full ${skelBg}`} />
                    <div className={`h-3 w-full animate-pulse rounded-full ${skelBg}`} />
                    <div className={`h-3 w-3/4 animate-pulse rounded-full ${skelBg}`} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Niet gevonden */}
          {!loading && !workshop && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${cardBg} rounded-[26px] border ${cardBorder} p-10 text-center`}
            >
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${d ? 'bg-white/[0.05]' : 'bg-[#1a3d2b]/[0.04]'}`}>
                <BookOpen className={`h-5 w-5 ${d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
              </div>
              <p className={`mb-4 text-sm font-semibold ${subClr}`}>Workshop niet gevonden</p>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate('/workshops')}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                  d ? 'bg-[#d4e84a]/10 text-[#d4e84a] hover:bg-[#d4e84a]/20' : 'bg-[#1a3d2b] text-[#d4e84a] hover:bg-[#16331f]'
                }`}
              >
                Terug naar overzicht
              </motion.button>
            </motion.div>
          )}

          {!loading && workshop && (
            <motion.div variants={stack} initial="hidden" animate="visible" className="flex flex-col gap-5">

              {/* Ingeschreven status */}
              <AnimatePresence>
                {ingeschreven && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2.5 rounded-2xl bg-[#1a3d2b] px-4 py-3 text-sm font-bold text-[#d4e84a]"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    Je bent ingeschreven voor deze workshop
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Details — spec sheet (geen gradient-streep) */}
              <motion.div
                variants={rise}
                className={`${cardBg} ${cardShadow} rounded-[26px] border ${cardBorder} p-5`}
              >
                <div className="flex items-center justify-between gap-4 py-3 pt-0">
                  <span className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${labelClr}`}>
                    <CalendarDays className="h-3.5 w-3.5 opacity-70" />
                    Datum
                  </span>
                  <span className={`text-right text-sm font-semibold capitalize ${titleClr}`}>
                    {formatDatum(workshop.start_date.split(' ')[0])}
                  </span>
                </div>
                <div className={`border-t ${hairline}`} />

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${labelClr}`}>
                    <Clock className="h-3.5 w-3.5 opacity-70" />
                    Tijd
                  </span>
                  <span className={`text-right text-sm font-semibold tabular-nums ${titleClr}`}>
                    {workshop.start_date.split(' ')[1]} - {workshop.end_date.split(' ')[1]}
                  </span>
                </div>
                <div className={`border-t ${hairline}`} />

                <div className="flex items-center justify-between gap-4 py-3">
                  <span className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${labelClr}`}>
                    <MapPin className="h-3.5 w-3.5 opacity-70" />
                    Locatie
                  </span>
                  <span className={`text-right text-sm font-semibold ${titleClr}`}>{workshop.location}</span>
                </div>
                <div className={`border-t ${hairline}`} />

                <div className="flex items-center justify-between gap-4 pt-3">
                  <span className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider ${labelClr}`}>
                    <Users className="h-3.5 w-3.5 opacity-70" />
                    Plekken
                  </span>
                  <span className={`text-right text-sm font-semibold tabular-nums ${workshop.is_full ? 'text-red-500' : titleClr}`}>
                    {workshop.is_full ? 'Volgeboekt' : `${workshop.spots_left} van ${workshop.capacity} vrij`}
                  </span>
                </div>

                {/* Bezetting */}
                <div className="mt-3 flex items-center gap-3">
                  <div className={`h-1.5 flex-1 overflow-hidden rounded-full ${barBg}`}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.round((workshop.registered / workshop.capacity) * 100)}%` }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
                      className={`h-full rounded-full ${workshop.is_full ? 'bg-red-400' : (d ? 'bg-[#d4e84a]' : 'bg-[#1a3d2b]')}`}
                    />
                  </div>
                  <span className={`shrink-0 text-xs font-bold tabular-nums ${workshop.is_full ? 'text-red-400' : titleClr}`}>
                    {workshop.registered}<span className={subClr}>/{workshop.capacity}</span>
                  </span>
                </div>
              </motion.div>

              {/* Beschrijving — editorial blok (geen kaart) */}
              <motion.section variants={rise} className="px-1">
                <h2 className={`flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] ${titleClr}`}>
                  <span className="h-4 w-1 rounded-full bg-[#d4e84a]" />
                  <BookOpen className={`h-4 w-4 ${headIcon}`} />
                  Over deze workshop
                </h2>
                <p className={`mt-3 max-w-prose text-[15px] leading-relaxed ${bodyClr}`}>{workshop.description}</p>
              </motion.section>

              {/* Waarschuwingen — de enige bewust gekleurde uitzondering */}
              {workshop.important_notes && (
                <motion.div
                  variants={rise}
                  className={`overflow-hidden rounded-[26px] border ${d ? 'border-amber-500/25 bg-amber-950/25' : 'border-amber-200 bg-amber-50'}`}
                >
                  <div className="flex gap-4 p-5">
                    <span className={`mt-0.5 h-auto w-1 shrink-0 rounded-full ${d ? 'bg-amber-400/70' : 'bg-amber-400'}`} />
                    <div>
                      <h2 className={`flex items-center gap-2 text-base font-bold ${d ? 'text-amber-300' : 'text-amber-700'}`}>
                        <AlertTriangle className="h-4 w-4" />
                        Belangrijke informatie
                      </h2>
                      <p className={`mt-2 text-[15px] leading-relaxed ${d ? 'text-amber-200/75' : 'text-amber-800/80'}`}>{workshop.important_notes}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Benodigdheden — editorial blok */}
              {workshop.requirements && (Array.isArray(workshop.requirements) ? workshop.requirements.length > 0 : true) && (
                <motion.section variants={rise} className="px-1">
                  <h2 className={`flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] ${titleClr}`}>
                    <span className="h-4 w-1 rounded-full bg-[#d4e84a]" />
                    <ClipboardList className={`h-4 w-4 ${headIcon}`} />
                    Benodigdheden
                  </h2>
                  {Array.isArray(workshop.requirements) ? (
                    <ul className="mt-3 flex flex-col gap-2.5">
                      {workshop.requirements.map((item, i) => (
                        <li key={i} className={`flex items-start gap-3 text-[15px] leading-relaxed ${bodyClr}`}>
                          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${d ? 'bg-[#d4e84a]/60' : 'bg-[#1a3d2b]/40'}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={`mt-3 max-w-prose text-[15px] leading-relaxed ${bodyClr}`}>{workshop.requirements}</p>
                  )}
                </motion.section>
              )}

              {/* Dieetwensen & allergenen — editorial blok */}
              {(workshop.dietary_info || workshop.allergens) && (
                <motion.section variants={rise} className="px-1">
                  <h2 className={`flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] ${titleClr}`}>
                    <span className="h-4 w-1 rounded-full bg-[#d4e84a]" />
                    <Leaf className={`h-4 w-4 ${headIcon}`} />
                    Dieetwensen &amp; allergenen
                  </h2>
                  {(() => {
                    const info = workshop.dietary_info || workshop.allergens
                    return Array.isArray(info) ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {info.map((item, i) => (
                          <span key={i} className={`rounded-full px-3 py-1 text-xs font-semibold ${d ? 'bg-[#d4e84a]/12 text-[#d4e84a]/80' : 'bg-[#eaf3de] text-[#2c5a3d]'}`}>
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className={`mt-3 max-w-prose text-[15px] leading-relaxed ${bodyClr}`}>{info}</p>
                    )
                  })()}
                </motion.section>
              )}

              {/* Aanwezigheid & presentatie — interactieve kaart */}
              {ingeschreven && (
                <motion.div
                  variants={rise}
                  className={`${cardBg} ${cardShadow} rounded-[26px] border ${cardBorder} p-5`}
                >
                  <h2 className={`mb-4 flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] ${titleClr}`}>
                    <span className="h-4 w-1 rounded-full bg-[#d4e84a]" />
                    <ScanLine className={`h-4 w-4 ${headIcon}`} />
                    Aanwezigheid
                  </h2>

                  <div className="flex flex-col gap-3">
                    {aanwezigheidGeregistreerd ? (
                      <div className="flex items-center gap-2.5 rounded-2xl bg-[#1a3d2b] px-4 py-3 text-sm font-bold text-[#d4e84a]">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        Aanwezigheid geregistreerd
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: aanwezigheidLoading ? 1 : 1.015 }}
                        whileTap={{ scale: aanwezigheidLoading ? 1 : 0.98 }}
                        onClick={handleAanwezigheidRegistreren}
                        disabled={aanwezigheidLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d4e84a] py-3.5 text-sm font-bold text-[#1a3d2b] transition-colors hover:bg-[#c8dc3e] disabled:opacity-60"
                      >
                        {aanwezigheidLoading ? <><SpinnerIcon />Registreren...</> : <><ScanLine className="h-4 w-4" />Aanwezigheid registreren</>}
                      </motion.button>
                    )}

                    {aanwezigheidGeregistreerd && (workshop.presentation_url || workshop.slides_url || workshop.presentation) && (
                      <a
                        href={workshop.presentation_url || workshop.slides_url || workshop.presentation}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors ${
                          d ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-[#eaf3de] text-[#1a3d2b] hover:bg-[#d4e84a]/40'
                        }`}
                      >
                        <Download className="h-4 w-4" />
                        Presentatie downloaden
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Enquête / feedback — interactieve kaart */}
              {ingeschreven && (vragenlijstLoading || vragenlijst.length > 0) && (
                <motion.div
                  variants={rise}
                  className={`${cardBg} ${cardShadow} rounded-[26px] border ${cardBorder} p-5`}
                >
                  <h2 className={`mb-4 flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] ${titleClr}`}>
                    <span className="h-4 w-1 rounded-full bg-[#d4e84a]" />
                    <MessageSquare className={`h-4 w-4 ${headIcon}`} />
                    Enquête
                  </h2>

                  {vragenlijstLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-16 animate-pulse rounded-2xl ${skelBg}`} />
                      ))}
                    </div>
                  ) : feedbackVerzonden ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                      className="flex flex-col items-center py-6 text-center"
                    >
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a3d2b]">
                        <CheckCircle className="h-6 w-6 text-[#d4e84a]" />
                      </div>
                      <p className={`text-sm font-bold ${titleClr}`}>Bedankt voor je feedback!</p>
                      <p className={`mt-1 text-xs ${subClr}`}>Je enquête is succesvol verstuurd.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleFeedbackVersturen} className="flex flex-col gap-5">
                      {vragenlijst.map((vraag, i) => {
                        const type = vraag.type || 'text'
                        const huidig = antwoorden[vraag.id]
                        return (
                          <div key={vraag.id} className="flex flex-col gap-2">
                            <label className={`text-sm font-semibold ${titleClr}`}>
                              <span className={`mr-1 tabular-nums ${subClr}`}>{i + 1}.</span>
                              {vraag.question || vraag.label}
                              {vraag.required && <span className="ml-1 text-red-400">*</span>}
                            </label>

                            {type === 'rating' ? (
                              <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4, 5].map(score => {
                                  const actief = (huidig || 0) >= score
                                  return (
                                    <motion.button
                                      key={score}
                                      type="button"
                                      whileHover={{ scale: 1.12 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => setAntwoord(vraag.id, score)}
                                      className="p-0.5"
                                      aria-label={`${score} sterren`}
                                    >
                                      <Star
                                        className={`h-7 w-7 transition-colors ${
                                          actief ? 'fill-[#d4e84a] text-[#d4e84a]' : (d ? 'text-white/15' : 'text-[#1a3d2b]/15')
                                        }`}
                                      />
                                    </motion.button>
                                  )
                                })}
                              </div>
                            ) : type === 'choice' && Array.isArray(vraag.options) ? (
                              <div className="flex flex-wrap gap-2">
                                {vraag.options.map((optie, oi) => {
                                  const waarde = optie.value ?? optie
                                  const tekst = optie.label ?? optie
                                  const gekozen = huidig === waarde
                                  return (
                                    <motion.button
                                      key={oi}
                                      type="button"
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => setAntwoord(vraag.id, waarde)}
                                      className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                                        gekozen
                                          ? (d ? 'border-[#d4e84a]/50 bg-[#d4e84a]/10 text-[#d4e84a]' : 'border-[#1a3d2b] bg-[#eaf3de] text-[#1a3d2b]')
                                          : (d ? 'border-white/[0.08] text-white/55 hover:border-white/20' : 'border-[#1a3d2b]/10 text-[#1a3d2b]/55 hover:border-[#1a3d2b]/30')
                                      }`}
                                    >
                                      {tekst}
                                    </motion.button>
                                  )
                                })}
                              </div>
                            ) : (
                              <textarea
                                value={huidig || ''}
                                onChange={e => setAntwoord(vraag.id, e.target.value)}
                                rows={3}
                                placeholder="Je antwoord..."
                                className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-colors ${
                                  d
                                    ? 'border-white/[0.08] bg-white/[0.05] text-white placeholder:text-white/25 focus:border-[#d4e84a]/40'
                                    : 'border-[#1a3d2b]/10 bg-[#f6faf2] text-[#1a3d2b] placeholder:text-[#1a3d2b]/30 focus:border-[#1a3d2b]/40'
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}

                      <motion.button
                        whileHover={{ scale: feedbackLoading ? 1 : 1.015 }}
                        whileTap={{ scale: feedbackLoading ? 1 : 0.98 }}
                        type="submit"
                        disabled={feedbackLoading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a3d2b] py-3.5 text-sm font-bold text-[#d4e84a] transition-colors hover:bg-[#16331f] disabled:opacity-60"
                      >
                        {feedbackLoading ? <><SpinnerIcon />Versturen...</> : <><Send className="h-4 w-4" />Enquête versturen</>}
                      </motion.button>
                    </form>
                  )}
                </motion.div>
              )}

              {/* Sessie-selectie — interactieve kaart */}
              {workshop.registration_mode === 'session' && workshop.sessions?.length > 0 && !ingeschreven && (
                <motion.div
                  variants={rise}
                  className={`${cardBg} ${cardShadow} rounded-[26px] border ${cardBorder} p-5`}
                >
                  <h2 className={`mb-4 flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] ${titleClr}`}>
                    <span className="h-4 w-1 rounded-full bg-[#d4e84a]" />
                    <Tag className={`h-4 w-4 ${headIcon}`} />
                    Kies een sessie
                  </h2>
                  <div className="flex flex-col gap-2">
                    {workshop.sessions.map((sessie) => {
                      const isGekozen = geselecteerdeSessie === sessie.id
                      return (
                        <motion.button
                          key={sessie.id}
                          whileHover={{ scale: sessie.is_full ? 1 : 1.01 }}
                          whileTap={{ scale: sessie.is_full ? 1 : 0.98 }}
                          disabled={sessie.is_full}
                          onClick={() => setGeselecteerdeSessie(isGekozen ? null : sessie.id)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-150
                            ${sessie.is_full
                              ? (d ? 'cursor-not-allowed border-white/[0.05] bg-white/[0.03] opacity-50' : 'cursor-not-allowed border-[#1a3d2b]/10 bg-[#1a3d2b]/[0.03] opacity-50')
                              : isGekozen
                                ? (d ? 'border-[#d4e84a]/50 bg-[#d4e84a]/10' : 'border-[#1a3d2b] bg-[#eaf3de]')
                                : (d ? 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.06]' : 'border-[#1a3d2b]/10 hover:border-[#1a3d2b]/30 hover:bg-[#1a3d2b]/[0.03]')
                            }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className={`text-sm font-semibold tabular-nums ${titleClr}`}>
                                {sessie.date} · {sessie.start_time} - {sessie.end_time}
                              </p>
                              <p className={`mt-0.5 text-xs ${subClr}`}>{sessie.location}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              {sessie.is_full ? (
                                <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-400">vol</span>
                              ) : (
                                <span className={`text-xs tabular-nums ${subClr}`}>{sessie.spots_left} vrij</span>
                              )}
                              {isGekozen && <CheckCircle className={`h-4 w-4 ${d ? 'text-[#d4e84a]' : 'text-[#1a3d2b]'}`} />}
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* FAQ — flush accordion op de sheet */}
              {(faqLoading || faq.length > 0) && (
                <motion.section variants={rise} className="px-1">
                  <h2 className={`mb-2 flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] ${titleClr}`}>
                    <span className="h-4 w-1 rounded-full bg-[#d4e84a]" />
                    <HelpCircle className={`h-4 w-4 ${headIcon}`} />
                    Veelgestelde vragen
                  </h2>
                  {faqLoading ? (
                    <div className="mt-3 space-y-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-12 animate-pulse rounded-2xl ${skelBg}`} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {faq.map((item) => {
                        const isOpen = openFaqId === item.id
                        return (
                          <div key={item.id} className={`border-b ${hairline}`}>
                            <button
                              onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                              className="flex w-full items-center justify-between gap-3 py-4 text-left"
                            >
                              <span className={`text-sm font-semibold ${isOpen ? titleClr : bodyClr}`}>{item.question}</span>
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2, ease: EASE }}
                                className="shrink-0"
                              >
                                <ChevronDown className={`h-4 w-4 ${isOpen ? 'text-[#d4e84a]' : subClr}`} />
                              </motion.div>
                            </button>
                            <AnimatePresence initial={false}>
                              {isOpen && (
                                <motion.div
                                  key="answer"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.24, ease: EASE }}
                                  className="overflow-hidden"
                                >
                                  <p className={`pb-4 text-[15px] leading-relaxed ${bodyClr}`}>{item.answer}</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </motion.section>
              )}

              {/* Actie — primaire CTA */}
              <motion.div variants={rise} className="flex flex-col gap-2 pt-1">
                {!ingeschreven ? (
                  <motion.button
                    whileHover={{ scale: registratieLoading || workshop.is_full ? 1 : 1.015 }}
                    whileTap={{ scale: registratieLoading || workshop.is_full ? 1 : 0.98 }}
                    onClick={handleInschrijven}
                    disabled={registratieLoading || workshop.is_full}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-colors
                      ${workshop.is_full
                        ? (d ? 'cursor-not-allowed bg-white/[0.05] text-white/25' : 'cursor-not-allowed bg-[#1a3d2b]/[0.06] text-[#1a3d2b]/30')
                        : 'bg-[#d4e84a] text-[#1a3d2b] hover:bg-[#c8dc3e] shadow-[0_10px_30px_-12px_rgba(212,232,74,0.6)]'
                      } disabled:opacity-60`}
                  >
                    {registratieLoading ? (
                      <><SpinnerIcon />Inschrijven...</>
                    ) : workshop.is_full ? (
                      'Workshop is vol'
                    ) : (
                      'Inschrijven'
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/workshops')}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-colors
                      ${d ? 'bg-white/[0.07] text-white/70 hover:bg-white/[0.12] hover:text-white' : 'bg-[#1a3d2b]/[0.06] text-[#1a3d2b]/70 hover:bg-[#1a3d2b]/[0.1] hover:text-[#1a3d2b]'}`}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    Wissel van workshop
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default WorkshopDetail
