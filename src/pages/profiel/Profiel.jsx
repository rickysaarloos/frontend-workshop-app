import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { User, Mail, Lock, Utensils, LogOut, ChevronLeft, Save, Check } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const mockUser = { name: 'Jan de Vries', email: 'student@tcrmbo.nl', role: 'student' }

const dieetOpties = [
  'Vegetarisch', 'Veganistisch', 'Glutenvrij', 'Lactosevrij',
  'Halal', 'Kosher', 'Notenallergie', 'Geen restricties',
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

  const SaveButton = ({ loading, label }) => (
    <motion.button
      whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? 'none' : '0 6px 20px rgba(212,232,74,0.35)' }}
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="text-gray-300 hover:text-[#1a3d2b] transition-colors p-1 rounded-xl hover:bg-gray-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1a3d2b] rounded-lg flex items-center justify-center">
            <span className="text-[#d4e84a] font-black text-xs">T</span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[#1a3d2b] font-bold text-xs tracking-tight">Techniek College</span>
            <span className="text-[#1a3d2b] font-bold text-xs tracking-tight">Rotterdam</span>
          </div>
        </div>
      </motion.header>

      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-5">

        {/* Titel + avatar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1a3d2b] flex items-center justify-center shadow-lg shadow-[#1a3d2b]/20">
            <span className="text-[#d4e84a] font-black text-xl">{naam.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1a3d2b] tracking-tight">{naam}</h1>
            <p className="text-xs text-gray-400 capitalize mt-0.5">{opgeslagenUser.role || 'student'} · TCR</p>
          </div>
        </motion.div>

        {/* Persoonlijke gegevens */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-[#eaf3de] p-2 rounded-xl">
              <User className="w-4 h-4 text-[#1a3d2b]" />
            </div>
            <h2 className="text-sm font-bold text-[#1a3d2b]">Persoonlijke gegevens</h2>
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
        </motion.div>

        {/* Dieetwensen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="bg-[#eaf3de] p-2 rounded-xl">
              <Utensils className="w-4 h-4 text-[#1a3d2b]" />
            </div>
            <h2 className="text-sm font-bold text-[#1a3d2b]">Dieetwensen</h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
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
            whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(212,232,74,0.35)' }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => toast.success('Dieetwensen opgeslagen!')}
            className="w-full bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            Dieetwensen opslaan
          </motion.button>
        </motion.div>

        {/* Wachtwoord wijzigen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
        >
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
              { key: 'herhaal', label: 'Nieuw wachtwoord herhalen', value: wachtwoordHerhaal, onChange: setWachtwoordHerhaal },
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
        </motion.div>

        {/* Uitloggen */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(239,68,68,0.15)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUitloggen}
            className="w-full bg-white border-2 border-red-100 text-red-400 rounded-3xl py-4 text-sm font-bold hover:bg-red-50 hover:border-red-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Uitloggen
          </motion.button>
        </motion.div>

      </div>
    </div>
  )
}

export default Profiel