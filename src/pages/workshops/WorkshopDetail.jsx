import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, Users, CheckCircle, MapPin, BookOpen, User, Tag, Moon, Sun, AlertTriangle, ClipboardList, Leaf } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'

function WorkshopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [workshop, setWorkshop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [ingeschreven, setIngeschreven] = useState(false)
  const [registratieLoading, setRegistratieLoading] = useState(false)
  const [geselecteerdeSessie, setGeselecteerdeSessie] = useState(null)
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
  }, [id])

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

  async function handleUitschrijven() {
    setRegistratieLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/workshops/${id}/unregister`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      toast.success(data.message || 'Je bent uitgeschreven')
      await fetchWorkshop()
    } catch (error) {
      toast.error(error.message || 'Uitschrijven mislukt')
    } finally {
      setRegistratieLoading(false)
    }
  }

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  const d = dark
  const contentBg  = d ? 'bg-[#111111]'       : 'bg-[#e4e8e2]'
  const cardBg     = d ? 'bg-[#1c1c1e]'       : 'bg-white'
  const cardBorder = d ? 'border-white/[0.07]' : 'border-gray-100'
  const skelBg     = d ? 'bg-white/[0.07]'    : 'bg-gray-100'
  const titleClr   = d ? 'text-white'          : 'text-[#1a3d2b]'
  const subClr     = d ? 'text-white/45'       : 'text-gray-400'
  const iconBg     = d ? 'bg-[#d4e84a]/12'     : 'bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30'
  const iconClr    = d ? 'text-[#d4e84a]'      : 'text-[#1a3d2b]'
  const barBg      = d ? 'bg-white/10'         : 'bg-gray-100'

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
            onClick={() => navigate('/workshops')}
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
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.06, 0.1, 0.06] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-16 -top-8 w-64 h-64 bg-[#d4e84a] rounded-full pointer-events-none"
          />
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
            Workshop
          </motion.p>

          {loading ? (
            <div className="space-y-2">
              <div className="h-8 w-56 bg-white/10 rounded-xl animate-pulse" />
              <div className="h-4 w-32 bg-white/10 rounded-full animate-pulse" />
            </div>
          ) : workshop ? (
            <>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight mb-2">
                {workshop.title}
              </h1>
              {workshop.teacher && (
                <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-xs font-medium px-3 py-1.5 rounded-full">
                  <User className="w-3 h-3" />
                  {workshop.teacher}
                </span>
              )}
            </>
          ) : null}
        </motion.div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pt-7 pb-10`}>
        <div className="max-w-2xl mx-auto flex flex-col gap-4">

          {/* Loading skeleton */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden`}>
                  <div className={`h-0.5 ${skelBg} animate-pulse`} />
                  <div className="p-5 space-y-3">
                    <div className={`h-4 w-32 ${skelBg} rounded-full animate-pulse`} />
                    <div className={`h-3 w-full ${skelBg} rounded-full animate-pulse`} />
                    <div className={`h-3 w-3/4 ${skelBg} rounded-full animate-pulse`} />
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
              className={`${cardBg} rounded-3xl border ${cardBorder} p-10 text-center`}
            >
              <div className={`w-12 h-12 ${d ? 'bg-white/[0.05]' : 'bg-gray-50'} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <BookOpen className={`w-5 h-5 ${d ? 'text-white/20' : 'text-gray-300'}`} />
              </div>
              <p className={`text-sm font-semibold mb-3 ${subClr}`}>Workshop niet gevonden</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/workshops')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                  d ? 'text-[#d4e84a] bg-[#d4e84a]/10 hover:bg-[#d4e84a]/20' : 'text-[#1a3d2b] bg-[#eaf3de] hover:bg-[#d4e84a]'
                }`}
              >
                Terug naar overzicht
              </motion.button>
            </motion.div>
          )}

          {!loading && workshop && (
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
                    Je bent ingeschreven voor deze workshop
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Info kaart */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.1 }}
                className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden shadow-sm`}
              >
                <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                <div className="p-5 flex flex-col gap-4">

                  <div className="flex items-center gap-3">
                    <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
                      <CalendarDays className={`w-4 h-4 ${iconClr}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${subClr}`}>Datum</p>
                      <p className={`text-sm font-semibold capitalize ${titleClr}`}>
                        {formatDatum(workshop.start_date.split(' ')[0])}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
                      <Clock className={`w-4 h-4 ${iconClr}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${subClr}`}>Tijd</p>
                      <p className={`text-sm font-semibold ${titleClr}`}>
                        {workshop.start_date.split(' ')[1]} – {workshop.end_date.split(' ')[1]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`${iconBg} p-2.5 rounded-xl shrink-0`}>
                      <MapPin className={`w-4 h-4 ${iconClr}`} />
                    </div>
                    <div>
                      <p className={`text-xs ${subClr}`}>Locatie</p>
                      <p className={`text-sm font-semibold ${titleClr}`}>{workshop.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${workshop.is_full ? 'bg-red-50' : iconBg}`}>
                      <Users className={`w-4 h-4 ${workshop.is_full ? 'text-red-400' : iconClr}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs ${subClr}`}>Beschikbare plekken</p>
                      <p className={`text-sm font-semibold ${workshop.is_full ? 'text-red-500' : titleClr}`}>
                        {workshop.is_full
                          ? 'Vol — geen plekken meer beschikbaar'
                          : `${workshop.spots_left} van ${workshop.capacity} plekken vrij`}
                      </p>
                    </div>
                  </div>

                  {/* Voortgangsbalk */}
                  <div className="flex items-center gap-2.5">
                    <div className={`flex-1 ${barBg} rounded-full h-1.5 overflow-hidden`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round((workshop.registered / workshop.capacity) * 100)}%` }}
                        transition={{ duration: 0.9, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className={`h-full rounded-full ${workshop.is_full ? 'bg-gradient-to-r from-red-300 to-red-400' : 'bg-gradient-to-r from-[#1a3d2b] to-[#4a8c60]'}`}
                      />
                    </div>
                    <span className={`text-xs font-bold shrink-0 ${workshop.is_full ? 'text-red-400' : titleClr}`}>
                      {workshop.registered}/{workshop.capacity}
                    </span>
                  </div>

                </div>
              </motion.div>

              {/* Beschrijving */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.18 }}
                className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden shadow-sm`}
              >
                <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                <div className="p-5">
                  <h2 className={`text-sm font-bold mb-3 ${titleClr}`}>Over deze workshop</h2>
                  <p className={`text-sm leading-relaxed ${subClr}`}>{workshop.description}</p>
                </div>
              </motion.div>

              {/* Waarschuwingen */}
              {workshop.important_notes && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.24 }}
                  className={`rounded-3xl border overflow-hidden shadow-sm ${d ? 'bg-amber-950/30 border-amber-500/25' : 'bg-amber-50 border-amber-200'}`}
                >
                  <div className="h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300" />
                  <div className="p-5">
                    <h2 className={`text-sm font-bold mb-3 flex items-center gap-2 ${d ? 'text-amber-300' : 'text-amber-700'}`}>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Belangrijke informatie
                    </h2>
                    <p className={`text-sm leading-relaxed ${d ? 'text-amber-200/70' : 'text-amber-700/75'}`}>{workshop.important_notes}</p>
                  </div>
                </motion.div>
              )}

              {/* Benodigdheden */}
              {workshop.requirements && (Array.isArray(workshop.requirements) ? workshop.requirements.length > 0 : true) && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.3 }}
                  className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden shadow-sm`}
                >
                  <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                  <div className="p-5">
                    <h2 className={`text-sm font-bold mb-3 flex items-center gap-2 ${titleClr}`}>
                      <ClipboardList className="w-3.5 h-3.5" />
                      Benodigdheden
                    </h2>
                    {Array.isArray(workshop.requirements) ? (
                      <ul className="flex flex-col gap-2">
                        {workshop.requirements.map((item, i) => (
                          <li key={i} className={`flex items-start gap-2.5 text-sm ${subClr}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${d ? 'bg-[#d4e84a]/50' : 'bg-[#1a3d2b]/40'}`} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-sm leading-relaxed ${subClr}`}>{workshop.requirements}</p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Dieetwensen & allergenen */}
              {(workshop.dietary_info || workshop.allergens) && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.36 }}
                  className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden shadow-sm`}
                >
                  <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                  <div className="p-5">
                    <h2 className={`text-sm font-bold mb-3 flex items-center gap-2 ${titleClr}`}>
                      <Leaf className="w-3.5 h-3.5" />
                      Dieetwensen & allergenen
                    </h2>
                    {(() => {
                      const info = workshop.dietary_info || workshop.allergens
                      return Array.isArray(info) ? (
                        <div className="flex flex-wrap gap-2">
                          {info.map((item, i) => (
                            <span key={i} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${d ? 'bg-[#d4e84a]/12 text-[#d4e84a]/80' : 'bg-[#eaf3de] text-[#1a3d2b]'}`}>
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className={`text-sm leading-relaxed ${subClr}`}>{info}</p>
                      )
                    })()}
                  </div>
                </motion.div>
              )}

              {/* Sessie-selectie */}
              {workshop.registration_mode === 'session' && workshop.sessions?.length > 0 && !ingeschreven && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.26 }}
                  className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden shadow-sm`}
                >
                  <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                  <div className="p-5">
                    <h2 className={`text-sm font-bold mb-3 flex items-center gap-2 ${titleClr}`}>
                      <Tag className="w-3.5 h-3.5" />
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
                            className={`w-full text-left px-4 py-3 rounded-2xl border-2 transition-all duration-150
                              ${sessie.is_full
                                ? d ? 'border-white/[0.05] bg-white/[0.03] opacity-50 cursor-not-allowed' : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                : isGekozen
                                  ? d ? 'border-[#d4e84a]/50 bg-[#d4e84a]/10' : 'border-[#1a3d2b] bg-[#eaf3de]'
                                  : d ? 'border-white/[0.07] hover:border-white/20 hover:bg-white/[0.06]' : 'border-gray-100 hover:border-[#1a3d2b]/30 hover:bg-gray-50'
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-sm font-semibold ${titleClr}`}>
                                  {sessie.date} &middot; {sessie.start_time} – {sessie.end_time}
                                </p>
                                <p className={`text-xs mt-0.5 ${subClr}`}>{sessie.location}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {sessie.is_full ? (
                                  <span className="text-xs font-bold text-red-400 bg-red-50 px-2 py-0.5 rounded-full">vol</span>
                                ) : (
                                  <span className={`text-xs ${subClr}`}>{sessie.spots_left} vrij</span>
                                )}
                                {isGekozen && <CheckCircle className={`w-4 h-4 ${d ? 'text-[#d4e84a]' : 'text-[#1a3d2b]'}`} />}
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Actie knoppen */}
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30, delay: 0.34 }}
                className="flex flex-col gap-2"
              >
                {!ingeschreven ? (
                  <motion.button
                    whileHover={{ scale: registratieLoading || workshop.is_full ? 1 : 1.02 }}
                    whileTap={{ scale: registratieLoading || workshop.is_full ? 1 : 0.98 }}
                    onClick={handleInschrijven}
                    disabled={registratieLoading || workshop.is_full}
                    className={`w-full rounded-2xl py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2
                      ${workshop.is_full
                        ? d ? 'bg-white/[0.05] text-white/25 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-[#d4e84a] text-[#1a3d2b] hover:bg-[#c8dc3e]'
                      } disabled:opacity-60`}
                  >
                    {registratieLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Inschrijven...
                      </>
                    ) : workshop.is_full ? (
                      'Workshop is vol'
                    ) : (
                      'Inschrijven'
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: registratieLoading ? 1 : 1.02 }}
                    whileTap={{ scale: registratieLoading ? 1 : 0.98 }}
                    onClick={handleUitschrijven}
                    disabled={registratieLoading}
                    className={`w-full rounded-2xl py-4 text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60
                      ${d ? 'bg-white/[0.07] text-white/40 hover:bg-red-900/30 hover:text-red-400' : 'bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}
                  >
                    {registratieLoading ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Uitschrijven...
                      </>
                    ) : (
                      'Uitschrijven'
                    )}
                  </motion.button>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default WorkshopDetail
