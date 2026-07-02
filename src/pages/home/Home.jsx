import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { CalendarDays, BookOpen, User, LogOut, ArrowRight, MapPin, Moon, Sun, Clock, UserPlus, Copy, Bell } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'
import Card from '../../components/Card'

import { api } from '@/lib/api'
import { getStoredUser, logout } from '@/lib/auth'

// Home / dashboard (route /home): begroeting, eerstvolgende event, snelkoppelingen,
// eigen workshops en het genereren van een uitnodigingslink.
function Home() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const user = getStoredUser()
  const voornaam = user?.name?.split(' ')[0]

  const [workshops, setWorkshops] = useState([])
  const [aankomendEvent, setAankomendEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')
  const [stuurlinkLoading, setStuurlinkLoading] = useState(false)
  const [gegenereerdeLink, setGegenereerdeLink] = useState(null)

  function toggleDark() {
    setDark(d => {
      const next = !d
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchData()
  }, [])

  // Haalt workshops en events parallel op en kiest het eerstvolgende event voor de banner.
  async function fetchData() {
    try {
      const [workshopsJson, eventsJson] = await Promise.all([
        api('/workshops'),
        api('/events'),
      ])
      setWorkshops(workshopsJson.data || [])
      const vandaag = new Date()
      vandaag.setHours(0, 0, 0, 0)
      const komende = (eventsJson.data || [])
        .filter(e => {
          const datum = new Date(e.days?.[0]?.date || e.start_date?.split(' ')?.[0] || 0)
          return datum >= vandaag
        })
        .sort((a, b) => {
          const da = new Date(a.days?.[0]?.date || a.start_date?.split(' ')?.[0] || 0)
          const db = new Date(b.days?.[0]?.date || b.start_date?.split(' ')?.[0] || 0)
          return da - db
        })
      setAankomendEvent(komende[0] || null)
    } catch {
      toast.error('Gegevens ophalen mislukt')
    } finally {
      setLoading(false)
    }
  }

  const ingeschrevenWorkshops = workshops.filter(w => w.is_registered)
  const aantalWorkshops = workshops.length

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  async function handleUitloggen() {
    await logout()
    toast.success('Je bent uitgelogd')
    setTimeout(() => navigate('/login'), 600)
  }

  // Genereert een eenmalige uitnodigingslink en bewaart URL + vervaltijd om te kopiëren.
  async function handleStuurlinkAanmaken() {
    setStuurlinkLoading(true)
    setGegenereerdeLink(null)
    try {
      const data = await api('/invite-tokens', { method: 'POST' })
      const inviteToken = data.token || data.data?.token
      const expiresAt = data.expires_at || data.data?.expires_at
      const url = data.url || data.data?.url || `${window.location.origin}/register?token=${inviteToken}`
      setGegenereerdeLink({ url, expiresAt })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setStuurlinkLoading(false)
    }
  }

  async function handleKopieer(url) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link gekopieerd!')
    } catch {
      toast.error('Kopiëren mislukt')
    }
  }

  // Maakt een klikbaar (niet-knop) element toetsenbord-toegankelijk: Enter en Space.
  const onCardKey = (fn) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn() }
  }

  // Kleur-tokens voor dark/light mode
  const d = dark
  const contentBg   = d ? 'bg-[#111111]'         : 'bg-[#e4e8e2]'
  const cardBg      = d ? 'bg-[#1c1c1e]'         : 'bg-white'
  const cardBorder  = d ? 'border-white/[0.07]'   : 'border-gray-100'
  const divider     = d ? 'border-white/[0.05]'   : 'border-gray-50'
  const labelClr    = d ? 'text-white/60'         : 'text-gray-500'
  const titleClr    = d ? 'text-white'            : 'text-[#1a3d2b]'
  const subClr      = d ? 'text-white/70'         : 'text-gray-500'
  const arrowClr    = d ? 'text-white/20'         : 'text-gray-300'
  const skelBg      = d ? 'bg-white/[0.07]'       : 'bg-gray-100'
  const emptyBg     = d ? 'bg-white/[0.05]'       : 'bg-gray-50'
  const emptyIcon   = d ? 'text-white/20'         : 'text-gray-300'
  const itemBg      = d ? 'bg-white/[0.04]'       : 'bg-[#f6faf2]'
  const emptyBtn    = (d
    ? 'text-[#d4e84a] bg-[#d4e84a]/10 hover:bg-[#d4e84a]/20'
    : 'text-[#1a3d2b] bg-[#eaf3de] hover:bg-[#d4e84a]')
    + ' focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]'
  const navHover    = d ? '#242424' : '#f8faf7'
  const navIcons    = [
    { kleur: d ? 'bg-[#d4e84a]/12' : 'bg-[#d4e84a]',  iconKleur: d ? 'text-[#d4e84a]'  : 'text-[#1a3d2b]' },
    { kleur: d ? 'bg-white/8'      : 'bg-[#eaf3de]',  iconKleur: d ? 'text-white/55'   : 'text-[#1a3d2b]' },
    { kleur: 'bg-[#1a3d2b]',                           iconKleur: 'text-[#d4e84a]'                         },
  ]

  const SpinnerIcon = () => (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )

  return (
    <div className="min-h-[100dvh] bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 40 }}
        className="px-6 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
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

        <div className="flex items-center gap-1">
          {/* Meldingen */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/meldingen')}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
            aria-label="Meldingen"
          >
            <Bell className="w-4 h-4" />
          </motion.button>

          {/* Dark mode toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.88 }}
            onClick={toggleDark}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
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
                  <Sun className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={shouldReduce ? false : { opacity: 0, rotate: 40, scale: 0.6 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={shouldReduce ? {} : { opacity: 0, rotate: -40, scale: 0.6 }}
                  transition={{ duration: 0.18 }}
                >
                  <Moon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleUitloggen}
            className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white/90 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
          >
            <LogOut className="w-3.5 h-3.5" />
            Uitloggen
          </motion.button>
        </div>
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
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.15 }}
          className="max-w-2xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
            className="text-[#d4e84a]/70 text-xs font-bold uppercase tracking-widest mb-2"
          >
            Workshop app
          </motion.p>
          <h1 className="text-4xl font-black text-white leading-none tracking-tight mb-1">
            Hoi,<br />
            <span className="text-[#d4e84a]">{voornaam}!</span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.44 }}
            className="text-white/70 text-sm mt-3"
          >
            Wat wil je doen vandaag?
          </motion.p>
        </motion.div>
      </div>

      {/* Content */}
      <div
        className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pt-7 pb-10 transition-colors duration-300`}
      >
        <div className="max-w-2xl mx-auto flex flex-col gap-4">

        {/* Aankomend event banner */}
        {loading ? (
          <div className="bg-[#1a3d2b]/60 rounded-3xl p-6 h-36 animate-pulse" />
        ) : aankomendEvent ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.28 }}
            whileHover={{ y: -3, boxShadow: '0 20px 48px rgba(26,61,43,0.32)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/events/${aankomendEvent.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={onCardKey(() => navigate(`/events/${aankomendEvent.id}`))}
            className="bg-[#1a3d2b] rounded-3xl p-6 cursor-pointer relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
          >
            {!shouldReduce && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.14, 0.08] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -right-8 -top-8 w-32 h-32 bg-[#d4e84a] rounded-full pointer-events-none"
                />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.07, 0.04] }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  className="absolute right-8 -bottom-10 w-24 h-24 bg-white rounded-full pointer-events-none"
                />
              </>
            )}
            <div className="flex items-start justify-between relative">
              <div className="flex-1">
                <p className="text-[#d4e84a] text-xs font-bold uppercase tracking-widest mb-2">Aankomend event</p>
                <h2 className="text-white text-base font-bold mb-4 leading-snug">{aankomendEvent.title}</h2>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <CalendarDays className="w-3.5 h-3.5 text-[#d4e84a] shrink-0" />
                    <span className="capitalize">
                      {formatDatum(aankomendEvent.days?.[0]?.date || aankomendEvent.start_date?.split(' ')?.[0])}
                    </span>
                  </div>
                  {aankomendEvent.location && (
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <MapPin className="w-3.5 h-3.5 text-[#d4e84a] shrink-0" />
                      <span>{aankomendEvent.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-white/10 p-2 rounded-xl ml-4 shrink-0">
                <ArrowRight className="w-4 h-4 text-[#d4e84a]" />
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* 3 quick-action kaarten */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.38 }}
          className="grid grid-cols-3 gap-3"
        >
          <motion.div
            whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(212,232,74,0.35)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/workshops')}
            role="button"
            tabIndex={0}
            onKeyDown={onCardKey(() => navigate('/workshops'))}
            className="col-span-1 bg-[#d4e84a] rounded-2xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3d2b]"
          >
            <BookOpen className="w-5 h-5 text-[#1a3d2b]" />
            <div>
              {loading ? (
                <div className="h-7 w-8 bg-[#1a3d2b]/10 rounded-lg animate-pulse mb-1" />
              ) : (
                <p className="text-[#1a3d2b] text-2xl font-black leading-none">{aantalWorkshops}</p>
              )}
              <p className="text-[#1a3d2b]/60 text-xs font-semibold mt-0.5">workshops</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, boxShadow: d ? '0 12px 28px rgba(212,232,74,0.1)' : '0 12px 28px rgba(26,61,43,0.1)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/events')}
            role="button"
            tabIndex={0}
            onKeyDown={onCardKey(() => navigate('/events'))}
            className={`col-span-1 ${cardBg} rounded-2xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px] border ${cardBorder} transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]`}
          >
            <CalendarDays className={`w-5 h-5 ${titleClr}`} />
            <div>
              <p className={`text-xs font-bold leading-tight ${titleClr}`}>Alle events</p>
              <ArrowRight className={`w-3.5 h-3.5 mt-1 ${arrowClr}`} />
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(26,61,43,0.22)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate('/profiel')}
            role="button"
            tabIndex={0}
            onKeyDown={onCardKey(() => navigate('/profiel'))}
            className="col-span-1 bg-[#1a3d2b] rounded-2xl p-4 cursor-pointer flex flex-col justify-between min-h-[120px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
          >
            <User className="w-5 h-5 text-[#d4e84a]" />
            <div>
              <p className="text-white text-xs font-bold leading-tight">Mijn profiel</p>
              <ArrowRight className="w-3.5 h-3.5 text-white/60 mt-1" />
            </div>
          </motion.div>
        </motion.div>

        {/* Snel navigeren */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-xs font-bold ${labelClr} uppercase tracking-widest mt-1`}
        >
          Snel navigeren
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.54 }}
          className={`${cardBg} rounded-3xl border ${cardBorder} overflow-hidden shadow-sm transition-colors duration-300`}
        >
          {[
            { label: 'Workshops', desc: 'Bekijk en schrijf je in', icon: BookOpen, path: '/workshops' },
            { label: 'Events', desc: 'Aankomende evenementen', icon: CalendarDays, path: '/events' },
            { label: 'Mijn profiel', desc: 'Gegevens en dieetwensen', icon: User, path: '/profiel' },
          ].map(({ label, desc, icon: Icon, path }, index, arr) => (
            <motion.div
              key={path}
              whileHover={{ x: 4, backgroundColor: navHover }}
              whileTap={{ scale: 0.99 }}
              onClick={() => navigate(path)}
              role="button"
              tabIndex={0}
              onKeyDown={onCardKey(() => navigate(path))}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d4e84a] ${index !== arr.length - 1 ? `border-b ${divider}` : ''}`}
            >
              <div className={`${navIcons[index].kleur} p-2.5 rounded-xl shrink-0`}>
                <Icon className={`w-4 h-4 ${navIcons[index].iconKleur}`} />
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold ${titleClr}`}>{label}</p>
                <p className={`text-xs ${subClr}`}>{desc}</p>
              </div>
              <ArrowRight className={`w-4 h-4 ${arrowClr} shrink-0`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Nodig iemand uit — stuurlink */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.58 }}
        >
          <Card dark={d}>
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-[#d4e84a]/25 p-2.5 rounded-xl shrink-0">
                  <UserPlus className="w-4 h-4 text-[#1a3d2b]" />
                </div>
                <div className="min-w-0">
                  <h2 className={`text-sm font-bold ${titleClr}`}>Nodig iemand uit</h2>
                  <p className={`text-xs ${subClr} mt-0.5`}>Eenmalig geldig &middot; verloopt na 24 uur</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: stuurlinkLoading ? 1 : 1.02, boxShadow: stuurlinkLoading ? 'none' : '0 10px 28px rgba(26,61,43,0.28)' }}
                whileTap={{ scale: stuurlinkLoading ? 1 : 0.97 }}
                type="button"
                onClick={handleStuurlinkAanmaken}
                disabled={stuurlinkLoading}
                className="w-full bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2"
              >
                {stuurlinkLoading ? <><SpinnerIcon />Aanmaken...</> : <><UserPlus className="w-4 h-4" />Nieuwe stuurlink</>}
              </motion.button>

              <AnimatePresence>
                {gegenereerdeLink && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                    className={`mt-4 ${itemBg} rounded-2xl p-4`}
                  >
                    {gegenereerdeLink.expiresAt && (
                      <div className={`flex items-center gap-1.5 text-xs ${subClr} mb-2`}>
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        Geldig tot {new Date(gegenereerdeLink.expiresAt).toLocaleString('nl-NL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    <p className={`text-xs font-mono break-all ${subClr} mb-3`}>{gegenereerdeLink.url}</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => handleKopieer(gegenereerdeLink.url)}
                      className="w-full bg-[#d4e84a] text-[#1a3d2b] rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#c8dc3e] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3d2b]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Kopieer link
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>
        </motion.div>

        {/* Jouw workshops */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.62 }}
          className="flex items-center justify-between mt-1"
        >
          <p className={`text-xs font-bold ${labelClr} uppercase tracking-widest`}>Jouw workshops</p>
          {!loading && ingeschrevenWorkshops.length > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d ? 'bg-white/8 text-white/60' : 'bg-gray-100 text-gray-500'}`}>
              {ingeschrevenWorkshops.length}
            </span>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.66 }}
          className="flex flex-col gap-2.5"
        >
          {loading ? (
            [1, 2].map(i => (
              <div key={i} className={`${cardBg} rounded-2xl border ${cardBorder} overflow-hidden shadow-sm transition-colors duration-300`}>
                <div className={`h-[3px] ${skelBg} animate-pulse`} />
                <div className="px-4 py-4 flex items-center gap-4">
                  <div className={`w-[52px] h-[58px] ${skelBg} rounded-xl animate-pulse shrink-0`} />
                  <div className="flex-1 space-y-2.5">
                    <div className={`h-3 ${skelBg} rounded-full w-40 animate-pulse`} />
                    <div className={`h-2.5 ${skelBg} rounded-full w-24 animate-pulse`} />
                    <div className={`h-2.5 ${skelBg} rounded-full w-32 animate-pulse`} />
                  </div>
                </div>
              </div>
            ))
          ) : ingeschrevenWorkshops.length === 0 ? (
            <div className={`${cardBg} rounded-3xl border ${cardBorder} p-8 text-center shadow-sm transition-colors duration-300`}>
              <div className={`w-12 h-12 ${emptyBg} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                <BookOpen className={`w-5 h-5 ${emptyIcon}`} />
              </div>
              <p className={`text-sm ${subClr} mb-3`}>Je bent nog niet ingeschreven voor workshops</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/workshops')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${emptyBtn}`}
              >
                Bekijk workshops
              </motion.button>
            </div>
          ) : (
            <>
              {ingeschrevenWorkshops.map((workshop, index) => {
                const datum = workshop.start_date?.split(' ')?.[0] || ''
                const tijdStart = workshop.start_date?.split(' ')?.[1] || ''
                const tijdEind = workshop.end_date?.split(' ')?.[1] || ''
                return (
                  <motion.div
                    key={workshop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.72 + index * 0.1 }}
                    whileHover={{ y: -2, boxShadow: d ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(26,61,43,0.12)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/workshops/${workshop.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={onCardKey(() => navigate(`/workshops/${workshop.id}`))}
                    className={`${cardBg} rounded-2xl border ${cardBorder} overflow-hidden cursor-pointer shadow-sm transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]`}
                  >
                    <div className="h-[3px] bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                    <div className="px-4 py-4 flex items-center gap-4">
                      <div className="bg-[#1a3d2b] rounded-xl px-3 py-2.5 text-center shrink-0 min-w-[52px]">
                        <p className="text-[#d4e84a] text-xl font-black leading-none">
                          {datum ? new Date(datum).getDate() : '—'}
                        </p>
                        <p className="text-white/50 text-[10px] font-semibold mt-1 uppercase tracking-wide">
                          {datum ? new Date(datum).toLocaleDateString('nl-NL', { month: 'short' }) : ''}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className={`text-sm font-bold truncate ${titleClr}`}>{workshop.title}</p>
                          <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${d ? 'bg-[#d4e84a]/12 text-[#d4e84a]/70' : 'bg-[#1a3d2b]/8 text-[#1a3d2b]/60'}`}>
                            ✓
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {(tijdStart || tijdEind) && (
                            <div className={`flex items-center gap-1.5 text-xs ${subClr}`}>
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{tijdStart}{tijdEind ? ` - ${tijdEind}` : ''}</span>
                            </div>
                          )}
                          {workshop.location && (
                            <div className={`flex items-center gap-1.5 text-xs ${subClr}`}>
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{workshop.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`shrink-0 w-7 h-7 rounded-xl flex items-center justify-center ${d ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <ArrowRight className={`w-3.5 h-3.5 ${arrowClr}`} />
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              <motion.button
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/workshops')}
                className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold py-3 rounded-2xl transition-colors ${emptyBtn}`}
              >
                Alle workshops bekijken
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </>
          )}
        </motion.div>

        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Home
