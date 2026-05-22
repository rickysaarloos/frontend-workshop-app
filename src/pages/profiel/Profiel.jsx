import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { User, Mail, Lock, Utensils, LogOut, ChevronLeft, Save, Check, BookOpen, CalendarDays, ChevronRight, ArrowRight } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const mockUser = { name: 'Jan de Vries', email: 'student@tcrmbo.nl', role: 'student' }

const dieetOpties = [
  'Vegetarisch', 'Veganistisch', 'Glutenvrij', 'Lactosevrij',
  'Halal', 'Kosher', 'Notenallergie', 'Geen restricties',
]

const mockIngeschrevenWorkshops = [
  { id: 1, titel: 'Workshop Lassen', datum: '2026-06-10', tijd: '09:00 - 12:00' },
  { id: 3, titel: 'Workshop Elektrotechniek', datum: '2026-06-12', tijd: '10:00 - 13:00' },
]

const mockIngeschrevenEvents = [
  { id: 1, titel: 'Studiedag Techniek 2026', datum: '2026-06-10', locatie: 'TCR Hoofdgebouw' },
]

function Profiel() {
  const navigate = useNavigate()
  const opgeslagenUser = JSON.parse(localStorage.getItem('user') || 'null') || mockUser

  const [naam, setNaam] = useState(opgeslagenUser.name || '')
  const [email, setEmail] = useState(opgeslagenUser.email || '')
  const [huidigWachtwoord, setHuidigWachtwoord] = useState('')
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('')
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')
  const [geselecteerdeDieet, setGeselecteerdeDieet] = useState(['Geen restricties'])
  const [profielLoading, setProfielLoading] = useState(false)
  const [wachtwoordLoading, setWachtwoordLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [actievTab, setActieveTab] = useState('info')

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
    await new Promise((r) => setTimeout(r, 800))
    localStorage.setItem('user', JSON.stringify({ ...opgeslagenUser, name: naam, email }))
    toast.success('Profiel opgeslagen!')
    setProfielLoading(false)
  }

  async function handleWachtwoordWijzigen(e) {
    e.preventDefault()
    if (!huidigWachtwoord || !nieuwWachtwoord || !wachtwoordHerhaal) { toast.error('Vul alle velden in'); return }
    if (nieuwWachtwoord !== wachtwoordHerhaal) { toast.error('Wachtwoorden komen niet overeen'); return }
    if (nieuwWachtwoord.length < 8) { toast.error('Minimaal 8 tekens'); return }
    setWachtwoordLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    toast.success('Wachtwoord gewijzigd!')
    setHuidigWachtwoord(''); setNieuwWachtwoord(''); setWachtwoordHerhaal('')
    setWachtwoordLoading(false)
  }

  function handleUitloggen() {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    toast.success('Je bent uitgelogd')
    setTimeout(() => navigate('/login'), 600)
  }

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' })
  }

  const SaveButton = ({ loading, label }) => (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 6px 20px rgba(26,61,43,0.25)' }}
      whileTap={{ scale: loading ? 1 : 0.97 }}
      type="submit"
      disabled={loading}
      className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Opslaan...
          </motion.div>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {label}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )

  const inputClass = (field) =>
    `w-full border-2 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200 disabled:opacity-50 bg-gray-50 focus:bg-white ${focusedField === field ? 'border-[#1a3d2b]' : 'border-gray-100'}`

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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/home')}
            className="text-white/40 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10 mr-1"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          <div className="w-7 h-7 bg-[#d4e84a] rounded-lg flex items-center justify-center">
            <span className="text-[#1a3d2b] font-black text-xs">T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-xs tracking-tight">Techniek College</span>
            <span className="text-white/40 text-xs">Rotterdam</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUitloggen}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/10"
        >
          <LogOut className="w-3.5 h-3.5" />
          Uitloggen
        </motion.button>
      </motion.header>

      {/* Profiel hero */}
      <div className="px-6 pt-2 pb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#d4e84a]/5 rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-4"
        >
          {/* Avatar groot */}
          <div className="w-16 h-16 rounded-2xl bg-[#d4e84a] flex items-center justify-center shadow-xl shrink-0">
            <span className="text-[#1a3d2b] font-black text-2xl">{naam.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-white tracking-tight">{naam}</h1>
            <p className="text-white/40 text-xs mt-0.5">{email}</p>
            <span className="inline-block mt-1.5 bg-[#d4e84a]/20 text-[#d4e84a] text-xs font-bold px-2.5 py-0.5 rounded-lg capitalize">
              {opgeslagenUser.role || 'student'}
            </span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex gap-3 mt-5"
        >
          <div className="flex-1 bg-white/8 rounded-2xl p-3.5 text-center border border-white/10">
            <p className="text-white font-black text-2xl">{mockIngeschrevenWorkshops.length}</p>
            <p className="text-white/40 text-xs mt-0.5">workshops</p>
          </div>
          <div className="flex-1 bg-white/8 rounded-2xl p-3.5 text-center border border-white/10">
            <p className="text-white font-black text-2xl">{mockIngeschrevenEvents.length}</p>
            <p className="text-white/40 text-xs mt-0.5">events</p>
          </div>
          <div className="flex-1 bg-white/8 rounded-2xl p-3.5 text-center border border-white/10">
            <p className="text-white font-black text-2xl">{geselecteerdeDieet.filter(d => d !== 'Geen restricties').length}</p>
            <p className="text-white/40 text-xs mt-0.5">dieetwensen</p>
          </div>
        </motion.div>
      </div>

      {/* Witte content sectie */}
      <div className="flex-1 bg-gray-50 rounded-t-[2rem] px-5 pt-6 pb-8 flex flex-col gap-4">

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex gap-2 bg-white rounded-2xl p-1.5 border border-gray-100"
        >
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActieveTab(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                actievTab === key
                  ? 'bg-[#1a3d2b] text-[#d4e84a] shadow-sm'
                  : 'text-gray-400 hover:text-[#1a3d2b]'
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* TAB: Overzicht */}
          {actievTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {/* Ingeschreven workshops */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#d4e84a] p-2 rounded-xl">
                      <BookOpen className="w-4 h-4 text-[#1a3d2b]" />
                    </div>
                    <h2 className="text-sm font-bold text-[#1a3d2b]">Mijn workshops</h2>
                  </div>
                  <span className="text-xs text-gray-400">{mockIngeschrevenWorkshops.length} ingeschreven</span>
                </div>
                <div className="flex flex-col gap-2">
                  {mockIngeschrevenWorkshops.map((w) => (
                    <motion.div
                      key={w.id}
                      whileHover={{ x: 4 }}
                      onClick={() => navigate(`/workshops/${w.id}`)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-[#eaf3de] cursor-pointer transition-all duration-150"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1a3d2b]">{w.titel}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDatum(w.datum)} · {w.tijd}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Ingeschreven events */}
              <div className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#1a3d2b] p-2 rounded-xl">
                      <CalendarDays className="w-4 h-4 text-[#d4e84a]" />
                    </div>
                    <h2 className="text-sm font-bold text-[#1a3d2b]">Mijn events</h2>
                  </div>
                  <span className="text-xs text-gray-400">{mockIngeschrevenEvents.length} ingeschreven</span>
                </div>
                <div className="flex flex-col gap-2">
                  {mockIngeschrevenEvents.map((e) => (
                    <motion.div
                      key={e.id}
                      whileHover={{ x: 4 }}
                      onClick={() => navigate(`/events/${e.id}`)}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-[#eaf3de] cursor-pointer transition-all duration-150"
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#1a3d2b]">{e.titel}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDatum(e.datum)} · {e.locatie}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: Bewerken */}
          {actievTab === 'bewerken' && (
            <motion.div
              key="bewerken"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-4"
            >
              {/* Gegevens bewerken */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="bg-[#eaf3de] p-2 rounded-xl">
                    <User className="w-4 h-4 text-[#1a3d2b]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#1a3d2b]">Gegevens bewerken</h2>
                </div>
                <form onSubmit={handleProfielOpslaan} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Naam</label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'naam' ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
                      <input type="text" value={naam} onChange={(e) => setNaam(e.target.value)} onFocus={() => setFocusedField('naam')} onBlur={() => setFocusedField(null)} disabled={profielLoading} className={inputClass('naam')} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mailadres</label>
                    <div className="relative">
                      <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focusedField === 'email' ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} disabled={profielLoading} className={inputClass('email')} />
                    </div>
                  </div>
                  <SaveButton loading={profielLoading} label="Opslaan" />
                </form>
              </div>

              {/* Wachtwoord */}
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="bg-[#eaf3de] p-2 rounded-xl">
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
                        <input type="password" value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setFocusedField(key)} onBlur={() => setFocusedField(null)} placeholder="••••••••" disabled={wachtwoordLoading} className={inputClass(key)} />
                      </div>
                      {key === 'nieuw' && <p className="text-xs text-gray-400 pl-1">Minimaal 8 tekens</p>}
                    </div>
                  ))}
                  <SaveButton loading={wachtwoordLoading} label="Wachtwoord wijzigen" />
                </form>
              </div>

              {/* Uitloggen */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(239,68,68,0.12)' }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-[#eaf3de] p-2 rounded-xl">
                    <Utensils className="w-4 h-4 text-[#1a3d2b]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#1a3d2b]">Dieetwensen</h2>
                </div>
                <p className="text-xs text-gray-400 mb-5 pl-1">Selecteer alles wat van toepassing is</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {dieetOpties.map((optie) => (
                    <motion.button
                      key={optie}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => toggleDieet(optie)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border-2 transition-all duration-150 flex items-center gap-1.5 ${
                        geselecteerdeDieet.includes(optie)
                          ? 'bg-[#1a3d2b] text-[#d4e84a] border-[#1a3d2b] shadow-md shadow-[#1a3d2b]/15'
                          : 'bg-white text-gray-500 border-gray-100 hover:border-[#1a3d2b]/30'
                      }`}
                    >
                      {geselecteerdeDieet.includes(optie) && <Check className="w-3 h-3" />}
                      {optie}
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(26,61,43,0.2)' }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => toast.success('Dieetwensen opgeslagen!')}
                  className="w-full bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Save className="w-4 h-4" />
                  Dieetwensen opslaan
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

export default Profiel