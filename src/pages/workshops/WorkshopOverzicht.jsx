import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, BookOpen, MapPin, Clock, Calendar, Users } from 'lucide-react'
import { toast, Toaster } from 'sonner'

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

function WorkshopCard({ workshop, index, navigate, formatDatum }) {
  const isVol = workshop.is_full
  const procentVol = Math.round((workshop.registered / workshop.capacity) * 100)

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, boxShadow: '0 16px 36px rgba(26,61,43,0.13)' }}
      whileTap={{ scale: 0.99 }}
      onClick={() => navigate(`/workshops/${workshop.id}`)}
      className="bg-white rounded-3xl border border-gray-100 overflow-hidden cursor-pointer"
    >
      <div className={`h-0.5 w-full ${isVol ? 'bg-gradient-to-r from-red-300 to-red-400' : 'bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]'}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${isVol ? 'bg-red-50' : 'bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30'}`}>
            <BookOpen className={`w-5 h-5 ${isVol ? 'text-red-400' : 'text-[#1a3d2b]'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h2 className="text-sm font-bold text-[#1a3d2b] leading-snug">{workshop.title}</h2>
              {isVol ? (
                <span className="shrink-0 bg-red-50 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-100 uppercase tracking-wide">vol</span>
              ) : (
                <span className="shrink-0 bg-[#eaf3de] text-[#1a3d2b] text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">open</span>
              )}
            </div>

            <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">{workshop.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="capitalize">{formatDatum(workshop.start_date.split(' ')[0])}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                <Clock className="w-3 h-3 text-gray-400" />
                {workshop.start_date.split(' ')[1]} – {workshop.end_date.split(' ')[1]}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg">
                <MapPin className="w-3 h-3 text-gray-400" />
                {workshop.location}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${procentVol}%` }}
                  transition={{ duration: 0.9, delay: 0.15 + index * 0.05, ease: [0.4, 0, 0.2, 1] }}
                  className={`h-full rounded-full ${isVol ? 'bg-gradient-to-r from-red-300 to-red-400' : 'bg-gradient-to-r from-[#1a3d2b] to-[#4a8c60]'}`}
                />
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Users className="w-3 h-3 text-gray-300" />
                <span className={`text-xs font-bold ${isVol ? 'text-red-400' : 'text-[#1a3d2b]'}`}>
                  {workshop.registered}/{workshop.capacity}
                </span>
              </div>
            </div>
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
  const [jaar, setJaar] = useState(vandaag.getFullYear())
  const [maand, setMaand] = useState(vandaag.getMonth())
  const [geselecteerdeDag, setGeselecteerdeDag] = useState(null)
  const [maandRichting, setMaandRichting] = useState(1)

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
          onClick={() => navigate('/home')}
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

      {/* Witte content sectie */}
      <div className="flex-1 bg-[#e4e8e2] rounded-t-[2.5rem] px-5 pt-7 pb-10">
        <div className="max-w-5xl mx-auto flex gap-6 items-start">

          {/* Kalender */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.25 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 w-80 shrink-0 sticky top-6"
          >
            {/* Maand navigatie */}
            <div className="flex items-center justify-between mb-5">
              <motion.button
                whileHover={{ scale: 1.15, x: -1 }}
                whileTap={{ scale: 0.85 }}
                onClick={vorigemMaand}
                className="p-2 rounded-xl hover:bg-gray-50 text-gray-300 hover:text-[#1a3d2b] transition-colors"
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
                  className="text-sm font-bold text-[#1a3d2b]"
                >
                  {MAANDEN[maand]} {jaar}
                </motion.span>
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.15, x: 1 }}
                whileTap={{ scale: 0.85 }}
                onClick={volgendeMaand}
                className="p-2 rounded-xl hover:bg-gray-50 text-gray-300 hover:text-[#1a3d2b] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Dag headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAGEN_KORT.map((d) => (
                <div key={d} className="text-center text-[11px] font-bold text-gray-300 py-1">{d}</div>
              ))}
            </div>

            {/* Kalender dagen met slide-animatie bij maandwissel */}
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
                          ? 'text-[#1a3d2b] font-semibold hover:bg-[#eaf3de]'
                          : 'text-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {dag}
                      {heeftWorkshop && !isGeselecteerd && !isVandaag && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1a3d2b]" />
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>

            {/* Legenda */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-[#1a3d2b] shrink-0" />
                Workshop gepland
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-6 h-5 rounded-lg bg-[#d4e84a] shrink-0" />
                Vandaag
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
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
                    className="mt-1 text-xs text-[#1a3d2b] font-bold hover:underline underline-offset-2 text-left"
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
                className="text-xs font-bold text-gray-400 uppercase tracking-widest"
              >
                {geselecteerdeDag
                  ? `Workshops op ${formatDatum(`${jaar}-${String(maand + 1).padStart(2, '0')}-${String(geselecteerdeDag).padStart(2, '0')}`)}`
                  : `Alle workshops (${loading ? '...' : workshops.length})`
                }
              </motion.p>
            </AnimatePresence>

            {/* Skeleton loading */}
            {loading && (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
                    <div className="h-0.5 bg-gray-100 animate-pulse" />
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="h-3.5 bg-gray-100 rounded-full w-40 animate-pulse" />
                            <div className="h-5 bg-gray-100 rounded-full w-12 animate-pulse" />
                          </div>
                          <div className="h-2.5 bg-gray-100 rounded-full w-full animate-pulse" />
                          <div className="h-2.5 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                          <div className="flex gap-2 pt-1">
                            <div className="h-6 bg-gray-100 rounded-lg w-24 animate-pulse" />
                            <div className="h-6 bg-gray-100 rounded-lg w-20 animate-pulse" />
                            <div className="h-6 bg-gray-100 rounded-lg w-16 animate-pulse" />
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full animate-pulse" />
                            <div className="h-2.5 bg-gray-100 rounded-full w-8 animate-pulse" />
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
                      className="bg-white rounded-3xl border border-gray-100 p-10 text-center"
                    >
                      <motion.div
                        animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3"
                      >
                        <BookOpen className="w-5 h-5 text-gray-300" />
                      </motion.div>
                      <p className="text-sm font-semibold text-gray-400 mb-3">Geen workshops op deze dag</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGeselecteerdeDag(null)}
                        className="text-xs text-[#1a3d2b] font-bold bg-[#eaf3de] px-3 py-1.5 rounded-lg hover:bg-[#d4e84a] transition-colors"
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
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkshopOverzicht