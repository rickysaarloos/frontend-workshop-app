import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { User, Mail, Lock, Utensils, LogOut, ChevronLeft, Save, Check, BookOpen, CalendarDays, ArrowRight, Eye, EyeOff, Moon, Sun, UserPlus, Copy, Clock } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import Footer from '../../components/Footer'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'

const dieetOpties = [
  'Vegetarisch', 'Veganistisch', 'Glutenvrij', 'Lactosevrij',
  'Halal', 'Kosher', 'Notenallergie', 'Geen restricties',
]

function Profiel() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  const [naam, setNaam] = useState(() => JSON.parse(localStorage.getItem('user') || 'null')?.name || '')
  const [email, setEmail] = useState(() => JSON.parse(localStorage.getItem('user') || 'null')?.email || '')
  const [rol, setRol] = useState(() => {
    const u = JSON.parse(localStorage.getItem('user') || 'null')
    return u?.roles?.[0] || u?.role || 'student'
  })
  const [huidigWachtwoord, setHuidigWachtwoord] = useState('')
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('')
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')
  const [geselecteerdeDieet, setGeselecteerdeDieet] = useState(['Geen restricties'])
  const [profielLoading, setProfielLoading] = useState(false)
  const [wachtwoordLoading, setWachtwoordLoading] = useState(false)
  const [dieetLoading, setDieetLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [actieveTab, setActieveTab] = useState('info')
  const [ingeschrevenWorkshops, setIngeschrevenWorkshops] = useState([])
  const [ingeschrevenEvents, setIngeschrevenEvents] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [toonNieuw, setToonNieuw] = useState(false)
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
    fetchAlles(token)
  }, [])

  async function fetchAlles(token) {
    const headers = { Authorization: `Bearer ${token}`, Accept: 'application/json' }
    try {
      const [userRes, workshopsRes, eventsRes] = await Promise.all([
        fetch(`${API_URL}/api/user`, { headers }),
        fetch(`${API_URL}/api/workshops`, { headers }),
        fetch(`${API_URL}/api/events`, { headers }),
      ])
      if (userRes.status === 401) { navigate('/login'); return }
      const [userJson, workshopsJson, eventsJson] = await Promise.all([
        userRes.json(),
        workshopsRes.json(),
        eventsRes.json(),
      ])
      if (userJson.name)  setNaam(userJson.name)
      if (userJson.email) setEmail(userJson.email)
      const fetchedRol = userJson.roles?.[0] || userJson.role
      if (fetchedRol) setRol(fetchedRol)
      if (userJson.dietary_preferences?.length) setGeselecteerdeDieet(userJson.dietary_preferences)
      const existing = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...existing, ...userJson }))
      setIngeschrevenWorkshops((workshopsJson.data || []).filter(w => w.is_registered))
      setIngeschrevenEvents((eventsJson.data || []).filter(e => e.is_registered))
    } catch {
      toast.error('Gegevens ophalen mislukt')
    } finally {
      setDataLoading(false)
    }
  }

  function toggleDieet(optie) {
    if (optie === 'Geen restricties') { setGeselecteerdeDieet(['Geen restricties']); return }
    setGeselecteerdeDieet(prev => {
      const zonderGeen = prev.filter(d => d !== 'Geen restricties')
      if (zonderGeen.includes(optie)) {
        const nieuw = zonderGeen.filter(d => d !== optie)
        return nieuw.length === 0 ? ['Geen restricties'] : nieuw
      }
      return [...zonderGeen, optie]
    })
  }

  async function handleProfielOpslaan(e) {
    e.preventDefault()
    if (!naam || !email) { toast.error('Vul naam en e-mailadres in'); return }
    setProfielLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/user`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: naam, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Opslaan mislukt')
      const fresh = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...fresh, name: naam, email }))
      toast.success('Profiel opgeslagen!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProfielLoading(false)
    }
  }

  async function handleWachtwoordWijzigen(e) {
    e.preventDefault()
    if (!huidigWachtwoord || !nieuwWachtwoord || !wachtwoordHerhaal) { toast.error('Vul alle velden in'); return }
    if (nieuwWachtwoord !== wachtwoordHerhaal) { toast.error('Wachtwoorden komen niet overeen'); return }
    if (nieuwWachtwoord.length < 8) { toast.error('Minimaal 8 tekens'); return }
    setWachtwoordLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/user`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: huidigWachtwoord, password: nieuwWachtwoord, password_confirmation: wachtwoordHerhaal }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Wijzigen mislukt')
      toast.success('Wachtwoord gewijzigd!')
      setHuidigWachtwoord(''); setNieuwWachtwoord(''); setWachtwoordHerhaal('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setWachtwoordLoading(false)
    }
  }

  async function handleDieetOpslaan() {
    setDieetLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/user/dietary-preferences`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ dietary_preferences: geselecteerdeDieet }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Opslaan mislukt')
      toast.success('Dieetwensen opgeslagen!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setDieetLoading(false)
    }
  }

  async function handleStuurlinkAanmaken() {
    setStuurlinkLoading(true)
    setGegenereerdeLink(null)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/invite-tokens`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Aanmaken mislukt')
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

  function handleUitloggen() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Je bent uitgelogd')
    setTimeout(() => navigate('/login'), 600)
  }

  function formatDatum(datum) {
    if (!datum) return ''
    return new Date(datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
  }

  // Design tokens
  const d = dark
  const contentBg      = d ? 'bg-[#111111]'         : 'bg-[#e8ecdf]'
  const cardBg         = d ? 'bg-[#1c1c1e]'         : 'bg-white'
  const shellBg        = d ? 'bg-white/[0.025]'      : 'bg-black/[0.018]'
  const shellBorder    = d ? 'border-white/[0.07]'   : 'border-black/[0.05]'
  const cardInnerShadow = d ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]' : 'shadow-sm'
  const labelClr       = d ? 'text-white/30'         : 'text-gray-400'
  const titleClr       = d ? 'text-white'            : 'text-[#1a3d2b]'
  const subClr         = d ? 'text-white/45'         : 'text-gray-400'
  const arrowClr       = d ? 'text-white/20'         : 'text-gray-300'
  const inputBg        = d ? 'bg-white/[0.06]'       : 'bg-gray-50'
  const inputClr       = d ? 'text-white'            : 'text-[#1a3d2b]'
  const skelBg         = d ? 'bg-white/[0.07]'       : 'bg-gray-100'
  const itemHover      = d ? '#222222'               : '#edf5e4'
  const itemBg         = d ? 'bg-white/[0.04]'       : 'bg-[#f6faf2]'
  const tabInactive    = d ? 'text-white/30 hover:text-white/60' : 'text-gray-400 hover:text-[#1a3d2b]'
  const tabBarBg       = d ? cardBg                  : 'bg-white'
  const tabBarBorder   = d ? 'border-white/[0.07]'   : 'border-gray-100'

  const focusShadow = (field) => ({
    boxShadow: focusedField === field
      ? '0 0 0 2px #1a3d2b, 0 4px 12px rgba(26,61,43,0.1)'
      : d ? '0 0 0 1.5px rgba(255,255,255,0.08)' : '0 0 0 1.5px #e5e7eb',
  })

  const tabs = [
    { key: 'info',       label: 'Overzicht'  },
    { key: 'bewerken',   label: 'Bewerken'   },
    { key: 'dieet',      label: 'Dieet'      },
    { key: 'stuurlinks', label: 'Stuurlinks' },
  ]

  const SpinnerIcon = () => (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )

  // Reusable double-bezel card wrapper
  const Card = ({ children, className = '' }) => (
    <div className={`${shellBg} border ${shellBorder} p-[5px] rounded-[32px] ${className}`}>
      <div className={`${cardBg} rounded-[27px] overflow-hidden ${cardInnerShadow} transition-colors duration-300`}>
        {children}
      </div>
    </div>
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

        <div className="flex items-center gap-1">
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
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/10"
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
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.1 }}
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
            className="text-[#d4e84a]/70 text-xs font-bold uppercase tracking-widest mb-3"
          >
            Mijn account
          </motion.p>

          <div className="flex items-center gap-4 mb-6">
            {/* Avatar — double-bezel */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.18 }}
              className="shrink-0 p-[3px] rounded-[22px] bg-[#d4e84a]/25 border border-[#d4e84a]/20"
            >
              <div className="w-16 h-16 rounded-[19px] bg-[#d4e84a] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]">
                <span className="text-[#1a3d2b] font-black text-2xl select-none">
                  {naam ? naam.charAt(0).toUpperCase() : '?'}
                </span>
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-black text-white tracking-tight leading-none truncate">
                {naam || 'Laden...'}
              </h1>
              <p className="text-white/40 text-xs mt-1.5 truncate">{email}</p>
              <span className="inline-block mt-2 bg-[#d4e84a]/15 text-[#d4e84a] text-xs font-bold px-2.5 py-0.5 rounded-lg capitalize border border-[#d4e84a]/20">
                {rol}
              </span>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.28 }}
            className="flex gap-2.5"
          >
            {[
              { label: 'workshops',   value: ingeschrevenWorkshops.length },
              { label: 'events',      value: ingeschrevenEvents.length },
              { label: 'dieetwensen', value: geselecteerdeDieet.filter(x => x !== 'Geen restricties').length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex-1 bg-white/[0.08] rounded-[20px] p-3.5 text-center border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                {dataLoading ? (
                  <div className="h-7 w-6 bg-white/10 rounded-lg animate-pulse mx-auto mb-1" />
                ) : (
                  <p className="text-white font-black text-2xl leading-none tabular-nums">{value}</p>
                )}
                <p className="text-white/40 text-[10px] font-semibold uppercase tracking-widest mt-1.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pt-6 pb-10 flex flex-col gap-4 transition-colors duration-300`}>

        {/* Tabs — sliding pill via layoutId */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.32 }}
          className={`flex ${tabBarBg} border ${tabBarBorder} rounded-[22px] p-1.5 shadow-sm transition-colors duration-300`}
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActieveTab(key)}
              className="relative flex-1 py-2.5 rounded-xl text-xs font-bold"
            >
              {actieveTab === key && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-[#1a3d2b] rounded-xl shadow-sm"
                  transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                />
              )}
              <span className={`relative z-10 transition-colors duration-150 ${actieveTab === key ? 'text-[#d4e84a]' : tabInactive}`}>
                {label}
              </span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* TAB: Overzicht */}
          {actieveTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="flex flex-col gap-3"
            >
              <Card>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-[#d4e84a] p-2 rounded-xl shadow-sm">
                        <BookOpen className="w-4 h-4 text-[#1a3d2b]" />
                      </div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Mijn workshops</h2>
                    </div>
                    {!dataLoading && (
                      <span className={`text-xs ${subClr}`}>{ingeschrevenWorkshops.length} ingeschreven</span>
                    )}
                  </div>

                  {dataLoading ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2].map(i => <div key={i} className={`h-14 ${skelBg} rounded-2xl animate-pulse`} />)}
                    </div>
                  ) : ingeschrevenWorkshops.length === 0 ? (
                    <div className="text-center py-5">
                      <p className={`text-xs ${subClr} mb-3`}>Nog niet ingeschreven voor workshops</p>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/workshops')}
                        className="text-xs text-[#1a3d2b] font-bold bg-[#d4e84a]/20 px-4 py-2 rounded-xl hover:bg-[#d4e84a]/30 transition-colors"
                      >
                        Bekijk workshops
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {ingeschrevenWorkshops.map((w, i) => {
                        const datum = w.start_date?.split(' ')?.[0] || ''
                        const tijdStart = w.start_date?.split(' ')?.[1] || ''
                        const tijdEind = w.end_date?.split(' ')?.[1] || ''
                        return (
                          <motion.div
                            key={w.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 32 }}
                            whileHover={{ x: 4, backgroundColor: itemHover }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate(`/workshops/${w.id}`)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl ${itemBg} cursor-pointer transition-colors duration-150`}
                          >
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold ${titleClr} truncate`}>{w.title}</p>
                              <p className={`text-xs ${subClr} mt-0.5`}>{formatDatum(datum)} &middot; {tijdStart} &ndash; {tijdEind}</p>
                            </div>
                            <ArrowRight className={`w-4 h-4 ${arrowClr} shrink-0 ml-3`} />
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-[#1a3d2b] p-2 rounded-xl">
                        <CalendarDays className="w-4 h-4 text-[#d4e84a]" />
                      </div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Mijn events</h2>
                    </div>
                    {!dataLoading && (
                      <span className={`text-xs ${subClr}`}>{ingeschrevenEvents.length} ingeschreven</span>
                    )}
                  </div>

                  {dataLoading ? (
                    <div className={`h-14 ${skelBg} rounded-2xl animate-pulse`} />
                  ) : ingeschrevenEvents.length === 0 ? (
                    <div className="text-center py-5">
                      <p className={`text-xs ${subClr} mb-3`}>Nog niet ingeschreven voor events</p>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/events')}
                        className="text-xs text-[#1a3d2b] font-bold bg-[#d4e84a]/20 px-4 py-2 rounded-xl hover:bg-[#d4e84a]/30 transition-colors"
                      >
                        Bekijk events
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {ingeschrevenEvents.map((e, i) => {
                        const datum = e.days?.[0]?.date || e.start_date?.split(' ')?.[0] || ''
                        return (
                          <motion.div
                            key={e.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 32 }}
                            whileHover={{ x: 4, backgroundColor: itemHover }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate(`/events/${e.id}`)}
                            className={`flex items-center justify-between p-3.5 rounded-2xl ${itemBg} cursor-pointer transition-colors duration-150`}
                          >
                            <div className="min-w-0">
                              <p className={`text-sm font-semibold ${titleClr} truncate`}>{e.title}</p>
                              <p className={`text-xs ${subClr} mt-0.5`}>{formatDatum(datum)} &middot; {e.location}</p>
                            </div>
                            <ArrowRight className={`w-4 h-4 ${arrowClr} shrink-0 ml-3`} />
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB: Bewerken */}
          {actieveTab === 'bewerken' && (
            <motion.div
              key="bewerken"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="flex flex-col gap-3"
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="bg-[#d4e84a]/25 p-2.5 rounded-xl">
                      <User className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <h2 className={`text-sm font-bold ${titleClr}`}>Gegevens bewerken</h2>
                  </div>

                  <form onSubmit={handleProfielOpslaan} className="flex flex-col gap-4">
                    {[
                      { key: 'naam',  label: 'Naam',        type: 'text',  icon: User, value: naam,  onChange: setNaam  },
                      { key: 'email', label: 'E-mailadres', type: 'email', icon: Mail, value: email, onChange: setEmail },
                    ].map(({ key, label, type, icon: Icon, value, onChange }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className={`text-xs font-bold ${labelClr} uppercase tracking-widest`}>{label}</label>
                        <motion.div
                          animate={focusShadow(key)}
                          transition={{ duration: 0.18 }}
                          className={`relative ${inputBg} rounded-2xl overflow-hidden`}
                        >
                          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === key ? 'text-[#1a3d2b]' : d ? 'text-white/20' : 'text-gray-300'}`} />
                          <input
                            type={type}
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            onFocus={() => setFocusedField(key)}
                            onBlur={() => setFocusedField(null)}
                            disabled={profielLoading}
                            className={`w-full pl-10 pr-4 py-3.5 text-sm ${inputClr} bg-transparent outline-none placeholder:text-gray-300 disabled:opacity-50`}
                          />
                        </motion.div>
                      </div>
                    ))}

                    <motion.button
                      whileHover={{ scale: profielLoading ? 1 : 1.02, boxShadow: profielLoading ? 'none' : '0 10px 28px rgba(26,61,43,0.28)' }}
                      whileTap={{ scale: profielLoading ? 1 : 0.97 }}
                      type="submit"
                      disabled={profielLoading}
                      className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-shadow"
                    >
                      {profielLoading ? <><SpinnerIcon />Opslaan...</> : <><Save className="w-4 h-4" />Opslaan</>}
                    </motion.button>
                  </form>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className={`${d ? 'bg-white/[0.08]' : 'bg-[#1a3d2b]/10'} p-2.5 rounded-xl`}>
                      <Lock className={`w-4 h-4 ${d ? 'text-white/50' : 'text-[#1a3d2b]'}`} />
                    </div>
                    <h2 className={`text-sm font-bold ${titleClr}`}>Wachtwoord wijzigen</h2>
                  </div>

                  <form onSubmit={handleWachtwoordWijzigen} className="flex flex-col gap-4">
                    {[
                      { key: 'huidig',  label: 'Huidig wachtwoord',       value: huidigWachtwoord,  onChange: setHuidigWachtwoord,  hint: null },
                      { key: 'nieuw',   label: 'Nieuw wachtwoord',         value: nieuwWachtwoord,   onChange: setNieuwWachtwoord,   hint: 'Min. 8 tekens' },
                      { key: 'herhaal', label: 'Herhaal nieuw wachtwoord', value: wachtwoordHerhaal, onChange: setWachtwoordHerhaal, hint: null },
                    ].map(({ key, label, value, onChange, hint }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className={`text-xs font-bold ${labelClr} uppercase tracking-widest`}>{label}</label>
                        <motion.div
                          animate={focusShadow(key)}
                          transition={{ duration: 0.18 }}
                          className={`relative ${inputBg} rounded-2xl overflow-hidden`}
                        >
                          <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === key ? 'text-[#1a3d2b]' : d ? 'text-white/20' : 'text-gray-300'}`} />
                          <input
                            type={key === 'nieuw' && toonNieuw ? 'text' : 'password'}
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            onFocus={() => setFocusedField(key)}
                            onBlur={() => setFocusedField(null)}
                            placeholder="••••••••"
                            disabled={wachtwoordLoading}
                            className={`w-full pl-10 ${key === 'nieuw' ? 'pr-12' : 'pr-4'} py-3.5 text-sm ${inputClr} bg-transparent outline-none placeholder:text-gray-300 disabled:opacity-50`}
                          />
                          {key === 'nieuw' && (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.88 }}
                              onClick={() => setToonNieuw(v => !v)}
                              className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${d ? 'text-white/30 hover:text-white/60' : 'text-gray-300 hover:text-[#1a3d2b]'} transition-colors`}
                            >
                              <AnimatePresence mode="wait">
                                {toonNieuw
                                  ? <motion.div key="hide"
                                      initial={shouldReduce ? false : { opacity: 0, rotate: -10 }}
                                      animate={{ opacity: 1, rotate: 0 }}
                                      exit={shouldReduce ? {} : { opacity: 0, rotate: 10 }}
                                    ><EyeOff className="w-4 h-4" /></motion.div>
                                  : <motion.div key="show"
                                      initial={shouldReduce ? false : { opacity: 0, rotate: 10 }}
                                      animate={{ opacity: 1, rotate: 0 }}
                                      exit={shouldReduce ? {} : { opacity: 0, rotate: -10 }}
                                    ><Eye className="w-4 h-4" /></motion.div>
                                }
                              </AnimatePresence>
                            </motion.button>
                          )}
                        </motion.div>
                        {hint && <p className={`text-xs ${subClr} pl-1`}>{hint}</p>}
                      </div>
                    ))}

                    <motion.button
                      whileHover={{ scale: wachtwoordLoading ? 1 : 1.02, boxShadow: wachtwoordLoading ? 'none' : '0 10px 28px rgba(26,61,43,0.28)' }}
                      whileTap={{ scale: wachtwoordLoading ? 1 : 0.97 }}
                      type="submit"
                      disabled={wachtwoordLoading}
                      className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-shadow"
                    >
                      {wachtwoordLoading ? <><SpinnerIcon />Opslaan...</> : <><Save className="w-4 h-4" />Wachtwoord wijzigen</>}
                    </motion.button>
                  </form>
                </div>
              </Card>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(239,68,68,0.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUitloggen}
                className={`w-full ${d ? 'bg-red-950/40 border-red-900/40 text-red-400' : 'bg-white border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200'} border-2 rounded-3xl py-4 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2`}
              >
                <LogOut className="w-4 h-4" />
                Uitloggen
              </motion.button>
            </motion.div>
          )}

          {/* TAB: Dieet */}
          {actieveTab === 'dieet' && (
            <motion.div
              key="dieet"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-1">
                    <div className="bg-[#d4e84a]/25 p-2.5 rounded-xl">
                      <Utensils className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <h2 className={`text-sm font-bold ${titleClr}`}>Dieetwensen</h2>
                  </div>
                  <p className={`text-xs ${subClr} mb-5 pl-1`}>Selecteer alles wat van toepassing is</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {dieetOpties.map(optie => {
                      const actief = geselecteerdeDieet.includes(optie)
                      return (
                        <motion.button
                          key={optie}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.94 }}
                          type="button"
                          onClick={() => toggleDieet(optie)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-150 flex items-center gap-1.5 ${
                            actief
                              ? 'bg-[#1a3d2b] text-[#d4e84a] border-[#1a3d2b] shadow-md shadow-[#1a3d2b]/15'
                              : d
                                ? 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'
                                : 'bg-white text-gray-500 border-gray-100 hover:border-[#1a3d2b]/30'
                          }`}
                        >
                          {actief && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                              <Check className="w-3 h-3" />
                            </motion.span>
                          )}
                          {optie}
                        </motion.button>
                      )
                    })}
                  </div>

                  <motion.button
                    whileHover={{ scale: dieetLoading ? 1 : 1.02 }}
                    whileTap={{ scale: dieetLoading ? 1 : 0.97 }}
                    type="button"
                    onClick={handleDieetOpslaan}
                    disabled={dieetLoading}
                    className="w-full bg-[#d4e84a] text-[#1a3d2b] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#c8dc3e] transition-colors"
                  >
                    {dieetLoading ? <><SpinnerIcon />Opslaan...</> : <><Save className="w-4 h-4" />Dieetwensen opslaan</>}
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB: Stuurlinks (alleen admin / docent) */}
          {actieveTab === 'stuurlinks' && (
            <motion.div
              key="stuurlinks"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            >
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="bg-[#d4e84a]/25 p-2.5 rounded-xl">
                      <UserPlus className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <h2 className={`text-sm font-bold ${titleClr}`}>Stuurlink aanmaken</h2>
                  </div>
                  <p className={`text-xs ${subClr} mb-5 pl-1`}>Eenmalig geldig · verloopt na 24 uur</p>

                  <motion.button
                    whileHover={{ scale: stuurlinkLoading ? 1 : 1.02, boxShadow: stuurlinkLoading ? 'none' : '0 10px 28px rgba(26,61,43,0.28)' }}
                    whileTap={{ scale: stuurlinkLoading ? 1 : 0.97 }}
                    type="button"
                    onClick={handleStuurlinkAanmaken}
                    disabled={stuurlinkLoading}
                    className="w-full bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-shadow"
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
                          className="w-full bg-[#d4e84a] text-[#1a3d2b] rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#c8dc3e] transition-colors"
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
          )}

        </AnimatePresence>
      </div>
      <Footer />
    </div>
  )
}

export default Profiel
