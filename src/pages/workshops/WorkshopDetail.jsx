import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, Users, CheckCircle, MapPin, BookOpen, User, Tag, Moon, Sun, AlertTriangle, ClipboardList, Leaf, HelpCircle, ChevronDown, Download, ScanLine, MessageSquare, Send, ArrowLeftRight, Star } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'
import Card from '../../components/Card'

import { api } from '@/lib/api'

const EASE = [0.22, 1, 0.36, 1]

// Consistente sectiekop met getint icoon-chip (sluit aan op de chips van Home).
// Op module-niveau gedefinieerd (i.p.v. binnen de component) zodat de referentie
// stabiel blijft en React de subtree niet onnodig remount. De kleur-tokens komen
// via de `dark`-prop binnen.
function SectionHeader({ icon: Icon, children, dark }) {
  const d = dark
  const titleClr = d ? 'text-white'     : 'text-[#1a3d2b]'
  const chipBg   = d ? 'bg-[#d4e84a]/12' : 'bg-[#eaf3de]'
  const chipIcon = d ? 'text-[#d4e84a]'  : 'text-[#1a3d2b]'
  return (
    <h2 className={`flex items-center gap-2.5 text-base font-bold tracking-[-0.01em] ${titleClr}`}>
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl ${chipBg}`}>
        <Icon className={`h-4 w-4 ${chipIcon}`} />
      </span>
      {children}
    </h2>
  )
}

// Datum/tijd komen als "YYYY-MM-DD HH:MM:SS" óf als null binnen. Session-mode
// workshops hebben geen start_date/end_date op workshop-niveau (die zitten in de
// sessies), dus defensief uitlezen i.p.v. .split op null.
const datumDeel = (s) => (typeof s === 'string' ? s.split(' ')[0] : '')
const tijdDeel = (s) => (typeof s === 'string' ? s.split(' ')[1] || '' : '')

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// Workshopdetail (route /workshops/:id): details, in-/uitschrijven en wisselen
// (max. 1 workshop tegelijk), sessiekeuze, aanwezigheid, presentatie, FAQ en enquête.
function WorkshopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [workshop, setWorkshop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ingeschreven, setIngeschreven] = useState(false)
  // De workshop waarvoor de gebruiker (evt.) al is ingeschreven. Nodig om te
  // bepalen of "Inschrijven" een échte inschrijving is of een wissel: een
  // gebruiker mag maar bij één workshop tegelijk ingeschreven staan.
  const [huidigeInschrijving, setHuidigeInschrijving] = useState(null)
  const [registratieLoading, setRegistratieLoading] = useState(false)
  const [geselecteerdeSessie, setGeselecteerdeSessie] = useState(null)
  const [faq, setFaq] = useState([])
  const [faqLoading, setFaqLoading] = useState(false)
  const [openFaqId, setOpenFaqId] = useState(null)
  const [aanwezigheidGeregistreerd, setAanwezigheidGeregistreerd] = useState(false)
  const [presentatie, setPresentatie] = useState(null)
  const [vragenlijst, setVragenlijst] = useState([])
  const [vragenlijstLoading, setVragenlijstLoading] = useState(false)
  const [antwoorden, setAntwoorden] = useState({})
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackVerzonden, setFeedbackVerzonden] = useState(false)
  const [enqueteOpen, setEnqueteOpen] = useState(false)
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
    fetchHuidigeInschrijving()
    fetchFaq()
    fetchVragenlijst()
  }, [id])

  // Presentatie ophalen zodra aanwezigheid is geregistreerd. Het endpoint geeft
  // 403 vóór aanwezigheid en 404 als er (nog) geen presentatie is — in beide
  // gevallen tonen we simpelweg geen knop, geen foutmelding.
  useEffect(() => {
    if (!aanwezigheidGeregistreerd) return
    let geannuleerd = false
    api(`/workshops/${id}/presentation`)
      .then((res) => {
        if (geannuleerd) return
        const url = res?.data?.url || res?.url || null
        const filename = res?.data?.filename || res?.filename || null
        if (url) setPresentatie({ url, filename })
      })
      .catch(() => {
        // 404 (geen presentatie) of 403 (geen aanwezigheid): geen knop tonen.
      })
    return () => { geannuleerd = true }
  }, [aanwezigheidGeregistreerd, id])

  async function fetchVragenlijst() {
    setVragenlijstLoading(true)
    try {
      const data = await api(`/workshops/${id}/questionnaire`)
      const vragen = Array.isArray(data.questions) ? data.questions
        : Array.isArray(data.data) ? data.data
        : (data.data?.questions || [])
      setVragenlijst(vragen)
      setFeedbackVerzonden(data.feedback_submitted ?? data.data?.feedback_submitted ?? false)
    } catch (error) {
      console.error('Vragenlijst ophalen mislukt:', error)
    } finally {
      setVragenlijstLoading(false)
    }
  }

  async function fetchFaq() {
    setFaqLoading(true)
    try {
      const data = await api(`/workshops/${id}/faq`)
      setFaq(Array.isArray(data) ? data : (data.data || []))
    } catch (error) {
      console.error('FAQ ophalen mislukt:', error)
    } finally {
      setFaqLoading(false)
    }
  }

  async function fetchWorkshop() {
    setLoading(true)
    try {
      const data = await api(`/workshops/${id}`)
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

  // De workshop waarvoor de gebruiker al ingeschreven staat, uit het overzicht.
  // Stil falen: dit is aanvullende info, geen kritieke lading van de pagina.
  async function fetchHuidigeInschrijving() {
    try {
      const data = await api('/workshops')
      const lijst = data.data || []
      setHuidigeInschrijving(lijst.find(w => w.is_registered) || null)
    } catch {
      // Overzicht kon niet geladen worden — laat de wisselknop dan achterwege.
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
      const body = isSessionMode ? { session_id: geselecteerdeSessie } : {}
      const data = await api(`/workshops/${id}/register`, { method: 'POST', body })
      toast.success(data?.message || 'Je bent ingeschreven!')
      await fetchWorkshop()
      await fetchHuidigeInschrijving()
    } catch (error) {
      toast.error(error.message || 'Inschrijven mislukt')
    } finally {
      setRegistratieLoading(false)
    }
  }

 
  async function handleWisselNaarDeze() {
    const isSessionMode = workshop.registration_mode === 'session'
    if (isSessionMode && !geselecteerdeSessie) {
      toast.error('Kies eerst een sessie')
      return
    }

    setRegistratieLoading(true)
    try {
      await api(`/workshops/${huidigeInschrijving.id}/unregister`, { method: 'DELETE' })
      const body = isSessionMode ? { session_id: geselecteerdeSessie } : {}
      const data = await api(`/workshops/${id}/register`, { method: 'POST', body })
      toast.success(data?.message || `Gewisseld naar ${workshop.title}`)
      await fetchWorkshop()
      await fetchHuidigeInschrijving()
    } catch (error) {
      toast.error(error.message || 'Wisselen mislukt — controleer je inschrijvingen')
      await fetchWorkshop()
      await fetchHuidigeInschrijving()
    } finally {
      setRegistratieLoading(false)
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
      // De API verwacht `answer` altijd als string — ook bij ratings ("8").
      // Sterren gaan 1–5 in de UI, maar de API rekent met 1–10: dus x2.
      const answers = vragenlijst
        .filter(v => antwoorden[v.id] !== undefined && antwoorden[v.id] !== '')
        .map(v => ({
          question_id: v.id,
          answer: String((v.type || 'text') === 'rating' ? antwoorden[v.id] * 2 : antwoorden[v.id]),
        }))
      const data = await api(`/workshops/${id}/feedback`, { method: 'POST', body: { answers } })
      toast.success(data?.message || 'Bedankt voor je feedback!')
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

  // --- Design tokens (uitgelijnd op Home.jsx, een palet voor de hele app) ---
  const d = dark
  const contentBg   = d ? 'bg-[#111111]'        : 'bg-[#e4e8e2]'
  const hairline    = d ? 'border-white/[0.07]' : 'border-[#1a3d2b]/[0.07]'
  const skelBg      = d ? 'bg-white/[0.07]'     : 'bg-black/[0.05]'
  const titleClr    = d ? 'text-white'          : 'text-[#1a3d2b]'
  const bodyClr     = d ? 'text-white/60'       : 'text-[#1a3d2b]/70'
  const subClr      = d ? 'text-white/70'       : 'text-[#1a3d2b]/70'
  const labelClr    = d ? 'text-white/55'       : 'text-[#1a3d2b]/55'
  const tileBg      = d ? 'bg-white/[0.04]'     : 'bg-[#f6faf2]'
  const barTrack    = d ? 'bg-white/10'         : 'bg-[#1a3d2b]/[0.08]'
  const chipIcon    = d ? 'text-[#d4e84a]'      : 'text-[#1a3d2b]'

  // Rustige, doelgerichte motion, respecteert useReducedMotion
  const stack = { hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }
  const rise = shouldReduce
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } }
    : { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } } }

  // Al ingeschreven bij een ándere workshop? Dan wordt "Inschrijven" een wissel.
  const ingeschrevenElders = !ingeschreven && huidigeInschrijving && String(huidigeInschrijving.id) !== String(id)

  // Bezetting
  const bezet = workshop ? (workshop.registered ?? 0) : 0
  const totaal = workshop ? (workshop.capacity ?? 0) : 0
  const bezetPct = totaal > 0 ? Math.min(100, Math.round((bezet / totaal) * 100)) : 0
  // Vloer de zichtbare breedte zodat een lage bezetting niet als een streepje wegvalt
  const bezetBarWidth = bezet > 0 ? Math.max(bezetPct, 5) : 0

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
            className="rounded-xl p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
            aria-label="Terug naar workshops"
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
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
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
              <h1 className="mb-4 text-[2rem] font-black leading-[1.02] tracking-[-0.03em] text-white md:text-[2.6rem]">
                {workshop.title}
              </h1>
              {workshop.teacher && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-sm font-medium text-white/80 ring-1 ring-inset ring-white/10">
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
                <Card key={i} dark={d}>
                  <div className="space-y-3 p-5">
                    <div className={`h-4 w-32 animate-pulse rounded-full ${skelBg}`} />
                    <div className={`h-3 w-full animate-pulse rounded-full ${skelBg}`} />
                    <div className={`h-3 w-3/4 animate-pulse rounded-full ${skelBg}`} />
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Niet gevonden */}
          {!loading && !workshop && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card dark={d}>
                <div className="p-10 text-center">
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${d ? 'bg-white/[0.05]' : 'bg-[#1a3d2b]/[0.04]'}`}>
                    <BookOpen className={`h-5 w-5 ${d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
                  </div>
                  <p className={`mb-4 text-sm font-semibold ${subClr}`}>Workshop niet gevonden</p>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => navigate('/workshops')}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                      d ? 'bg-[#d4e84a]/10 text-[#d4e84a] hover:bg-[#d4e84a]/20' : 'bg-[#1a3d2b] text-[#d4e84a] hover:bg-[#16331f]'
                    }`}
                  >
                    Terug naar overzicht
                  </motion.button>
                </div>
              </Card>
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

              {/* Al elders ingeschreven: leg uit dat inschrijven hier wisselt */}
              <AnimatePresence>
                {ingeschrevenElders && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium ${
                      d ? 'bg-[#d4e84a]/10 text-[#d4e84a]' : 'bg-[#eaf3de] text-[#1a3d2b]'
                    }`}
                  >
                    <ArrowLeftRight className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Je bent al ingeschreven voor <span className="font-bold">{huidigeInschrijving.title}</span>. Je kunt maar bij één workshop tegelijk ingeschreven staan — schrijf je hieronder in om te wisselen.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Details, stat-tegels + bezettingsbalk */}
              <motion.div variants={rise}>
                <Card dark={d}>
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className={`flex flex-col gap-2 rounded-2xl ${tileBg} p-3.5`}>
                        <CalendarDays className={`h-4 w-4 ${chipIcon}`} />
                        <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-wider ${labelClr}`}>Datum</p>
                          <p className={`mt-0.5 text-sm font-bold capitalize leading-snug ${titleClr}`}>
                            {workshop.start_date ? formatDatum(datumDeel(workshop.start_date)) : 'Per sessie'}
                          </p>
                        </div>
                      </div>

                      <div className={`flex flex-col gap-2 rounded-2xl ${tileBg} p-3.5`}>
                        <Clock className={`h-4 w-4 ${chipIcon}`} />
                        <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-wider ${labelClr}`}>Tijd</p>
                          <p className={`mt-0.5 text-sm font-bold tabular-nums leading-snug ${titleClr}`}>
                            {workshop.start_date
                              ? `${tijdDeel(workshop.start_date)} - ${tijdDeel(workshop.end_date)}`
                              : 'Per sessie'}
                          </p>
                        </div>
                      </div>

                      <div className={`flex flex-col gap-2 rounded-2xl ${tileBg} p-3.5`}>
                        <MapPin className={`h-4 w-4 ${chipIcon}`} />
                        <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-wider ${labelClr}`}>Locatie</p>
                          <p className={`mt-0.5 text-sm font-bold leading-snug ${titleClr}`}>{workshop.location}</p>
                        </div>
                      </div>

                      <div className={`flex flex-col gap-2 rounded-2xl ${tileBg} p-3.5`}>
                        <Users className={`h-4 w-4 ${chipIcon}`} />
                        <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-wider ${labelClr}`}>Plekken</p>
                          <p className={`mt-0.5 text-sm font-bold tabular-nums leading-snug ${workshop.is_full ? 'text-red-500' : titleClr}`}>
                            {workshop.is_full ? 'Volgeboekt' : `${workshop.spots_left} vrij`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bezettingsbalk */}
                    <div className="mt-4">
                      <div className="mb-2 flex items-end justify-between">
                        <span className={`text-xs font-semibold ${labelClr}`}>Bezetting</span>
                        <span className={`text-xs font-bold tabular-nums ${workshop.is_full ? 'text-red-400' : titleClr}`}>
                          {bezet}<span className={subClr}>/{totaal}</span>
                        </span>
                      </div>
                      <div className={`h-2.5 w-full overflow-hidden rounded-full ${barTrack}`}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${bezetBarWidth}%` }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
                          className={`h-full rounded-full ${workshop.is_full ? 'bg-red-400' : (d ? 'bg-[#d4e84a]' : 'bg-[#1a3d2b]')}`}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Beschrijving, editorial blok (geen kaart) */}
              <motion.section variants={rise} className="px-1">
                <SectionHeader icon={BookOpen} dark={d}>Over deze workshop</SectionHeader>
                <p className={`mt-3 max-w-prose text-[15px] leading-relaxed ${bodyClr}`}>{workshop.description}</p>
              </motion.section>

              {/* Waarschuwingen, de enige bewust gekleurde uitzondering */}
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

              {/* Benodigdheden, editorial blok */}
              {workshop.requirements && (Array.isArray(workshop.requirements) ? workshop.requirements.length > 0 : true) && (
                <motion.section variants={rise} className="px-1">
                  <SectionHeader icon={ClipboardList} dark={d}>Benodigdheden</SectionHeader>
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

              {/* Dieetwensen & allergenen, editorial blok */}
              {(workshop.dietary_info || workshop.allergens) && (
                <motion.section variants={rise} className="px-1">
                  <SectionHeader icon={Leaf} dark={d}>Dieetwensen &amp; allergenen</SectionHeader>
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

              {/* Aanwezigheid & presentatie, interactieve kaart */}
              {ingeschreven && (
                <motion.div variants={rise}>
                  <Card dark={d}>
                    <div className="p-5">
                      <div className="mb-4">
                        <SectionHeader icon={ScanLine} dark={d}>Aanwezigheid</SectionHeader>
                      </div>

                      <div className="flex flex-col gap-3">
                        {aanwezigheidGeregistreerd ? (
                          <div className="flex items-center gap-2.5 rounded-2xl bg-[#1a3d2b] px-4 py-3 text-sm font-bold text-[#d4e84a]">
                            <CheckCircle className="h-4 w-4 shrink-0" />
                            Aanwezigheid geregistreerd
                          </div>
                        ) : (
                          <div className={`flex items-start gap-2.5 rounded-2xl px-4 py-3 text-sm ${d ? 'bg-white/[0.04] text-white/70' : 'bg-[#f6faf2] text-[#1a3d2b]/70'}`}>
                            <ScanLine className={`mt-0.5 h-4 w-4 shrink-0 ${chipIcon}`} />
                            <span>Laat je QR-code scannen door de organisator om afgetekend te worden.</span>
                          </div>
                        )}

                        {aanwezigheidGeregistreerd && presentatie?.url && (
                          <a
                            href={presentatie.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2 ${
                              d ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-[#eaf3de] text-[#1a3d2b] hover:bg-[#d4e84a]/40'
                            }`}
                          >
                            <Download className="h-4 w-4" />
                            {presentatie.filename || 'Presentatie downloaden'}
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Enquête / feedback, interactieve kaart */}
              {ingeschreven && (vragenlijstLoading || vragenlijst.length > 0) && (
                <motion.div variants={rise}>
                  <Card dark={d}>
                    <div className="p-5">
                      <button
                        type="button"
                        onClick={() => setEnqueteOpen(o => !o)}
                        aria-expanded={enqueteOpen}
                        className="flex w-full items-center justify-between gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
                      >
                        <SectionHeader icon={MessageSquare} dark={d}>Enquête</SectionHeader>
                        <span className="flex items-center gap-2">
                          {feedbackVerzonden && (
                            <span className="flex items-center gap-1 text-xs font-bold text-[#d4e84a]">
                              <CheckCircle className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Ingevuld</span>
                            </span>
                          )}
                          <motion.span
                            animate={{ rotate: enqueteOpen ? 180 : 0 }}
                            transition={{ duration: 0.2, ease: EASE }}
                            className="shrink-0"
                          >
                            <ChevronDown className={`h-4 w-4 ${subClr}`} />
                          </motion.span>
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {enqueteOpen && (
                          <motion.div
                            key="enquete-body"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: EASE }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3">
                      {vragenlijstLoading ? (
                        <div className="space-y-2.5">
                          {[1, 2].map(i => (
                            <div key={i} className={`h-12 animate-pulse rounded-xl ${skelBg}`} />
                          ))}
                        </div>
                      ) : feedbackVerzonden ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.97 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                          className="flex items-center justify-center gap-2.5 py-4 text-center"
                        >
                          <CheckCircle className="h-5 w-5 shrink-0 text-[#d4e84a]" />
                          <p className={`text-sm font-bold ${titleClr}`}>Bedankt voor je feedback!</p>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleFeedbackVersturen} className="flex flex-col gap-3.5">
                          {vragenlijst.map((vraag, i) => {
                            const type = vraag.type || 'text'
                            const huidig = antwoorden[vraag.id]
                            return (
                              <div key={vraag.id} className="flex flex-col gap-1.5">
                                <label className={`text-[13px] font-semibold ${titleClr}`}>
                                  <span className={`mr-1 tabular-nums ${subClr}`}>{i + 1}.</span>
                                  {vraag.question_text || vraag.question || vraag.label}
                                  {vraag.required && <span className="ml-1 text-red-400">*</span>}
                                </label>

                                {type === 'rating' ? (
                                  // 5 sterren; bij versturen omgerekend naar de 1–10 schaal van de API.
                                  <div className="flex gap-1" role="radiogroup" aria-label="Beoordeling in sterren">
                                    {[1, 2, 3, 4, 5].map(score => {
                                      const actief = (huidig || 0) >= score
                                      return (
                                        <motion.button
                                          key={score}
                                          type="button"
                                          whileTap={{ scale: 0.85 }}
                                          onClick={() => setAntwoord(vraag.id, score)}
                                          aria-label={`${score} van 5 sterren`}
                                          aria-pressed={huidig === score}
                                          className="rounded-lg p-1 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
                                        >
                                          <Star
                                            className={`h-6 w-6 transition-colors duration-150 ${
                                              actief
                                                ? 'text-[#d4e84a]'
                                                : (d ? 'text-white/20' : 'text-[#1a3d2b]/20')
                                            }`}
                                            fill={actief ? 'currentColor' : 'none'}
                                          />
                                        </motion.button>
                                      )
                                    })}
                                  </div>
                                ) : (type === 'multiple_choice' || type === 'choice') && Array.isArray(vraag.options) ? (
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
                                          className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                                            gekozen
                                              ? (d ? 'border-[#d4e84a]/50 bg-[#d4e84a]/10 text-[#d4e84a]' : 'border-[#1a3d2b] bg-[#eaf3de] text-[#1a3d2b]')
                                              : (d ? 'border-white/[0.08] text-white/70 hover:border-white/20' : 'border-[#1a3d2b]/10 text-[#1a3d2b]/70 hover:border-[#1a3d2b]/30')
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
                                    rows={2}
                                    placeholder="Je antwoord..."
                                    className={`w-full resize-none rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                                      d
                                        ? 'border-white/[0.08] bg-white/[0.05] text-white placeholder:text-white/40 focus:border-[#d4e84a]/40'
                                        : 'border-[#1a3d2b]/10 bg-[#f6faf2] text-[#1a3d2b] placeholder:text-[#1a3d2b]/40 focus:border-[#1a3d2b]/40'
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
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a3d2b] py-2.5 text-xs font-bold text-[#d4e84a] transition-colors hover:bg-[#16331f] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2"
                          >
                            {feedbackLoading ? <><SpinnerIcon />Versturen...</> : <><Send className="h-3.5 w-3.5" />Versturen</>}
                          </motion.button>
                        </form>
                      )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Sessie-selectie, interactieve kaart */}
              {workshop.registration_mode === 'session' && workshop.sessions?.length > 0 && !ingeschreven && (
                <motion.div variants={rise}>
                  <Card dark={d}>
                    <div className="p-5">
                      <div className="mb-4">
                        <SectionHeader icon={Tag} dark={d}>Kies een sessie</SectionHeader>
                      </div>
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
                              className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]
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
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* FAQ, flush accordion op de sheet */}
              {(faqLoading || faq.length > 0) && (
                <motion.section variants={rise} className="px-1">
                  <div className="mb-2">
                    <SectionHeader icon={HelpCircle} dark={d}>Veelgestelde vragen</SectionHeader>
                  </div>
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
                              className="flex w-full items-center justify-between gap-3 rounded-lg py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
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

              {/* Actie, primaire CTA */}
              <motion.div variants={rise} className="flex flex-col gap-2 pt-1">
                {!ingeschreven ? (
                  <>
                    <motion.button
                      whileHover={{ scale: registratieLoading || workshop.is_full ? 1 : 1.015 }}
                      whileTap={{ scale: registratieLoading || workshop.is_full ? 1 : 0.98 }}
                      onClick={ingeschrevenElders ? handleWisselNaarDeze : handleInschrijven}
                      disabled={registratieLoading || workshop.is_full}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2
                        ${workshop.is_full
                          ? (d ? 'cursor-not-allowed bg-white/[0.05] text-white/40' : 'cursor-not-allowed bg-[#1a3d2b]/[0.06] text-[#1a3d2b]/45')
                          : 'bg-[#d4e84a] text-[#1a3d2b] hover:bg-[#c8dc3e] shadow-[0_10px_30px_-12px_rgba(212,232,74,0.6)]'
                        } disabled:opacity-60`}
                    >
                      {registratieLoading ? (
                        <><SpinnerIcon />{ingeschrevenElders ? 'Wisselen...' : 'Inschrijven...'}</>
                      ) : workshop.is_full ? (
                        'Workshop is vol'
                      ) : ingeschrevenElders ? (
                        <><ArrowLeftRight className="h-4 w-4" />Wissel naar deze workshop</>
                      ) : (
                        'Inschrijven'
                      )}
                    </motion.button>
                    {ingeschrevenElders && !workshop.is_full && (
                      <p className={`text-center text-xs ${subClr}`}>
                        Je inschrijving voor <span className="font-semibold">{huidigeInschrijving.title}</span> komt hiermee te vervallen
                      </p>
                    )}
                    {workshop.registration_mode === 'session' && workshop.sessions?.length > 0 && !geselecteerdeSessie && !workshop.is_full && (
                      <p className={`text-center text-xs ${subClr}`}>Kies eerst een sessie hierboven</p>
                    )}
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/workshops')}
                      className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2
                        ${d ? 'bg-white/[0.07] text-white/80 hover:bg-white/[0.12]' : 'bg-[#1a3d2b]/[0.06] text-[#1a3d2b]/75 hover:bg-[#eaf3de]'}`}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                      Wissel van workshop
                    </motion.button>
                    <p className={`text-center text-xs ${subClr}`}>Kies een andere workshop in het overzicht</p>
                  </>
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
