import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronLeft, Bell, BellRing, BookOpen, CalendarDays, Check, CheckCheck, ArrowRight, Moon, Sun, Inbox } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'

import { api } from '@/lib/api'

const EASE = [0.22, 1, 0.36, 1]

function SpinnerIcon() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// Normalisatielaag naar de gedocumenteerde notificatie-vorm: we lezen alleen
// de velden uit die de API belooft (id is altijd een UUID-string).
function normaliseerMelding(m) {
  return {
    id:         m.id,
    titel:      m.title  || 'Melding',
    bericht:    m.message || '',
    gelezen:    Boolean(m.is_read),
    datum:      m.created_at || null,
    type:       String(m.type || '').toLowerCase(),
    workshopId: m.workshop_id ?? null,
    eventId:    m.event_id   ?? null,
  }
}

// Bepaalt uit de paginering of er nog een volgende pagina is. Werkt zowel met
// links.next als met meta.current_page/last_page; bij een platte array (geen
// paginering) is er niets meer te laden.
function heeftVolgende(data) {
  if (data?.links?.next) return true
  const meta = data?.meta
  if (meta?.current_page != null && meta?.last_page != null) {
    return meta.current_page < meta.last_page
  }
  return false
}

// Kiest een passend icoon op basis van het meldingstype.
function iconVoorType(type) {
  if (type.includes('herinner') || type.includes('reminder')) return BellRing
  if (type.includes('workshop')) return BookOpen
  if (type.includes('event')) return CalendarDays
  return Bell
}

// Relatieve "tijd geleden" (zojuist / X min / uur / gisteren), anders korte datum.
function formatTijd(datum) {
  if (!datum) return ''
  const d0 = new Date(datum)
  if (isNaN(d0.getTime())) return ''
  const verschilSec = (Date.now() - d0.getTime()) / 1000
  if (verschilSec < 60) return 'zojuist'
  if (verschilSec < 3600) return `${Math.floor(verschilSec / 60)} min geleden`
  if (verschilSec < 86400) return `${Math.floor(verschilSec / 3600)} uur geleden`
  if (verschilSec < 172800) return 'gisteren'
  return d0.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
}

// Eén meldingskaart: titel, bericht en type-afhankelijke acties (navigeren,
// herinnering aanvragen, als gelezen markeren).
function MeldingKaart({ melding, dark, navigate, onMarkeerGelezen, onHerinnering, reminderLoading }) {
  const d = dark
  const { gelezen, workshopId, eventId } = melding
  const Icon = iconVoorType(melding.type)

  // Een melding is klikbaar als hij aan een workshop óf event hangt.
  const kanNavigeren = workshopId !== null || eventId !== null

  // Markeer eerst als gelezen (fire-and-forget: de optimistische update in de
  // parent werkt direct) en navigeer daarna naar de gekoppelde pagina.
  function handleNavigeer() {
    if (!gelezen) onMarkeerGelezen(melding.id)
    if (workshopId !== null) navigate(`/workshops/${workshopId}`)
    else if (eventId !== null) navigate(`/events/${eventId}`)
  }

  const cardBg     = d ? 'bg-[#1c1c1e]'        : 'bg-white'
  const cardBorder = gelezen
    ? (d ? 'border-white/[0.07]' : 'border-black/[0.06]')
    : (d ? 'border-[#d4e84a]/25' : 'border-[#1a3d2b]/15')
  const cardShadow = d ? 'shadow-[0_2px_20px_rgba(0,0,0,0.30)]' : 'shadow-[0_1px_2px_rgba(26,61,43,0.04),0_14px_30px_-18px_rgba(26,61,43,0.20)]'
  const titleClr   = d ? 'text-white'          : 'text-[#1a3d2b]'
  const bodyClr    = d ? 'text-white/60'        : 'text-[#1a3d2b]/70'
  const timeClr    = d ? 'text-white/40'        : 'text-[#1a3d2b]/45'
  const iconTile   = gelezen
    ? (d ? 'bg-white/[0.06] text-white/45' : 'bg-[#1a3d2b]/[0.05] text-[#1a3d2b]/45')
    : (d ? 'bg-[#d4e84a]/12 text-[#d4e84a]' : 'bg-[#eaf3de] text-[#1a3d2b]')

  const ghostBtn = d
    ? 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12]'
    : 'bg-[#1a3d2b]/[0.05] text-[#1a3d2b]/80 hover:bg-[#1a3d2b]/[0.09]'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`relative ${cardBg} border ${cardBorder} ${cardShadow} rounded-[26px] p-4 transition-colors duration-300 sm:p-5`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${iconTile}`}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {!gelezen && (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4e84a]" aria-label="Ongelezen" />
              )}
              <h3 className={`text-[15px] font-bold leading-snug tracking-[-0.01em] ${titleClr}`}>
                {melding.titel}
              </h3>
            </div>
            {melding.datum && (
              <span className={`shrink-0 pt-0.5 text-xs tabular-nums ${timeClr}`}>{formatTijd(melding.datum)}</span>
            )}
          </div>

          {melding.bericht && (
            <p className={`mt-1.5 text-[13px] leading-relaxed ${bodyClr}`}>{melding.bericht}</p>
          )}

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            {kanNavigeren && (
              <button
                onClick={handleNavigeer}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${ghostBtn}`}
              >
                {workshopId !== null ? <BookOpen className="h-3.5 w-3.5" /> : <CalendarDays className="h-3.5 w-3.5" />}
                {workshopId !== null ? 'Bekijk workshop' : 'Bekijk event'}
                <ArrowRight className="h-3 w-3" />
              </button>
            )}

            {workshopId && (
              <button
                onClick={() => onHerinnering(workshopId)}
                disabled={reminderLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#d4e84a] px-3 py-1.5 text-xs font-bold text-[#1a3d2b] transition-colors hover:bg-[#c8dc3e] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3d2b] focus-visible:ring-offset-2"
              >
                {reminderLoading ? <><SpinnerIcon />Aanvragen...</> : <><BellRing className="h-3.5 w-3.5" />Herinnering aanvragen</>}
              </button>
            )}

            {!gelezen && (
              <button
                onClick={() => onMarkeerGelezen(melding.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${ghostBtn}`}
              >
                <Check className="h-3.5 w-3.5" />
                Markeer als gelezen
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Meldingen / postvak (route /meldingen): gepagineerde notificaties, filter op
// alle/ongelezen, optimistisch als gelezen markeren en herinneringen aanvragen.
function Meldingen() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  const [meldingen, setMeldingen] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('alle') // 'alle' | 'ongelezen'
  const [reminderLoading, setReminderLoading] = useState({})
  const [pagina, setPagina] = useState(1)
  const [heeftMeer, setHeeftMeer] = useState(false)
  const [paginaLoading, setPaginaLoading] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  function toggleDark() {
    setDark(v => {
      const next = !v
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
    fetchMeldingen()
  }, [])

  // US-12a: eerste pagina meldingen ophalen via GET /api/notifications
  async function fetchMeldingen() {
    setLoading(true)
    try {
      const data = await api('/notifications')
      const lijst = Array.isArray(data) ? data : (data.data || [])
      setMeldingen(lijst.map(normaliseerMelding))
      setPagina(1)
      setHeeftMeer(heeftVolgende(data))
    } catch (error) {
      toast.error('Meldingen ophalen mislukt')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Volgende pagina ophalen en achter de bestaande lijst plakken (niet vervangen).
  async function laadMeer() {
    if (paginaLoading || !heeftMeer) return
    const volgende = pagina + 1
    setPaginaLoading(true)
    try {
      const data = await api(`/notifications?page=${volgende}`)
      const lijst = Array.isArray(data) ? data : (data.data || [])
      const nieuw = lijst.map(normaliseerMelding)
      // Dedupe op id, zodat een verschoven pagina geen dubbele React-keys geeft.
      setMeldingen(prev => {
        const bestaand = new Set(prev.map(m => m.id))
        return [...prev, ...nieuw.filter(m => !bestaand.has(m.id))]
      })
      setPagina(volgende)
      setHeeftMeer(heeftVolgende(data))
    } catch (error) {
      toast.error(error.message || 'Meer meldingen laden mislukt')
    } finally {
      setPaginaLoading(false)
    }
  }

  // US-12b: melding als gelezen markeren via PATCH /api/notifications/{id}
  async function markeerGelezen(id) {
    setMeldingen(prev => prev.map(m => m.id === id ? { ...m, gelezen: true } : m))
    try {
      // Geen body: het endpoint markeert als gelezen o.b.v. het id in het pad.
      await api(`/notifications/${id}`, { method: 'PATCH' })
    } catch (error) {
      // Optimistische update terugdraaien
      setMeldingen(prev => prev.map(m => m.id === id ? { ...m, gelezen: false } : m))
      toast.error(error.message || 'Markeren mislukt')
    }
  }

  async function markeerAllesGelezen() {
    const ongelezen = meldingen.filter(m => !m.gelezen)
    if (ongelezen.length === 0) return
    setMeldingen(prev => prev.map(m => ({ ...m, gelezen: true })))
    try {
      await Promise.all(
        ongelezen.map(m => api(`/notifications/${m.id}`, { method: 'PATCH' }))
      )
      toast.success('Alles gemarkeerd als gelezen')
    } catch {
      toast.error('Niet alles kon worden gemarkeerd')
      fetchMeldingen()
    }
  }

  // US-12c: reminder aanvragen via POST /api/workshops/{id}/reminder
  async function vraagHerinnering(workshopId) {
    setReminderLoading(prev => ({ ...prev, [workshopId]: true }))
    try {
      const data = await api(`/workshops/${workshopId}/reminder`, { method: 'POST' })
      toast.success(data?.message || 'Je ontvangt een herinnering voor deze workshop')
    } catch (error) {
      toast.error(error.message || 'Herinnering aanvragen mislukt')
    } finally {
      setReminderLoading(prev => ({ ...prev, [workshopId]: false }))
    }
  }

  const ongelezenAantal = meldingen.filter(m => !m.gelezen).length
  const zichtbaar = filter === 'ongelezen' ? meldingen.filter(m => !m.gelezen) : meldingen

  const d = dark
  const contentBg  = d ? 'bg-[#111111]'        : 'bg-[#e4e8e2]'
  const cardBg     = d ? 'bg-[#1c1c1e]'        : 'bg-white'
  const cardBorder = d ? 'border-white/[0.08]' : 'border-black/[0.06]'
  const skelBg     = d ? 'bg-white/[0.07]'     : 'bg-black/[0.05]'
  const titleClr   = d ? 'text-white'          : 'text-[#1a3d2b]'
  const subClr     = d ? 'text-white/70'       : 'text-[#1a3d2b]/70'
  const segBg      = d ? 'bg-white/[0.05]'     : 'bg-[#1a3d2b]/[0.05]'
  const segActive  = d ? 'bg-[#d4e84a] text-[#1a3d2b]' : 'bg-[#1a3d2b] text-[#d4e84a]'
  const segIdle    = d ? 'text-white/60 hover:text-white/90' : 'text-[#1a3d2b]/60 hover:text-[#1a3d2b]'

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
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/home')}
            className="rounded-xl p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
            aria-label="Terug naar home"
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
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d4e84a]/[0.08] blur-2xl" />

        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="relative max-w-2xl"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4e84a]">
            Postvak
          </p>
          <h1 className="mb-4 text-[2.75rem] font-black leading-[0.95] tracking-[-0.04em] text-white md:text-6xl">
            Meldingen
          </h1>
          {loading ? (
            <div className="h-7 w-44 animate-pulse rounded-full bg-white/10" />
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white/55">
              <Bell className="h-4 w-4 text-[#d4e84a]" />
              {ongelezenAantal > 0 ? (
                <><span className="font-bold tabular-nums text-white/85">{ongelezenAantal}</span> ongelezen</>
              ) : (
                'Je bent helemaal bij'
              )}
            </span>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pb-10 pt-8 transition-colors duration-300`}>
        <div className="mx-auto flex max-w-2xl flex-col gap-5">

          {/* Filter + markeer alles */}
          {!loading && meldingen.length > 0 && (
            <div className="flex items-center justify-between gap-3">
              <div className={`inline-flex rounded-2xl p-1 ${segBg}`} role="tablist" aria-label="Filter meldingen">
                {[
                  { key: 'alle', label: 'Alle' },
                  { key: 'ongelezen', label: `Ongelezen${ongelezenAantal > 0 ? ` (${ongelezenAantal})` : ''}` },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={filter === key}
                    onClick={() => setFilter(key)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-bold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${filter === key ? segActive : segIdle}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {ongelezenAantal > 0 && (
                <button
                  onClick={markeerAllesGelezen}
                  className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] rounded-lg px-1 ${d ? 'text-[#d4e84a] hover:text-[#e4f56a]' : 'text-[#1a3d2b] hover:text-[#16331f]'}`}
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Alles gelezen
                </button>
              )}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`${cardBg} rounded-[26px] border ${cardBorder} p-5`}>
                  <div className="flex items-start gap-3.5">
                    <div className={`h-10 w-10 shrink-0 animate-pulse rounded-2xl ${skelBg}`} />
                    <div className="flex-1 space-y-2.5">
                      <div className={`h-3.5 w-40 animate-pulse rounded-full ${skelBg}`} />
                      <div className={`h-2.5 w-full animate-pulse rounded-full ${skelBg}`} />
                      <div className={`h-2.5 w-2/3 animate-pulse rounded-full ${skelBg}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lege staat */}
          {!loading && zichtbaar.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${cardBg} rounded-[26px] border ${cardBorder} p-10 text-center`}
            >
              <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${d ? 'bg-white/[0.05]' : 'bg-[#1a3d2b]/[0.04]'}`}>
                <Inbox className={`h-5 w-5 ${d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
              </div>
              <p className={`mb-1 text-sm font-bold ${titleClr}`}>
                {filter === 'ongelezen' ? 'Geen ongelezen meldingen' : 'Nog geen meldingen'}
              </p>
              <p className={`mb-4 text-xs ${subClr}`}>
                {filter === 'ongelezen' ? 'Je hebt alles gelezen.' : 'Updates over je workshops verschijnen hier.'}
              </p>
              {filter === 'ongelezen' ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setFilter('alle')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                    d ? 'bg-[#d4e84a]/10 text-[#d4e84a] hover:bg-[#d4e84a]/20' : 'bg-[#1a3d2b] text-[#d4e84a] hover:bg-[#16331f]'
                  }`}
                >
                  Alle meldingen tonen
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/workshops')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                    d ? 'bg-[#d4e84a]/10 text-[#d4e84a] hover:bg-[#d4e84a]/20' : 'bg-[#1a3d2b] text-[#d4e84a] hover:bg-[#16331f]'
                  }`}
                >
                  Bekijk workshops
                </motion.button>
              )}
            </motion.div>
          )}

          {/* Lijst */}
          {!loading && zichtbaar.length > 0 && (
            <motion.div layout className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {zichtbaar.map(melding => (
                  <MeldingKaart
                    key={melding.id}
                    melding={melding}
                    dark={dark}
                    navigate={navigate}
                    onMarkeerGelezen={markeerGelezen}
                    onHerinnering={vraagHerinnering}
                    reminderLoading={Boolean(reminderLoading[melding.workshopId])}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Laad meer — alleen als de API nog een volgende pagina heeft */}
          {!loading && heeftMeer && (
            <div className="flex justify-center pt-1">
              <button
                onClick={laadMeer}
                disabled={paginaLoading}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                  d ? 'bg-white/[0.06] text-white/80 hover:bg-white/[0.12]' : 'bg-[#1a3d2b]/[0.05] text-[#1a3d2b]/80 hover:bg-[#1a3d2b]/[0.09]'
                }`}
              >
                {paginaLoading ? <><SpinnerIcon />Laden...</> : 'Laad meer'}
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Meldingen
