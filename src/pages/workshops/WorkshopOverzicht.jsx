import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, BookOpen, Moon, Sun } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'
import WorkshopCard from './WorkshopCard'

import { api } from '@/lib/api'

const MAANDEN = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
const DAGEN_KORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

const EASE = [0.22, 1, 0.36, 1]

function getKalenderDagen(jaar, maand) {
  const eerstedag = new Date(jaar, maand, 1)
  const aantalDagen = new Date(jaar, maand + 1, 0).getDate()
  let startOffset = eerstedag.getDay() - 1
  if (startOffset < 0) startOffset = 6
  const dagen = []
  for (let i = 0; i < startOffset; i++) dagen.push(null)
  for (let i = 1; i <= aantalDagen; i++) dagen.push(i)
  return dagen
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
}

function WorkshopOverzicht() {
  const navigate = useNavigate()
  const vandaag = new Date()

  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(false)

  useEffect(() => {
    if (!loading) { setShowSkeleton(false); return }
    const timer = setTimeout(() => setShowSkeleton(true), 150)
    return () => clearTimeout(timer)
  }, [loading])
  const [jaar, setJaar] = useState(vandaag.getFullYear())
  const [maand, setMaand] = useState(vandaag.getMonth())
  const [geselecteerdeDag, setGeselecteerdeDag] = useState(null)
  const [maandRichting, setMaandRichting] = useState(1)
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
    fetchWorkshops()
  }, [])

  async function fetchWorkshops() {
    try {
      const data = await api('/workshops')
      setWorkshops(data.data)
    } catch (error) {
      toast.error('Workshops ophalen mislukt')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const kalenderDagen = getKalenderDagen(jaar, maand)

  // Datum (zonder tijd) uit start_date; session-mode workshops kunnen start_date
  // null hebben, dus defensief uitlezen i.p.v. .split op null.
  const workshopDatum = (w) => (typeof w.start_date === 'string' ? w.start_date.split(' ')[0] : '')

  const workshopDatums = new Set(workshops.map(workshopDatum).filter(Boolean))

  const geselecteerdeDatum = geselecteerdeDag
    ? `${jaar}-${String(maand + 1).padStart(2, '0')}-${String(geselecteerdeDag).padStart(2, '0')}`
    : null

  const zichtbareWorkshops = geselecteerdeDatum
    ? workshops.filter((w) => workshopDatum(w) === geselecteerdeDatum)
    : workshops

  function vorigemMaand() {
    setMaandRichting(-1)
    if (maand === 0) { setMaand(11); setJaar(j => j - 1) }
    else setMaand(m => m - 1)
    setGeselecteerdeDag(null)
  }

  function volgendeMaand() {
    setMaandRichting(1)
    if (maand === 11) { setMaand(0); setJaar(j => j + 1) }
    else setMaand(m => m + 1)
    setGeselecteerdeDag(null)
  }

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const richting = shouldReduce ? 0 : maandRichting

  const d = dark
  const contentBg   = d ? 'bg-[#111111]'        : 'bg-[#e4e8e2]'
  const cardBg      = d ? 'bg-[#1c1c1e]'        : 'bg-white'
  const cardBorder  = d ? 'border-white/[0.08]' : 'border-black/[0.06]'
  const hairline    = d ? 'border-white/[0.07]' : 'border-[#1a3d2b]/[0.07]'
  const skelBg      = d ? 'bg-white/[0.07]'     : 'bg-black/[0.05]'
  const labelClr    = d ? 'text-white/60'       : 'text-[#1a3d2b]/60'
  const calTitleClr = d ? 'text-white'          : 'text-[#1a3d2b]'
  const cardShadow  = d ? 'shadow-[0_2px_24px_rgba(0,0,0,0.30)]' : 'shadow-[0_1px_2px_rgba(26,61,43,0.04),0_18px_40px_-24px_rgba(26,61,43,0.22)]'
  const navBtn      = d ? 'text-white/60 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]' : 'text-[#1a3d2b]/60 hover:bg-[#1a3d2b]/[0.06] hover:text-[#1a3d2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3d2b]'

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
        {/* Statische, composieve gloed i.p.v. perpetuele blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d4e84a]/[0.08] blur-2xl" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-48 w-48 rounded-full bg-[#d4e84a]/[0.04] blur-2xl" />

        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="relative max-w-5xl"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4e84a]">
            Aanbod
          </p>
          <h1 className="mb-4 text-[2.75rem] font-black leading-[0.95] tracking-[-0.04em] text-white md:text-6xl">
            Workshops
          </h1>
          {loading ? (
            <div className="h-7 w-44 animate-pulse rounded-full bg-white/10" />
          ) : (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-white/55">
              <BookOpen className="h-4 w-4 text-[#d4e84a]" />
              <span className="font-bold tabular-nums text-white/85">{workshops.length}</span>
              workshops beschikbaar
            </span>
          )}
        </motion.div>
      </div>

      {/* Content sectie */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pb-10 pt-8 transition-colors duration-300`}>
        <div className="mx-auto flex max-w-5xl flex-col gap-5 md:flex-row md:items-start md:gap-7">

          {/* Kalender */}
          <motion.div
            initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE, delay: 0.15 }}
            className={`${cardBg} ${cardShadow} w-full rounded-[26px] border ${cardBorder} p-6 md:sticky md:top-6 md:w-80 md:shrink-0`}
          >
            {/* Maand navigatie */}
            <div className="mb-5 flex items-center justify-between">
              <motion.button
                whileHover={{ x: -1 }}
                whileTap={{ scale: 0.85 }}
                onClick={vorigemMaand}
                className={`rounded-xl p-2 transition-colors ${navBtn}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>

              <AnimatePresence mode="wait">
                <motion.span
                  key={`${maand}-${jaar}`}
                  initial={{ opacity: 0, y: richting * 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: richting * -6 }}
                  transition={{ duration: 0.18 }}
                  className={`text-[15px] font-bold tracking-tight tabular-nums ${calTitleClr}`}
                >
                  {MAANDEN[maand]} {jaar}
                </motion.span>
              </AnimatePresence>

              <motion.button
                whileHover={{ x: 1 }}
                whileTap={{ scale: 0.85 }}
                onClick={volgendeMaand}
                className={`rounded-xl p-2 transition-colors ${navBtn}`}
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            </div>

            {/* Dag headers */}
            <div className="mb-2 grid grid-cols-7">
              {DAGEN_KORT.map((dag) => (
                <div key={dag} className={`py-1 text-center text-[10px] font-bold uppercase tracking-wider ${d ? 'text-white/25' : 'text-[#1a3d2b]/30'}`}>{dag}</div>
              ))}
            </div>

            {/* Kalender dagen */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${maand}-${jaar}`}
                initial={{ opacity: 0, x: richting * 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: richting * -16 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="grid grid-cols-7 gap-y-1"
              >
                {kalenderDagen.map((dag, index) => {
                  if (!dag) return <div key={`leeg-${index}`} />
                  const datumStr = `${jaar}-${String(maand + 1).padStart(2, '0')}-${String(dag).padStart(2, '0')}`
                  const heeftWorkshop = workshopDatums.has(datumStr)
                  const isGeselecteerd = geselecteerdeDag === dag
                  const isVandaag = dag === vandaag.getDate() && maand === vandaag.getMonth() && jaar === vandaag.getFullYear()

                  return (
                    <motion.button
                      key={dag}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.86 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                      onClick={() => setGeselecteerdeDag(isGeselecteerd ? null : dag)}
                      className={`relative mx-auto flex aspect-square w-full max-w-9 flex-col items-center justify-center rounded-xl text-[13px] tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]
                        ${isGeselecteerd
                          ? 'bg-[#1a3d2b] font-bold text-[#d4e84a] shadow-sm shadow-[#1a3d2b]/25'
                          : isVandaag
                          ? 'bg-[#d4e84a] font-bold text-[#1a3d2b]'
                          : heeftWorkshop
                          ? d
                            ? 'font-semibold text-white hover:bg-white/10'
                            : 'font-semibold text-[#1a3d2b] hover:bg-[#eaf3de]'
                          : d
                          ? 'text-white/20 hover:bg-white/5'
                          : 'text-[#1a3d2b]/25 hover:bg-[#1a3d2b]/[0.04]'
                        }`}
                    >
                      {dag}
                      {heeftWorkshop && !isGeselecteerd && !isVandaag && (
                        <span className={`absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${d ? 'bg-[#d4e84a]' : 'bg-[#1a3d2b]'}`} />
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Legenda */}
            <div className={`mt-5 flex flex-col gap-2 border-t ${hairline} pt-4`}>
              <div className={`flex items-center gap-2.5 text-xs ${labelClr}`}>
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${d ? 'bg-[#d4e84a]' : 'bg-[#1a3d2b]'}`} />
                Workshop gepland
              </div>
              <div className={`flex items-center gap-2.5 text-xs ${labelClr}`}>
                <span className="h-4 w-5 shrink-0 rounded-lg bg-[#d4e84a]" />
                Vandaag
              </div>
              <div className={`flex items-center gap-2.5 text-xs ${labelClr}`}>
                <span className="h-4 w-5 shrink-0 rounded-lg bg-[#1a3d2b]" />
                Geselecteerd
              </div>
              <AnimatePresence>
                {geselecteerdeDag && (
                  <motion.button
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setGeselecteerdeDag(null)}
                    className={`mt-1 rounded text-left text-xs font-bold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${d ? 'text-[#d4e84a]' : 'text-[#1a3d2b]'}`}
                  >
                    ✕ Filter wissen
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Workshop lijst */}
          <div className="flex flex-1 flex-col gap-4">
            {/* Label */}
            <AnimatePresence mode="wait">
              <motion.p
                key={geselecteerdeDag || 'alle'}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className={`flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] ${labelClr}`}
              >
                <span className="h-3 w-1 rounded-full bg-[#d4e84a]" />
                {geselecteerdeDag
                  ? `Workshops op ${formatDatum(`${jaar}-${String(maand + 1).padStart(2, '0')}-${String(geselecteerdeDag).padStart(2, '0')}`)}`
                  : `Alle workshops (${loading ? '...' : workshops.length})`
                }
              </motion.p>
            </AnimatePresence>

            {/* Skeleton loading */}
            {showSkeleton && (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`${cardBg} rounded-[26px] border ${cardBorder} p-5`}>
                    <div className="flex items-start gap-3.5">
                      <div className={`h-10 w-10 shrink-0 animate-pulse rounded-2xl ${skelBg}`} />
                      <div className="flex-1 space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <div className={`h-3.5 w-40 animate-pulse rounded-full ${skelBg}`} />
                          <div className={`h-5 w-12 animate-pulse rounded-full ${skelBg}`} />
                        </div>
                        <div className={`h-2.5 w-full animate-pulse rounded-full ${skelBg}`} />
                        <div className={`h-2.5 w-3/4 animate-pulse rounded-full ${skelBg}`} />
                        <div className="flex gap-3 pt-1">
                          <div className={`h-3 w-24 animate-pulse rounded-full ${skelBg}`} />
                          <div className={`h-3 w-20 animate-pulse rounded-full ${skelBg}`} />
                        </div>
                        <div className={`mt-1 flex items-center gap-2 border-t ${hairline} pt-3.5`}>
                          <div className={`h-1 flex-1 animate-pulse rounded-full ${skelBg}`} />
                          <div className={`h-2.5 w-12 animate-pulse rounded-full ${skelBg}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait">
              {!loading && (
                <motion.div
                  key={geselecteerdeDag || 'alle'}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="flex flex-col gap-4"
                >
                  {zichtbareWorkshops.length === 0 ? (
                    <motion.div
                      variants={cardVariants}
                      className={`${cardBg} rounded-[26px] border ${cardBorder} p-10 text-center`}
                    >
                      <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl ${d ? 'bg-white/[0.05]' : 'bg-[#1a3d2b]/[0.04]'}`}>
                        <BookOpen className={`h-5 w-5 ${d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
                      </div>
                      <p className={`mb-4 text-sm font-semibold ${d ? 'text-white/70' : 'text-[#1a3d2b]/70'}`}>Geen workshops op deze dag</p>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setGeselecteerdeDag(null)}
                        className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${
                          d
                            ? 'bg-[#d4e84a]/10 text-[#d4e84a] hover:bg-[#d4e84a]/20'
                            : 'bg-[#1a3d2b] text-[#d4e84a] hover:bg-[#16331f]'
                        }`}
                      >
                        Alle workshops tonen
                      </motion.button>
                    </motion.div>
                  ) : (
                    zichtbareWorkshops.map((workshop) => (
                      <WorkshopCard
                        key={workshop.id}
                        workshop={workshop}
                        navigate={navigate}
                        formatDatum={formatDatum}
                        dark={dark}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default WorkshopOverzicht
