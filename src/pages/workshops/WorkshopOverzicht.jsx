import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronLeft, ChevronRight, BookOpen, MapPin, Clock, Calendar, Users, Moon, Sun, AlertTriangle, ClipboardList, Leaf } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'

const MAANDEN = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
const DAGEN_KORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

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

function WorkshopCard({ workshop, index, navigate, formatDatum, dark }) {
  const d = dark
  const isVol = workshop.is_full
  const procentVol = Math.round((workshop.registered / workshop.capacity) * 100)

  const cardBg   = d ? 'bg-[#1c1c1e]'       : 'bg-white'
  const cardBord = d ? 'border-white/[0.07]' : 'border-gray-100'
  const titleClr = d ? 'text-white'          : 'text-[#1a3d2b]'
  const subClr   = d ? 'text-white/45'       : 'text-gray-400'
  const metaBg   = d ? 'bg-white/[0.06]'     : 'bg-gray-50'
  const metaClr  = d ? 'text-white/55'       : 'text-gray-500'
  const metaIcon = d ? 'text-white/30'       : 'text-gray-400'
  const iconBg   = isVol ? 'bg-red-50' : (d ? 'bg-[#d4e84a]/12' : 'bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30')
  const iconClr  = isVol ? 'text-red-400' : (d ? 'text-[#d4e84a]' : 'text-[#1a3d2b]')
  const badgeBg  = isVol
    ? 'bg-red-50 text-red-400 border border-red-100'
    : d ? 'bg-[#d4e84a]/12 text-[#d4e84a]' : 'bg-[#eaf3de] text-[#1a3d2b]'
  const barBg    = d ? 'bg-white/10' : 'bg-gray-100'
  const countClr = isVol ? 'text-red-400' : (d ? 'text-white' : 'text-[#1a3d2b]')

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: d ? '0 16px 36px rgba(0,0,0,0.4)' : '0 16px 36px rgba(26,61,43,0.13)' }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/workshops/${workshop.id}`)}
      className={`${cardBg} rounded-3xl border ${cardBord} overflow-hidden cursor-pointer`}
    >
      <div className={`h-0.5 w-full ${isVol ? 'bg-gradient-to-r from-red-300 to-red-400' : 'bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]'}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${iconBg}`}>
            <BookOpen className={`w-5 h-5 ${iconClr}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h2 className={`text-sm font-bold leading-snug ${titleClr}`}>{workshop.title}</h2>
              <span className={`shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide ${badgeBg}`}>
                {isVol ? 'vol' : 'open'}
              </span>
            </div>

            <p className={`text-xs mb-3 leading-relaxed line-clamp-2 ${subClr}`}>{workshop.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${metaBg} ${metaClr}`}>
                <Calendar className={`w-3 h-3 ${metaIcon}`} />
                <span className="capitalize">{formatDatum(workshop.start_date.split(' ')[0])}</span>
              </span>
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${metaBg} ${metaClr}`}>
                <Clock className={`w-3 h-3 ${metaIcon}`} />
                {workshop.start_date.split(' ')[1]} – {workshop.end_date.split(' ')[1]}
              </span>
              <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${metaBg} ${metaClr}`}>
                <MapPin className={`w-3 h-3 ${metaIcon}`} />
                {workshop.location}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className={`flex-1 ${barBg} rounded-full h-1.5 overflow-hidden`}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${procentVol}%` }}
                  transition={{ duration: 0.9, delay: 0.15 + index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                  className={`h-full rounded-full ${isVol ? 'bg-gradient-to-r from-red-300 to-red-400' : 'bg-gradient-to-r from-[#1a3d2b] to-[#4a8c60]'}`}
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Users className={`w-3 h-3 ${d ? 'text-white/20' : 'text-gray-300'}`} />
                <span className={`text-xs font-bold ${countClr}`}>
                  {workshop.registered}/{workshop.capacity}
                </span>
              </div>
            </div>

            {(workshop.important_notes || workshop.requirements || workshop.dietary_info || workshop.allergens) && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {workshop.important_notes && (
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${d ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Waarschuwing
                  </span>
                )}
                {workshop.requirements && (Array.isArray(workshop.requirements) ? workshop.requirements.length > 0 : true) && (
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${d ? 'bg-white/10 text-white/45' : 'bg-gray-100 text-gray-500'}`}>
                    <ClipboardList className="w-2.5 h-2.5" />
                    Benodigdheden
                  </span>
                )}
                {(workshop.dietary_info || workshop.allergens) && (
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${d ? 'bg-[#d4e84a]/10 text-[#d4e84a]/60' : 'bg-[#eaf3de] text-[#4a8c60]'}`}>
                    <Leaf className="w-2.5 h-2.5" />
                    Dieetinfo
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
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
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/workshops`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      setWorkshops(data.data)
    } catch (error) {
      toast.error('Workshops ophalen mislukt')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const kalenderDagen = getKalenderDagen(jaar, maand)

  const workshopDatums = new Set(workshops.map((w) => w.start_date.split(' ')[0]))

  const geselecteerdeDatum = geselecteerdeDag
    ? `${jaar}-${String(maand + 1).padStart(2, '0')}-${String(geselecteerdeDag).padStart(2, '0')}`
    : null

  const zichtbareWorkshops = geselecteerdeDatum
    ? workshops.filter((w) => w.start_date.split(' ')[0] === geselecteerdeDatum)
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

  const d = dark
  const contentBg  = d ? 'bg-[#111111]'       : 'bg-[#e4e8e2]'
  const cardBg     = d ? 'bg-[#1c1c1e]'       : 'bg-white'
  const cardBorder = d ? 'border-white/[0.07]' : 'border-gray-100'
  const skelBg     = d ? 'bg-white/[0.07]'    : 'bg-gray-100'
  const labelClr   = d ? 'text-white/30'       : 'text-gray-400'
  const calTitleClr = d ? 'text-white'         : 'text-[#1a3d2b]'

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
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
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
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
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
        {!shouldReduce && (
          <>
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
          </>
        )}

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
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Workshops</h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {loading ? (
              <div className="h-6 w-36 bg-white/10 rounded-full animate-pulse" />
            ) : (
              <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">
                <BookOpen className="w-3 h-3" />
                {workshops.length} workshops beschikbaar
              </span>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Content sectie */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pt-7 pb-10`}>
        <div className="max-w-5xl mx-auto flex flex-col gap-4 md:flex-row md:gap-6 md:items-start">

          {/* Kalender */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.25 }}
            className={`${cardBg} rounded-3xl border ${cardBorder} shadow-sm p-6 w-full md:w-80 md:shrink-0 md:sticky md:top-6`}
          >
            {/* Maand navigatie */}
            <div className="flex items-center justify-between mb-5">
              <motion.button
                whileHover={{ scale: 1.15, x: -1 }}
                whileTap={{ scale: 0.85 }}
                onClick={vorigemMaand}
                className={`p-2 rounded-xl transition-colors ${d ? 'text-white/30 hover:text-white hover:bg-white/10' : 'text-gray-300 hover:text-[#1a3d2b] hover:bg-gray-50'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <AnimatePresence mode="wait">
                <motion.span
                  key={`${maand}-${jaar}`}
                  initial={{ opacity: 0, y: maandRichting * 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: maandRichting * -8 }}
                  transition={{ duration: 0.18 }}
                  className={`text-sm font-bold ${calTitleClr}`}
                >
                  {MAANDEN[maand]} {jaar}
                </motion.span>
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.15, x: 1 }}
                whileTap={{ scale: 0.85 }}
                onClick={volgendeMaand}
                className={`p-2 rounded-xl transition-colors ${d ? 'text-white/30 hover:text-white hover:bg-white/10' : 'text-gray-300 hover:text-[#1a3d2b] hover:bg-gray-50'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Dag headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAGEN_KORT.map((dag) => (
                <div key={dag} className={`text-center text-[11px] font-bold py-1 ${d ? 'text-white/20' : 'text-gray-300'}`}>{dag}</div>
              ))}
            </div>

            {/* Kalender dagen */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${maand}-${jaar}`}
                initial={{ opacity: 0, x: maandRichting * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: maandRichting * -20 }}
                transition={{ duration: 0.2 }}
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
                      whileHover={{ scale: heeftWorkshop || isVandaag || isGeselecteerd ? 1.2 : 1.05 }}
                      whileTap={{ scale: 0.82 }}
                      onClick={() => setGeselecteerdeDag(isGeselecteerd ? null : dag)}
                      className={`relative flex flex-col items-center justify-center rounded-xl text-xs font-medium transition-colors duration-150 mx-auto w-9 h-9
                        ${isGeselecteerd
                          ? 'bg-[#1a3d2b] text-[#d4e84a] font-bold shadow-md shadow-[#1a3d2b]/25'
                          : isVandaag
                          ? 'bg-[#d4e84a] text-[#1a3d2b] font-bold shadow-sm'
                          : heeftWorkshop
                          ? d
                            ? 'text-white font-semibold hover:bg-white/10'
                            : 'text-[#1a3d2b] font-semibold hover:bg-[#eaf3de]'
                          : d
                          ? 'text-white/15 hover:bg-white/5'
                          : 'text-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {dag}
                      {heeftWorkshop && !isGeselecteerd && !isVandaag && (
                        <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${d ? 'bg-[#d4e84a]' : 'bg-[#1a3d2b]'}`} />
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Legenda */}
            <div className={`mt-5 pt-4 border-t ${d ? 'border-white/[0.07]' : 'border-gray-100'} flex flex-col gap-2`}>
              <div className={`flex items-center gap-2 text-xs ${labelClr}`}>
                <span className={`w-2 h-2 rounded-full ${d ? 'bg-[#d4e84a]' : 'bg-[#1a3d2b]'} shrink-0`} />
                Workshop gepland
              </div>
              <div className={`flex items-center gap-2 text-xs ${labelClr}`}>
                <span className="w-6 h-5 rounded-lg bg-[#d4e84a] shrink-0" />
                Vandaag
              </div>
              <div className={`flex items-center gap-2 text-xs ${labelClr}`}>
                <span className="w-6 h-5 rounded-lg bg-[#1a3d2b] shrink-0" />
                Geselecteerd
              </div>
              <AnimatePresence>
                {geselecteerdeDag && (
                  <motion.button
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setGeselecteerdeDag(null)}
                    className={`mt-1 text-xs font-bold hover:underline underline-offset-2 text-left ${d ? 'text-[#d4e84a]' : 'text-[#1a3d2b]'}`}
                  >
                    ✕ Filter wissen
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Workshop lijst */}
          <div className="flex-1 flex flex-col gap-3">
            {/* Label */}
            <AnimatePresence mode="wait">
              <motion.p
                key={geselecteerdeDag || 'alle'}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
                className={`text-xs font-bold uppercase tracking-widest ${labelClr}`}
              >
                {geselecteerdeDag
                  ? `Workshops op ${formatDatum(`${jaar}-${String(maand + 1).padStart(2, '0')}-${String(geselecteerdeDag).padStart(2, '0')}`)}`
                  : `Alle workshops (${loading ? '...' : workshops.length})`
                }
              </motion.p>
            </AnimatePresence>

            {/* Skeleton loading */}
            {showSkeleton && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden`}>
                    <div className={`h-0.5 ${skelBg} animate-pulse`} />
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-2xl ${skelBg} animate-pulse shrink-0`} />
                        <div className="flex-1 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className={`h-3.5 ${skelBg} rounded-full w-40 animate-pulse`} />
                            <div className={`h-5 ${skelBg} rounded-full w-12 animate-pulse`} />
                          </div>
                          <div className={`h-2.5 ${skelBg} rounded-full w-full animate-pulse`} />
                          <div className={`h-2.5 ${skelBg} rounded-full w-3/4 animate-pulse`} />
                          <div className="flex gap-2 pt-1">
                            <div className={`h-6 ${skelBg} rounded-lg w-24 animate-pulse`} />
                            <div className={`h-6 ${skelBg} rounded-lg w-20 animate-pulse`} />
                            <div className={`h-6 ${skelBg} rounded-lg w-16 animate-pulse`} />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className={`flex-1 h-1.5 ${skelBg} rounded-full animate-pulse`} />
                            <div className={`h-2.5 ${skelBg} rounded-full w-8 animate-pulse`} />
                          </div>
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
                  className="flex flex-col gap-3"
                >
                  {zichtbareWorkshops.length === 0 ? (
                    <motion.div
                      variants={cardVariants}
                      className={`${cardBg} rounded-3xl border ${cardBorder} p-10 text-center`}
                    >
                      <motion.div
                        animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className={`w-12 h-12 ${d ? 'bg-white/[0.05]' : 'bg-gray-50'} rounded-2xl flex items-center justify-center mx-auto mb-3`}
                      >
                        <BookOpen className={`w-5 h-5 ${d ? 'text-white/20' : 'text-gray-300'}`} />
                      </motion.div>
                      <p className={`text-sm font-semibold mb-3 ${d ? 'text-white/40' : 'text-gray-400'}`}>Geen workshops op deze dag</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGeselecteerdeDag(null)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          d
                            ? 'text-[#d4e84a] bg-[#d4e84a]/10 hover:bg-[#d4e84a]/20'
                            : 'text-[#1a3d2b] bg-[#eaf3de] hover:bg-[#d4e84a]'
                        }`}
                      >
                        Alle workshops tonen
                      </motion.button>
                    </motion.div>
                  ) : (
                    zichtbareWorkshops.map((workshop, index) => (
                      <WorkshopCard
                        key={workshop.id}
                        workshop={workshop}
                        index={index}
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
