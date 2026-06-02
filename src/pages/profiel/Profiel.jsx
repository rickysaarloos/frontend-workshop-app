import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { User, Mail, Lock, Utensils, LogOut, ChevronLeft, Save, Check, BookOpen, CalendarDays, ArrowRight } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'

const dieetOpties = [
  'Vegetarisch', 'Veganistisch', 'Glutenvrij', 'Lactosevrij',
  'Halal', 'Kosher', 'Notenallergie', 'Geen restricties',
]

function Profiel() {
  const navigate = useNavigate()
  const cachedUser = JSON.parse(localStorage.getItem('user') || 'null')

  const [naam, setNaam] = useState(cachedUser?.name || '')
  const [email, setEmail] = useState(cachedUser?.email || '')
  const [huidigWachtwoord, setHuidigWachtwoord] = useState('')
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('')
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')
  const [geselecteerdeDieet, setGeselecteerdeDieet] = useState(['Geen restricties'])
  const [profielLoading, setProfielLoading] = useState(false)
  const [wachtwoordLoading, setWachtwoordLoading] = useState(false)
  const [dieetLoading, setDieetLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [actievTab, setActieveTab] = useState('info')
  const [ingeschrevenWorkshops, setIngeschrevenWorkshops] = useState([])
  const [ingeschrevenEvents, setIngeschrevenEvents] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

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

      setNaam(userJson.name || '')
      setEmail(userJson.email || '')
      if (userJson.dietary_preferences?.length) {
        setGeselecteerdeDieet(userJson.dietary_preferences)
      }
      localStorage.setItem('user', JSON.stringify(userJson))

      setIngeschrevenWorkshops((workshopsJson.data || []).filter((w) => w.is_registered))
      setIngeschrevenEvents((eventsJson.data || []).filter((e) => e.is_registered))
    } catch {
      toast.error('Gegevens ophalen mislukt')
    } finally {
      setDataLoading(false)
    }
  }

  function toggleDieet(optie) {
    if (optie === 'Geen restricties') { setGeselecteerdeDieet(['Geen restricties']); return }
    setGeselecteerdeDieet((prev) => {
      const zonderGeen = prev.filter((d) => d !== 'Geen restricties')
      if (zonderGeen.includes(optie)) {
        const nieuw = zonderGeen.filter((d) => d !== optie)
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
      localStorage.setItem('user', JSON.stringify({ ...cachedUser, name: naam, email }))
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

  const inputClass = (field) =>
    `w-full border-2 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-50 bg-gray-50 focus:bg-white ${
      focusedField === field ? 'border-[#1a3d2b]' : 'border-gray-100'
    }`

  const tabs = [
    { key: 'info', label: 'Overzicht' },
    { key: 'bewerken', label: 'Bewerken' },
    { key: 'dieet', label: 'Dieet' },
  ]

  return (
    <div className="min-h-screen bg-[#1a3d2b] flex flex-col">
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
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="w-7 h-7 bg-[#d4e84a] rounded-lg flex items-center justify-center cursor-default"
          >
            <span className="text-[#1a3d2b] font-black text-xs">T</span>
          </motion.div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-xs tracking-tight">Techniek College</span>
            <span className="text-white/40 text-xs">Rotterdam</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleUitloggen}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          Uitloggen
        </motion.button>
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
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.1 }}
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
            className="text-[#d4e84a] text-xs font-bold uppercase tracking-widest mb-3"
          >
            Mijn account
          </motion.p>

          <div className="flex items-center gap-4 mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.18 }}
              className="w-16 h-16 rounded-2xl bg-[#d4e84a] flex items-center justify-center shadow-xl shrink-0"
            >
              <span className="text-[#1a3d2b] font-black text-2xl">
                {naam ? naam.charAt(0).toUpperCase() : '?'}
              </span>
            </motion.div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-black text-white tracking-tight leading-tight truncate">
                {naam || '—'}
              </h1>
              <p className="text-white/40 text-xs mt-0.5 truncate">{email}</p>
              <span className="inline-block mt-1.5 bg-[#d4e84a]/20 text-[#d4e84a] text-xs font-bold px-2.5 py-0.5 rounded-lg capitalize">
                {cachedUser?.roles?.[0] || cachedUser?.role || 'student'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.28 }}
            className="flex gap-3"
          >
            {[
              { label: 'workshops', value: ingeschrevenWorkshops.length },
              { label: 'events', value: ingeschrevenEvents.length },
              { label: 'dieetwensen', value: geselecteerdeDieet.filter((d) => d !== 'Geen restricties').length },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 bg-white/10 rounded-2xl p-3.5 text-center border border-white/10">
                {dataLoading ? (
                  <div className="h-7 w-6 bg-white/10 rounded-lg animate-pulse mx-auto mb-1" />
                ) : (
                  <p className="text-white font-black text-2xl leading-none">{value}</p>
                )}
                <p className="text-white/40 text-[11px] font-medium mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-[#e4e8e2] rounded-t-[2.5rem] px-5 pt-6 pb-10 flex flex-col gap-4">

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.32 }}
          className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100 shadow-sm"
        >
          {tabs.map(({ key, label }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActieveTab(key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                actievTab === key
                  ? 'bg-[#1a3d2b] text-[#d4e84a] shadow-sm'
                  : 'text-gray-400 hover:text-[#1a3d2b]'
              }`}
            >
              {label}
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* TAB: Overzicht */}
          {actievTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="flex flex-col gap-3"
            >
              {/* Workshops */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#d4e84a] p-2 rounded-xl">
                        <BookOpen className="w-4 h-4 text-[#1a3d2b]" />
                      </div>
                      <h2 className="text-sm font-bold text-[#1a3d2b]">Mijn workshops</h2>
                    </div>
                    {!dataLoading && (
                      <span className="text-xs text-gray-400">{ingeschrevenWorkshops.length} ingeschreven</span>
                    )}
                  </div>

                  {dataLoading ? (
                    <div className="flex flex-col gap-2">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : ingeschrevenWorkshops.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-xs text-gray-400 mb-2">Nog niet ingeschreven voor workshops</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/workshops')}
                        className="text-xs text-[#1a3d2b] font-bold bg-[#eaf3de] px-3 py-1.5 rounded-lg hover:bg-[#d4e84a] transition-colors"
                      >
                        Bekijk workshops
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {ingeschrevenWorkshops.map((w) => {
                        const datum = w.start_date?.split(' ')?.[0] || ''
                        const tijdStart = w.start_date?.split(' ')?.[1] || ''
                        const tijdEind = w.end_date?.split(' ')?.[1] || ''
                        return (
                          <motion.div
                            key={w.id}
                            whileHover={{ x: 4, backgroundColor: '#eaf3de' }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate(`/workshops/${w.id}`)}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 cursor-pointer transition-colors duration-150"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1a3d2b] truncate">{w.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {formatDatum(datum)} &middot; {tijdStart} &ndash; {tijdEind}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 ml-3" />
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Events */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="bg-[#1a3d2b] p-2 rounded-xl">
                        <CalendarDays className="w-4 h-4 text-[#d4e84a]" />
                      </div>
                      <h2 className="text-sm font-bold text-[#1a3d2b]">Mijn events</h2>
                    </div>
                    {!dataLoading && (
                      <span className="text-xs text-gray-400">{ingeschrevenEvents.length} ingeschreven</span>
                    )}
                  </div>

                  {dataLoading ? (
                    <div className="flex flex-col gap-2">
                      <div className="h-14 bg-gray-50 rounded-2xl animate-pulse" />
                    </div>
                  ) : ingeschrevenEvents.length === 0 ? (
                    <div className="text-center py-5">
                      <p className="text-xs text-gray-400 mb-2">Nog niet ingeschreven voor events</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/events')}
                        className="text-xs text-[#1a3d2b] font-bold bg-[#eaf3de] px-3 py-1.5 rounded-lg hover:bg-[#d4e84a] transition-colors"
                      >
                        Bekijk events
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {ingeschrevenEvents.map((e) => {
                        const datum = e.days?.[0]?.date || e.start_date?.split(' ')?.[0] || ''
                        return (
                          <motion.div
                            key={e.id}
                            whileHover={{ x: 4, backgroundColor: '#eaf3de' }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate(`/events/${e.id}`)}
                            className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 cursor-pointer transition-colors duration-150"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#1a3d2b] truncate">{e.title}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{formatDatum(datum)} &middot; {e.location}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 shrink-0 ml-3" />
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Bewerken */}
          {actievTab === 'bewerken' && (
            <motion.div
              key="bewerken"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="flex flex-col gap-3"
            >
              {/* Gegevens */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30 p-2.5 rounded-xl">
                      <User className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <h2 className="text-sm font-bold text-[#1a3d2b]">Gegevens bewerken</h2>
                  </div>
                  <form onSubmit={handleProfielOpslaan} className="flex flex-col gap-4">
                    {[
                      { key: 'naam', label: 'Naam', type: 'text', icon: User, value: naam, onChange: setNaam },
                      { key: 'email', label: 'E-mailadres', type: 'email', icon: Mail, value: email, onChange: setEmail },
                    ].map(({ key, label, type, icon: Icon, value, onChange }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                        <div className="relative">
                          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === key ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
                          <input
                            type={type}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setFocusedField(key)}
                            onBlur={() => setFocusedField(null)}
                            disabled={profielLoading}
                            className={inputClass(key)}
                          />
                        </div>
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: profielLoading ? 1 : 1.02 }}
                      whileTap={{ scale: profielLoading ? 1 : 0.97 }}
                      type="submit"
                      disabled={profielLoading}
                      className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
                    >
                      {profielLoading ? (
                        <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Opslaan...</>
                      ) : (
                        <><Save className="w-4 h-4" />Opslaan</>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>

              {/* Wachtwoord */}
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30 p-2.5 rounded-xl">
                      <Lock className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <h2 className="text-sm font-bold text-[#1a3d2b]">Wachtwoord wijzigen</h2>
                  </div>
                  <form onSubmit={handleWachtwoordWijzigen} className="flex flex-col gap-4">
                    {[
                      { key: 'huidig', label: 'Huidig wachtwoord', value: huidigWachtwoord, onChange: setHuidigWachtwoord },
                      { key: 'nieuw', label: 'Nieuw wachtwoord', value: nieuwWachtwoord, onChange: setNieuwWachtwoord },
                      { key: 'herhaal', label: 'Herhaal nieuw wachtwoord', value: wachtwoordHerhaal, onChange: setWachtwoordHerhaal },
                    ].map(({ key, label, value, onChange }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                        <div className="relative">
                          <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === key ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
                          <input
                            type="password"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setFocusedField(key)}
                            onBlur={() => setFocusedField(null)}
                            placeholder="••••••••"
                            disabled={wachtwoordLoading}
                            className={inputClass(key)}
                          />
                        </div>
                        {key === 'nieuw' && <p className="text-xs text-gray-400 pl-1">Minimaal 8 tekens</p>}
                      </div>
                    ))}
                    <motion.button
                      whileHover={{ scale: wachtwoordLoading ? 1 : 1.02 }}
                      whileTap={{ scale: wachtwoordLoading ? 1 : 0.97 }}
                      type="submit"
                      disabled={wachtwoordLoading}
                      className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity"
                    >
                      {wachtwoordLoading ? (
                        <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Opslaan...</>
                      ) : (
                        <><Save className="w-4 h-4" />Wachtwoord wijzigen</>
                      )}
                    </motion.button>
                  </form>
                </div>
              </div>

              {/* Uitloggen */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(239,68,68,0.1)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUitloggen}
                className="w-full bg-white border-2 border-red-100 text-red-400 rounded-3xl py-4 text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Uitloggen
              </motion.button>
            </motion.div>
          )}

          {/* TAB: Dieet */}
          {actievTab === 'dieet' && (
            <motion.div
              key="dieet"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            >
              <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="h-0.5 bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]" />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gradient-to-br from-[#eaf3de] to-[#d4e84a]/30 p-2.5 rounded-xl">
                      <Utensils className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <h2 className="text-sm font-bold text-[#1a3d2b]">Dieetwensen</h2>
                  </div>
                  <p className="text-xs text-gray-400 mb-5 pl-1">Selecteer alles wat van toepassing is</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {dieetOpties.map((optie) => {
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
                    className="w-full bg-[#d4e84a] text-[#1a3d2b] rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-opacity hover:bg-[#c8dc3e]"
                  >
                    {dieetLoading ? (
                      <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>Opslaan...</>
                    ) : (
                      <><Save className="w-4 h-4" />Dieetwensen opslaan</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

export default Profiel
