import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { User, Mail, Lock, Utensils, LogOut, ChevronLeft, Save, Check, BookOpen, CalendarDays, ArrowRight, Eye, EyeOff, Moon, Sun, UserPlus, Copy, Clock, Network, Hash, UserCheck, QrCode, ScanLine, Camera, X } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { BrowserQRCodeReader, BrowserQRCodeSvgWriter } from '@zxing/browser'
import Footer from '../../components/Footer'
import Card from '../../components/Card'

import { API_URL } from '@/lib/config'
import { api } from '@/lib/api'
import { getStoredUser, logout } from '@/lib/auth'

const dieetOpties = [
  'Vegetarisch', 'Veganistisch', 'Glutenvrij', 'Lactosevrij',
  'Halal', 'Kosher', 'Notenallergie', 'Geen restricties',
]

function Profiel() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()

  const [naam, setNaam] = useState(() => getStoredUser()?.name || '')
  const [email, setEmail] = useState(() => getStoredUser()?.email || '')
  const [rol, setRol] = useState(() => {
    const u = getStoredUser()
    return u?.roles?.[0] || u?.role || 'deelnemer'
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
  const [netwerkcode, setNetwerkcode] = useState(null)
  const [netwerkcodeLoading, setNetwerkcodeLoading] = useState(false)
  const [netwerkContacten, setNetwerkContacten] = useState([])
  const [contactenLoading, setContactenLoading] = useState(false)
  const [invulCode, setInvulCode] = useState('')
  const [codeToevoegenLoading, setCodeToevoegenLoading] = useState(false)
  const [netwerkGeladen, setNetwerkGeladen] = useState(false)
  const [qrUrl, setQrUrl] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [netwerkScannen, setNetwerkScannen] = useState(false)
  const netwerkQrRef = useRef(null)      // container voor de gegenereerde netwerkcode-QR
  const netwerkVideoRef = useRef(null)   // <video> van de netwerkscanner
  const netwerkControlsRef = useRef(null) // camera-controls van @zxing om te kunnen stoppen

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
    fetchAlles()
    fetchQr(token)
  }, [])

  async function fetchQr(token) {
    setQrLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/user/qr`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        setQrUrl(data.data?.qr_code_url || data.qr_code_url || data.data?.qr_url || data.data?.url || data.qr_url || data.url || null)
      } else {
        const blob = await res.blob()
        setQrUrl(URL.createObjectURL(blob))
      }
    } catch {
      // Silent fail — QR is non-critical
    } finally {
      setQrLoading(false)
    }
  }

  useEffect(() => {
    if (actieveTab !== 'netwerk' || netwerkGeladen) return
    const token = localStorage.getItem('token')
    if (!token) return
    fetchNetwerkdata()
  }, [actieveTab])

  // Genereert client-side een QR van de eigen netwerkcode, zodat anderen die
  // met hun telefoon kunnen scannen. De QR bevat de kale code als tekst.
  useEffect(() => {
    if (actieveTab !== 'netwerk' || !netwerkcode || !netwerkQrRef.current) return
    const writer = new BrowserQRCodeSvgWriter()
    const svg = writer.write(netwerkcode, 176, 176)
    svg.setAttribute('viewBox', '0 0 176 176')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    netwerkQrRef.current.replaceChildren(svg)
  }, [actieveTab, netwerkcode])

  // Camera aan/uit voor het scannen van andermans netwerkcode-QR. Bij een
  // geslaagde scan wordt het contact direct toegevoegd en stopt de camera.
  useEffect(() => {
    if (!netwerkScannen) return
    let actief = true
    const reader = new BrowserQRCodeReader()
    reader
      .decodeFromVideoDevice(undefined, netwerkVideoRef.current, (result) => {
        if (!actief || !result) return
        actief = false
        setNetwerkScannen(false)
        voegCodeToe(result.getText().trim().toUpperCase())
      })
      .then((controls) => {
        netwerkControlsRef.current = controls
        if (!actief) controls.stop() // effect al opgeruimd vóór de camera klaar was
      })
      .catch(() => {
        toast.error('Camera starten mislukt — controleer of de browser cameratoegang heeft')
        setNetwerkScannen(false)
      })
    return () => {
      actief = false
      netwerkControlsRef.current?.stop()
      netwerkControlsRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [netwerkScannen])

  async function fetchAlles() {
    try {
      const [userJson, workshopsJson, eventsJson] = await Promise.all([
        api('/user'),
        api('/workshops'),
        api('/events'),
      ])
      if (userJson.name)  setNaam(userJson.name)
      if (userJson.email) setEmail(userJson.email)
      const fetchedRol = userJson.roles?.[0] || userJson.role
      if (fetchedRol) setRol(fetchedRol)
      if (userJson.dietary_preferences?.length) setGeselecteerdeDieet(userJson.dietary_preferences)
      const existing = getStoredUser() || {}
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
      await api('/user', { method: 'PATCH', body: { name: naam, email } })
      const fresh = getStoredUser() || {}
      localStorage.setItem('user', JSON.stringify({ ...fresh, name: naam, email }))
      toast.success('Profiel opgeslagen')
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
      await api('/user/password', {
        method: 'PATCH',
        body: { current_password: huidigWachtwoord, password: nieuwWachtwoord, password_confirmation: wachtwoordHerhaal },
      })
      toast.success('Wachtwoord gewijzigd')
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
      await api('/user/dietary-preferences', { method: 'PATCH', body: { dietary_preferences: geselecteerdeDieet } })
      toast.success('Dieetwensen opgeslagen')
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

  async function fetchNetwerkdata() {
    setNetwerkGeladen(true)
    setNetwerkcodeLoading(true)
    setContactenLoading(true)
    // Per call afzonderlijk afvangen: één mislukte call mag de andere niet
    // blokkeren (zoals de oude `if (res.ok)`-checks ook deden).
    try {
      const [codeJson, contactenJson] = await Promise.all([
        api('/user/network-code').catch(() => null),
        api('/user/network').catch(() => null),
      ])
      if (codeJson) setNetwerkcode(codeJson.network_code || codeJson.code || codeJson.netwerkcode || codeJson.data?.network_code || codeJson.data?.code || null)
      if (contactenJson) setNetwerkContacten(Array.isArray(contactenJson) ? contactenJson : (contactenJson.data || contactenJson.contacts || []))
    } catch {
      toast.error('Netwerkgegevens ophalen mislukt')
    } finally {
      setNetwerkcodeLoading(false)
      setContactenLoading(false)
    }
  }

  // Voegt een contact toe op basis van een netwerkcode — handmatig ingevuld
  // óf uit een gescande QR.
  async function voegCodeToe(code) {
    if (!code) { toast.error('Voer een code in'); return }
    setCodeToevoegenLoading(true)
    try {
      const data = await api('/networking', { method: 'POST', body: { code } })
      toast.success(data?.message || 'Contact toegevoegd!')
      setInvulCode('')
      // Herladen van de contactenlijst mag stil falen — het toevoegen zelf is al gelukt.
      const contactenJson = await api('/user/network').catch(() => null)
      if (contactenJson) {
        setNetwerkContacten(Array.isArray(contactenJson) ? contactenJson : (contactenJson.data || contactenJson.contacts || []))
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCodeToevoegenLoading(false)
    }
  }

  function handleCodeToevoegen() {
    voegCodeToe(invulCode.trim())
  }

  async function handleKopieer(url) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link gekopieerd')
    } catch {
      toast.error('Kopiëren mislukt')
    }
  }

  async function handleUitloggen() {
    await logout()
    toast.success('Je bent uitgelogd')
    setTimeout(() => navigate('/login'), 600)
  }

  const d = dark

  // --- Design tokens (uitgelijnd op Home.jsx / WorkshopDetail.jsx — één palet voor de hele app) ---
  const contentBg    = d ? 'bg-[#111111]'           : 'bg-[#e4e8e2]'
  const labelClr     = d ? 'text-white/55'          : 'text-[#4a6e52]'
  const titleClr     = d ? 'text-white'             : 'text-[#1a3d2b]'
  const subClr       = d ? 'text-white/60'          : 'text-gray-500'
  const arrowClr     = d ? 'text-white/20'          : 'text-[#1a3d2b]/25'
  const inputBg      = d ? 'bg-white/[0.06]'        : 'bg-[#f6faf2]'
  const inputClr     = d ? 'text-white'             : 'text-[#1a3d2b]'
  const skelBg       = d ? 'bg-white/[0.07]'        : 'bg-black/[0.05]'
  const itemHover    = d ? '#242424'                : '#edf5e4'
  const itemBg       = d ? 'bg-white/[0.04]'        : 'bg-[#f6faf2]'
  const tabInactive  = d ? 'text-white/55 hover:text-white/80' : 'text-gray-500 hover:text-[#1a3d2b]'
  const tabBarBg     = d ? 'bg-[#1c1c1e]'           : 'bg-white'
  const tabBarBorder = d ? 'border-white/[0.07]'    : 'border-gray-100'

  const gradientTop = 'h-[2px] bg-gradient-to-r from-[#1a3d2b] via-[#4a8c60] to-[#d4e84a]'

  const focusShadow = (field) => ({
    boxShadow: focusedField === field
      ? '0 0 0 2.5px #1a3d2b, 0 6px 20px rgba(26,61,43,0.14)'
      : d ? '0 0 0 1.5px rgba(255,255,255,0.07)' : '0 0 0 1.5px #dcebd4',
  })

  const tabs = [
    { key: 'info',       label: 'Overzicht'  },
    { key: 'bewerken',   label: 'Bewerken'   },
    { key: 'dieet',      label: 'Dieet'      },
    { key: 'stuurlinks', label: 'Uitnodigen' },
    { key: 'netwerk',    label: 'Netwerk'    },
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
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => navigate('/home')}
            className="text-white/60 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
            aria-label="Terug naar home"
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
              animate={{ scale: [1, 1.14, 1], opacity: [0.05, 0.09, 0.05] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-20 -top-12 w-72 h-72 bg-[#d4e84a] rounded-full pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.07, 0.03] }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
              className="absolute -left-24 bottom-4 w-56 h-56 bg-[#d4e84a] rounded-full pointer-events-none"
            />
          </>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.1 }}
          className="relative max-w-2xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.22 }}
            className="text-[#d4e84a]/60 text-[10px] font-bold uppercase tracking-[0.22em] mb-4"
          >
            Mijn profiel
          </motion.p>

          {/* Avatar + identity */}
          <div className="flex items-center gap-4 mb-6">
            {/* Triple-layer avatar: gradient ring > dark bezel > lime core */}
            <motion.div
              initial={{ scale: 0.72, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26, delay: 0.15 }}
              className="shrink-0"
            >
              <div className="p-[3px] rounded-[26px] bg-gradient-to-br from-[#d4e84a]/70 via-[#4a8c60]/50 to-[#d4e84a]/20">
                <div className="p-[2px] rounded-[23px] bg-[#142e1f]">
                  <div className="w-[68px] h-[68px] rounded-[21px] bg-gradient-to-br from-[#d4e84a] to-[#b8d43a] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)]">
                    <span className="text-[#1a3d2b] font-black text-2xl select-none leading-none">
                      {naam ? naam.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <h1 className="text-[28px] font-black text-white tracking-tight leading-none truncate">
                {naam || 'Laden...'}
              </h1>
              <p className="text-white/40 text-xs mt-1.5 truncate">{email}</p>
              <motion.span
                initial={{ opacity: 0, scale: 0.82 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24, delay: 0.3 }}
                className="inline-flex items-center mt-2 bg-[#d4e84a]/12 text-[#d4e84a] text-[10px] font-bold px-2.5 py-1 rounded-lg capitalize border border-[#d4e84a]/20 tracking-wide"
              >
                {rol}
              </motion.span>
            </div>
          </div>

          {/* Stats — glass double-bezel bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.3 }}
            className="p-[3px] rounded-[22px] bg-white/[0.07] border border-white/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div className="bg-white/[0.05] rounded-[19px] flex divide-x divide-white/[0.08]">
              {[
                { label: 'Workshops',  value: ingeschrevenWorkshops.length },
                { label: 'Events',     value: ingeschrevenEvents.length    },
                { label: 'Dieetwens', value: geselecteerdeDieet.filter(x => x !== 'Geen restricties').length },
              ].map(({ label, value }) => (
                <div key={label} className="flex-1 flex flex-col items-center py-3.5 px-2">
                  {dataLoading ? (
                    <div className="h-7 w-5 bg-white/10 rounded-md animate-pulse mb-1.5" />
                  ) : (
                    <p className="text-white font-black text-[22px] leading-none tabular-nums">{value}</p>
                  )}
                  <p className="text-white/35 text-[9px] font-semibold uppercase tracking-[0.14em] mt-1.5 leading-none">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pt-6 pb-10 transition-colors duration-300`}>
        <div className="max-w-2xl mx-auto flex flex-col gap-4">

        {/* Tab bar — pill indicator via layoutId */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.34 }}
          className={`flex ${tabBarBg} border ${tabBarBorder} rounded-[22px] p-1.5 transition-colors duration-300`}
          style={{ boxShadow: d ? 'inset 0 1px 0 rgba(255,255,255,0.04)' : '0 1px 3px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)' }}
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActieveTab(key)}
              className="relative flex-1 py-2.5 rounded-xl text-[10px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
            >
              {actieveTab === key && (
                <motion.div
                  layoutId="tab-pill"
                  className="absolute inset-0 bg-[#1a3d2b] rounded-xl"
                  style={{ boxShadow: '0 2px 10px rgba(26,61,43,0.4), inset 0 1px 0 rgba(255,255,255,0.09)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 38 }}
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="flex flex-col gap-3"
            >
              {/* Aanwezigheid scannen — alleen voor admins en workshopgevers */}
              {['admin', 'workshopgever'].includes(rol.toLowerCase()) && (
                <Card dark={d}>
                  <div className={gradientTop} />
                  <div className="p-5">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="bg-[#d4e84a] p-2 rounded-xl" style={{ boxShadow: '0 2px 8px rgba(212,232,74,0.45)' }}>
                        <ScanLine className="w-4 h-4 text-[#1a3d2b]" />
                      </div>
                      <div>
                        <h2 className={`text-sm font-bold ${titleClr}`}>Aanwezigheid scannen</h2>
                        <p className={`text-[11px] ${subClr} mt-0.5`}>Scan de QR-code van deelnemers</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate('/scan')}
                      className="w-full bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors hover:bg-[#16331f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2"
                    >
                      <ScanLine className="w-4 h-4" />
                      Open scanner
                    </motion.button>
                  </div>
                </Card>
              )}

              {/* QR-code */}
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`p-2 rounded-xl ${d ? 'bg-white/[0.06]' : 'bg-[#eef3e8]'}`}>
                      <QrCode className={`w-4 h-4 ${d ? 'text-white/55' : 'text-[#1a3d2b]'}`} />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Mijn QR-code</h2>
                      <p className={`text-[11px] ${subClr} mt-0.5`}>Toon bij aankomst op de workshop</p>
                    </div>
                  </div>
                  {qrLoading ? (
                    <div className={`h-48 ${skelBg} rounded-2xl animate-pulse`} />
                  ) : qrUrl ? (
                    <div className={`flex justify-center p-4 rounded-2xl ${d ? 'bg-white/[0.05]' : 'bg-white'}`}>
                      <img src={qrUrl} alt="Jouw QR-code" className="w-48 h-48 object-contain" />
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center py-8 rounded-2xl ${d ? 'bg-white/[0.04]' : 'bg-[#f6faf2]'}`}>
                      <QrCode className={`w-10 h-10 mb-2 ${d ? 'text-white/15' : 'text-[#1a3d2b]/20'}`} />
                      <p className={`text-xs ${subClr}`}>QR-code niet beschikbaar</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Workshops */}
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-[#d4e84a] p-2 rounded-xl" style={{ boxShadow: '0 2px 8px rgba(212,232,74,0.45)' }}>
                        <BookOpen className="w-4 h-4 text-[#1a3d2b]" />
                      </div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Mijn workshops</h2>
                    </div>
                    {!dataLoading && (
                      <span className={`text-[11px] font-medium ${subClr} px-2.5 py-1 rounded-full ${d ? 'bg-white/[0.06]' : 'bg-[#eef3e8]'}`}>
                        {ingeschrevenWorkshops.length} ingeschreven
                      </span>
                    )}
                  </div>

                  {dataLoading ? (
                    <div className="flex flex-col gap-2.5">
                      {[1, 2].map(i => <div key={i} className={`h-[60px] ${skelBg} rounded-2xl animate-pulse`} />)}
                    </div>
                  ) : ingeschrevenWorkshops.length === 0 ? (
                    <div className="text-center py-6">
                      <div className={`w-10 h-10 ${d ? 'bg-white/[0.06]' : 'bg-[#eef3e8]'} rounded-2xl flex items-center justify-center mx-auto mb-2.5`}>
                        <BookOpen className={`w-5 h-5 ${d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
                      </div>
                      <p className={`text-xs ${subClr} mb-3`}>Nog niet ingeschreven voor workshops</p>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/workshops')}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${d ? 'text-[#d4e84a] bg-[#d4e84a]/10 hover:bg-[#d4e84a]/20' : 'text-[#1a3d2b] bg-[#d4e84a]/20 hover:bg-[#d4e84a]/35'}`}
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
                        const dagNr = datum ? new Date(datum).getDate() : null
                        const maandKort = datum ? new Date(datum).toLocaleDateString('nl-NL', { month: 'short' }) : null
                        return (
                          <motion.div
                            key={w.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 32 }}
                            whileHover={{ x: 3, backgroundColor: itemHover }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate(`/workshops/${w.id}`)}
                            className={`flex items-center gap-3 p-3 rounded-2xl ${itemBg} cursor-pointer transition-colors duration-150`}
                          >
                            {/* Mini date badge */}
                            <div className={`shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center ${d ? 'bg-white/[0.08]' : 'bg-[#eaf3de]'}`}>
                              <span className={`text-[9px] font-bold uppercase leading-none ${d ? 'text-[#d4e84a]/70' : 'text-[#4a8c60]'}`}>{maandKort}</span>
                              <span className={`text-[15px] font-black leading-snug ${d ? 'text-white' : 'text-[#1a3d2b]'}`}>{dagNr}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${titleClr} truncate`}>{w.title}</p>
                              <p className={`text-xs ${subClr} mt-0.5`}>{tijdStart} - {tijdEind}</p>
                            </div>
                            <ArrowRight className={`w-4 h-4 ${arrowClr} shrink-0`} />
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Card>

              {/* Events */}
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-[#1a3d2b] p-2 rounded-xl" style={{ boxShadow: '0 2px 8px rgba(26,61,43,0.4)' }}>
                        <CalendarDays className="w-4 h-4 text-[#d4e84a]" />
                      </div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Mijn events</h2>
                    </div>
                    {!dataLoading && (
                      <span className={`text-[11px] font-medium ${subClr} px-2.5 py-1 rounded-full ${d ? 'bg-white/[0.06]' : 'bg-[#eef3e8]'}`}>
                        {ingeschrevenEvents.length} ingeschreven
                      </span>
                    )}
                  </div>

                  {dataLoading ? (
                    <div className={`h-[60px] ${skelBg} rounded-2xl animate-pulse`} />
                  ) : ingeschrevenEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <div className={`w-10 h-10 ${d ? 'bg-white/[0.06]' : 'bg-[#eef3e8]'} rounded-2xl flex items-center justify-center mx-auto mb-2.5`}>
                        <CalendarDays className={`w-5 h-5 ${d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
                      </div>
                      <p className={`text-xs ${subClr} mb-3`}>Nog niet ingeschreven voor events</p>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => navigate('/events')}
                        className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${d ? 'text-[#d4e84a] bg-[#d4e84a]/10 hover:bg-[#d4e84a]/20' : 'text-[#1a3d2b] bg-[#d4e84a]/20 hover:bg-[#d4e84a]/35'}`}
                      >
                        Bekijk events
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {ingeschrevenEvents.map((e, i) => {
                        const datum = e.days?.[0]?.date || e.start_date?.split(' ')?.[0] || ''
                        const dagNr = datum ? new Date(datum).getDate() : null
                        const maandKort = datum ? new Date(datum).toLocaleDateString('nl-NL', { month: 'short' }) : null
                        return (
                          <motion.div
                            key={e.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 32 }}
                            whileHover={{ x: 3, backgroundColor: itemHover }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => navigate(`/events/${e.id}`)}
                            className={`flex items-center gap-3 p-3 rounded-2xl ${itemBg} cursor-pointer transition-colors duration-150`}
                          >
                            {/* Mini date badge */}
                            <div className={`shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center ${d ? 'bg-white/[0.08]' : 'bg-[#eaf3de]'}`}>
                              <span className={`text-[9px] font-bold uppercase leading-none ${d ? 'text-[#d4e84a]/70' : 'text-[#4a8c60]'}`}>{maandKort}</span>
                              <span className={`text-[15px] font-black leading-snug ${d ? 'text-white' : 'text-[#1a3d2b]'}`}>{dagNr}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${titleClr} truncate`}>{e.title}</p>
                              <p className={`text-xs ${subClr} mt-0.5 truncate`}>{e.location}</p>
                            </div>
                            <ArrowRight className={`w-4 h-4 ${arrowClr} shrink-0`} />
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="flex flex-col gap-3"
            >
              {/* Profielgegevens */}
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="bg-[#d4e84a]/20 p-2.5 rounded-xl border border-[#d4e84a]/25">
                      <User className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Gegevens bewerken</h2>
                      <p className={`text-[11px] ${subClr} mt-0.5`}>Naam en e-mailadres</p>
                    </div>
                  </div>

                  <form onSubmit={handleProfielOpslaan} className="flex flex-col gap-4">
                    {[
                      { key: 'naam',  label: 'Naam',        type: 'text',  icon: User, value: naam,  onChange: setNaam  },
                      { key: 'email', label: 'E-mailadres', type: 'email', icon: Mail, value: email, onChange: setEmail },
                    ].map(({ key, label, type, icon: Icon, value, onChange }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className={`text-[10px] font-bold ${labelClr} uppercase tracking-[0.14em]`}>{label}</label>
                        <motion.div
                          animate={focusShadow(key)}
                          transition={{ duration: 0.18 }}
                          className={`relative ${inputBg} rounded-2xl overflow-hidden`}
                        >
                          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === key ? 'text-[#1a3d2b]' : d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
                          <input
                            type={type}
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            onFocus={() => setFocusedField(key)}
                            onBlur={() => setFocusedField(null)}
                            disabled={profielLoading}
                            className={`w-full pl-10 pr-4 py-3.5 text-sm font-medium ${inputClr} bg-transparent outline-none placeholder:text-gray-300 disabled:opacity-50`}
                          />
                        </motion.div>
                      </div>
                    ))}

                    <motion.button
                      whileHover={{ scale: profielLoading ? 1 : 1.02, boxShadow: profielLoading ? 'none' : '0 12px 32px rgba(26,61,43,0.3)' }}
                      whileTap={{ scale: profielLoading ? 1 : 0.97 }}
                      type="submit"
                      disabled={profielLoading}
                      className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-shadow mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2"
                    >
                      {profielLoading ? <><SpinnerIcon />Opslaan...</> : <><Save className="w-4 h-4" />Opslaan</>}
                    </motion.button>
                  </form>
                </div>
              </Card>

              {/* Wachtwoord */}
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className={`p-2.5 rounded-xl border ${d ? 'bg-white/[0.06] border-white/[0.08]' : 'bg-[#1a3d2b]/[0.08] border-[#1a3d2b]/[0.1]'}`}>
                      <Lock className={`w-4 h-4 ${d ? 'text-white/55' : 'text-[#1a3d2b]'}`} />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Wachtwoord wijzigen</h2>
                      <p className={`text-[11px] ${subClr} mt-0.5`}>Min. 8 tekens vereist</p>
                    </div>
                  </div>

                  <form onSubmit={handleWachtwoordWijzigen} className="flex flex-col gap-4">
                    {[
                      { key: 'huidig',  label: 'Huidig wachtwoord',       value: huidigWachtwoord,  onChange: setHuidigWachtwoord },
                      { key: 'nieuw',   label: 'Nieuw wachtwoord',         value: nieuwWachtwoord,   onChange: setNieuwWachtwoord  },
                      { key: 'herhaal', label: 'Herhaal nieuw wachtwoord', value: wachtwoordHerhaal, onChange: setWachtwoordHerhaal },
                    ].map(({ key, label, value, onChange }) => (
                      <div key={key} className="flex flex-col gap-1.5">
                        <label className={`text-[10px] font-bold ${labelClr} uppercase tracking-[0.14em]`}>{label}</label>
                        <motion.div
                          animate={focusShadow(key)}
                          transition={{ duration: 0.18 }}
                          className={`relative ${inputBg} rounded-2xl overflow-hidden`}
                        >
                          <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === key ? 'text-[#1a3d2b]' : d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
                          <input
                            type={key === 'nieuw' && toonNieuw ? 'text' : 'password'}
                            value={value}
                            onChange={e => onChange(e.target.value)}
                            onFocus={() => setFocusedField(key)}
                            onBlur={() => setFocusedField(null)}
                            placeholder="••••••••"
                            disabled={wachtwoordLoading}
                            className={`w-full pl-10 ${key === 'nieuw' ? 'pr-12' : 'pr-4'} py-3.5 text-sm font-medium ${inputClr} bg-transparent outline-none placeholder:text-gray-300 disabled:opacity-50`}
                          />
                          {key === 'nieuw' && (
                            <motion.button
                              type="button"
                              whileTap={{ scale: 0.88 }}
                              onClick={() => setToonNieuw(v => !v)}
                              className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${d ? 'text-white/30 hover:text-white/60' : 'text-[#1a3d2b]/30 hover:text-[#1a3d2b]'}`}
                            >
                              <AnimatePresence mode="wait">
                                {toonNieuw
                                  ? <motion.div key="hide" initial={shouldReduce ? false : { opacity: 0, rotate: -10 }} animate={{ opacity: 1, rotate: 0 }} exit={shouldReduce ? {} : { opacity: 0, rotate: 10 }}><EyeOff className="w-4 h-4" /></motion.div>
                                  : <motion.div key="show" initial={shouldReduce ? false : { opacity: 0, rotate: 10 }} animate={{ opacity: 1, rotate: 0 }} exit={shouldReduce ? {} : { opacity: 0, rotate: -10 }}><Eye className="w-4 h-4" /></motion.div>
                                }
                              </AnimatePresence>
                            </motion.button>
                          )}
                        </motion.div>
                      </div>
                    ))}

                    <motion.button
                      whileHover={{ scale: wachtwoordLoading ? 1 : 1.02, boxShadow: wachtwoordLoading ? 'none' : '0 12px 32px rgba(26,61,43,0.3)' }}
                      whileTap={{ scale: wachtwoordLoading ? 1 : 0.97 }}
                      type="submit"
                      disabled={wachtwoordLoading}
                      className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-shadow mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2"
                    >
                      {wachtwoordLoading ? <><SpinnerIcon />Opslaan...</> : <><Save className="w-4 h-4" />Wachtwoord wijzigen</>}
                    </motion.button>
                  </form>
                </div>
              </Card>

              {/* Uitloggen */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 28px rgba(239,68,68,0.12)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUitloggen}
                className={`w-full rounded-3xl py-4 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 ${d ? 'bg-red-950/30 border-red-900/30 text-red-400 hover:bg-red-950/50 hover:border-red-900/50' : 'bg-white border-red-100 text-red-400 hover:bg-red-50 hover:border-red-200'}`}
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
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            >
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="bg-[#d4e84a]/20 p-2.5 rounded-xl border border-[#d4e84a]/25">
                      <Utensils className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Dieetwensen</h2>
                      <p className={`text-[11px] ${subClr} mt-0.5`}>Selecteer alles wat van toepassing is</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {dieetOpties.map((optie, i) => {
                      const actief = geselecteerdeDieet.includes(optie)
                      return (
                        <motion.button
                          key={optie}
                          initial={{ opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04, type: 'spring', stiffness: 300, damping: 26 }}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.93 }}
                          type="button"
                          onClick={() => toggleDieet(optie)}
                          aria-pressed={actief}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-150 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2 ${
                            actief
                              ? 'bg-[#1a3d2b] text-[#d4e84a] border-[#1a3d2b]'
                              : d
                                ? 'bg-white/[0.05] text-white/55 border-white/[0.1] hover:border-white/25 hover:bg-white/[0.08]'
                                : 'bg-white text-gray-500 border-[#ddebd3] hover:border-[#1a3d2b]/30 hover:bg-[#f6faf2]'
                          }`}
                          style={actief ? { boxShadow: '0 3px 10px rgba(26,61,43,0.22)' } : {}}
                        >
                          <AnimatePresence mode="wait">
                            {actief && (
                              <motion.span
                                key="check"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                              >
                                <Check className="w-3 h-3" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                          {optie}
                        </motion.button>
                      )
                    })}
                  </div>

                  <motion.button
                    whileHover={{ scale: dieetLoading ? 1 : 1.02, boxShadow: dieetLoading ? 'none' : '0 10px 28px rgba(212,232,74,0.32)' }}
                    whileTap={{ scale: dieetLoading ? 1 : 0.97 }}
                    type="button"
                    onClick={handleDieetOpslaan}
                    disabled={dieetLoading}
                    className="w-full bg-[#d4e84a] text-[#1a3d2b] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#c9df3a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3d2b] focus-visible:ring-offset-2"
                  >
                    {dieetLoading ? <><SpinnerIcon />Opslaan...</> : <><Save className="w-4 h-4" />Dieetwensen opslaan</>}
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* TAB: Stuurlinks */}
          {actieveTab === 'stuurlinks' && (
            <motion.div
              key="stuurlinks"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
            >
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="bg-[#d4e84a]/20 p-2.5 rounded-xl border border-[#d4e84a]/25">
                      <UserPlus className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Iemand uitnodigen</h2>
                      <p className={`text-[11px] ${subClr} mt-0.5`}>Eenmalig geldig &middot; verloopt na 24 uur</p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: stuurlinkLoading ? 1 : 1.02, boxShadow: stuurlinkLoading ? 'none' : '0 12px 32px rgba(26,61,43,0.3)' }}
                    whileTap={{ scale: stuurlinkLoading ? 1 : 0.97 }}
                    type="button"
                    onClick={handleStuurlinkAanmaken}
                    disabled={stuurlinkLoading}
                    className="w-full bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2"
                  >
                    {stuurlinkLoading ? <><SpinnerIcon />Aanmaken...</> : <><UserPlus className="w-4 h-4" />Nieuwe uitnodigingslink</>}
                  </motion.button>

                  <AnimatePresence>
                    {gegenereerdeLink && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 32 }}
                        className={`mt-4 ${itemBg} rounded-2xl p-4 border ${d ? 'border-white/[0.07]' : 'border-[#d4e84a]/30'}`}
                      >
                        {gegenereerdeLink.expiresAt && (
                          <div className={`flex items-center gap-1.5 text-xs ${subClr} mb-2.5`}>
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            Geldig tot {new Date(gegenereerdeLink.expiresAt).toLocaleString('nl-NL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        <p className={`text-xs font-mono break-all ${subClr} mb-3 leading-relaxed`}>{gegenereerdeLink.url}</p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.96 }}
                          type="button"
                          onClick={() => handleKopieer(gegenereerdeLink.url)}
                          className="w-full bg-[#d4e84a] text-[#1a3d2b] rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#c9df3a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3d2b]"
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

          {/* TAB: Netwerk */}
          {actieveTab === 'netwerk' && (
            <motion.div
              key="netwerk"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 32 }}
              className="flex flex-col gap-3"
            >
              {/* Jouw netwerkcode */}
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className={`p-2.5 rounded-xl border ${d ? 'bg-white/[0.06] border-white/[0.08]' : 'bg-[#1a3d2b]/[0.08] border-[#1a3d2b]/[0.1]'}`}>
                      <Network className={`w-4 h-4 ${d ? 'text-white/55' : 'text-[#1a3d2b]'}`} />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Jouw netwerkcode</h2>
                      <p className={`text-[11px] ${subClr} mt-0.5`}>Laat je QR scannen of deel je code om te verbinden</p>
                    </div>
                  </div>

                  {netwerkcodeLoading ? (
                    <div className={`h-16 ${skelBg} rounded-2xl animate-pulse mb-4`} />
                  ) : netwerkcode ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`flex flex-col items-center gap-4 py-5 mb-4 rounded-2xl ${d ? 'bg-white/[0.05] border border-white/[0.07]' : 'bg-[#f4f9ef] border border-[#ddebd3]'}`}
                    >
                      {/* QR van de eigen code — witte tegel zodat hij ook in dark mode scanbaar is */}
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <div ref={netwerkQrRef} className="h-40 w-40" aria-label="QR-code van jouw netwerkcode" />
                      </div>
                      <span className={`font-black tracking-[0.28em] text-2xl select-all ${titleClr}`}>
                        {netwerkcode}
                      </span>
                    </motion.div>
                  ) : (
                    <div className={`flex items-center justify-center py-5 mb-4 rounded-2xl ${d ? 'bg-white/[0.04] border border-white/[0.05]' : 'bg-gray-50 border border-gray-100'}`}>
                      <span className={`text-sm ${subClr}`}>Geen code beschikbaar</span>
                    </div>
                  )}

                  {netwerkcode && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleKopieer(netwerkcode)}
                      className="w-full bg-[#d4e84a] text-[#1a3d2b] rounded-2xl py-3.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#c9df3a] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3d2b] focus-visible:ring-offset-2"
                    >
                      <Copy className="w-4 h-4" />
                      Code kopiëren
                    </motion.button>
                  )}
                </div>
              </Card>

              {/* Contact toevoegen */}
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-6">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="bg-[#d4e84a]/20 p-2.5 rounded-xl border border-[#d4e84a]/25">
                      <UserPlus className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Contact toevoegen</h2>
                      <p className={`text-[11px] ${subClr} mt-0.5`}>Scan een QR-code of voer een code in</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.div
                      animate={focusShadow('invulcode')}
                      transition={{ duration: 0.18 }}
                      className={`flex-1 relative ${inputBg} rounded-2xl overflow-hidden`}
                    >
                      <Hash className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'invulcode' ? 'text-[#1a3d2b]' : d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
                      <input
                        type="text"
                        value={invulCode}
                        onChange={e => setInvulCode(e.target.value.toUpperCase())}
                        onFocus={() => setFocusedField('invulcode')}
                        onBlur={() => setFocusedField(null)}
                        onKeyDown={e => e.key === 'Enter' && handleCodeToevoegen()}
                        placeholder="Code..."
                        maxLength={20}
                        disabled={codeToevoegenLoading}
                        className={`w-full pl-10 pr-4 py-3.5 text-sm font-bold tracking-widest ${inputClr} bg-transparent outline-none placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal uppercase disabled:opacity-50`}
                      />
                    </motion.div>
                    <motion.button
                      whileHover={{ scale: codeToevoegenLoading ? 1 : 1.05 }}
                      whileTap={{ scale: codeToevoegenLoading ? 1 : 0.93 }}
                      onClick={handleCodeToevoegen}
                      disabled={codeToevoegenLoading || !invulCode.trim()}
                      aria-label="Contact toevoegen"
                      className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl px-5 py-3.5 text-sm font-bold flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2"
                    >
                      {codeToevoegenLoading ? <SpinnerIcon /> : <UserPlus className="w-4 h-4" />}
                    </motion.button>
                  </div>

                  {/* QR scannen: camera aan/uit; bij een geslaagde scan wordt het contact direct toegevoegd */}
                  <AnimatePresence initial={false}>
                    {netwerkScannen && (
                      <motion.div
                        key="netwerk-scanner"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="relative mt-3 overflow-hidden rounded-2xl bg-black">
                          <video ref={netwerkVideoRef} className="aspect-square w-full object-cover" muted playsInline />
                          {/* Scankader */}
                          <div className="pointer-events-none absolute inset-0 grid place-items-center">
                            <div className="h-40 w-40 rounded-2xl border-2 border-[#d4e84a]/80" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => setNetwerkScannen(s => !s)}
                    className={`mt-3 w-full rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] focus-visible:ring-offset-2 ${
                      netwerkScannen
                        ? (d ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-[#1a3d2b]/[0.06] text-[#1a3d2b] hover:bg-[#1a3d2b]/[0.1]')
                        : 'bg-[#1a3d2b] text-[#d4e84a] hover:bg-[#16331f]'
                    }`}
                  >
                    {netwerkScannen ? <><X className="w-4 h-4" />Stop scannen</> : <><Camera className="w-4 h-4" />Scan een QR-code</>}
                  </motion.button>
                </div>
              </Card>

              {/* Contacten lijst */}
              <Card dark={d}>
                <div className={gradientTop} />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${d ? 'bg-white/[0.06]' : 'bg-[#eef3e8]'}`}>
                        <UserCheck className={`w-4 h-4 ${d ? 'text-white/55' : 'text-[#1a3d2b]'}`} />
                      </div>
                      <h2 className={`text-sm font-bold ${titleClr}`}>Mijn contacten</h2>
                    </div>
                    {!contactenLoading && (
                      <span className={`text-[11px] font-medium ${subClr} px-2.5 py-1 rounded-full ${d ? 'bg-white/[0.06]' : 'bg-[#eef3e8]'}`}>
                        {netwerkContacten.length} contact{netwerkContacten.length !== 1 ? 'en' : ''}
                      </span>
                    )}
                  </div>

                  {contactenLoading ? (
                    <div className="flex flex-col gap-2.5">
                      {[1, 2].map(i => <div key={i} className={`h-[52px] ${skelBg} rounded-2xl animate-pulse`} />)}
                    </div>
                  ) : netwerkContacten.length === 0 ? (
                    <div className="text-center py-6">
                      <div className={`w-10 h-10 ${d ? 'bg-white/[0.06]' : 'bg-[#eef3e8]'} rounded-2xl flex items-center justify-center mx-auto mb-2.5`}>
                        <UserCheck className={`w-5 h-5 ${d ? 'text-white/20' : 'text-[#1a3d2b]/25'}`} />
                      </div>
                      <p className={`text-xs ${subClr}`}>Nog geen contacten. Voeg iemand toe via hun code.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {netwerkContacten.map((contact, i) => (
                        <motion.div
                          key={contact.id || i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, type: 'spring', stiffness: 260, damping: 32 }}
                          className={`flex items-center gap-3 p-3 rounded-2xl ${itemBg}`}
                        >
                          <div className="shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#d4e84a]/80 to-[#b8d43a]/60 flex items-center justify-center">
                            <span className="text-[#1a3d2b] font-black text-sm">
                              {(contact.name || contact.naam || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${titleClr} truncate`}>{contact.name || contact.naam}</p>
                            {(contact.email || contact.role) && (
                              <p className={`text-xs ${subClr} mt-0.5 truncate`}>{contact.email || contact.role}</p>
                            )}
                          </div>
                          <UserCheck className={`w-4 h-4 shrink-0 ${d ? 'text-[#d4e84a]/40' : 'text-[#4a8c60]/50'}`} />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Profiel
