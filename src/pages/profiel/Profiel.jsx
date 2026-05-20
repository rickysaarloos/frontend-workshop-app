import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { User, Mail, Lock, Utensils, LogOut, ChevronLeft, Save } from 'lucide-react'
import { toast, Toaster } from 'sonner'

// Mock gebruiker — later vervangen met data uit localStorage of API
const mockUser = {
  name: 'Jan de Vries',
  email: 'student@tcrmbo.nl',
  role: 'student',
}

// Beschikbare dieetwensen
const dieetOpties = [
  'Vegetarisch',
  'Veganistisch',
  'Glutenvrij',
  'Lactosevrij',
  'Halal',
  'Kosher',
  'Notenallergie',
  'Geen restricties',
]

/**
 * Profiel pagina voor de Workshop app van TCR.
 * Toont naam/email, wachtwoord wijzigen, dieetwensen en uitloggen.
 *
 * @returns {JSX.Element}
 */
function Profiel() {
  const navigate = useNavigate()

  // Haal gebruiker op uit localStorage (of gebruik mock)
  const opgeslagenUser = JSON.parse(localStorage.getItem('user') || 'null') || mockUser

  const [naam, setNaam] = useState(opgeslagenUser.name || '')
  const [email, setEmail] = useState(opgeslagenUser.email || '')
  const [huidigWachtwoord, setHuidigWachtwoord] = useState('')
  const [nieuwWachtwoord, setNieuwWachtwoord] = useState('')
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')
  const [geselecteerdeDieet, setGeselecteerdeDieet] = useState(['Geen restricties'])
  const [profielLoading, setProfielLoading] = useState(false)
  const [wachtwoordLoading, setWachtwoordLoading] = useState(false)

  /**
   * Toggle een dieetwens aan/uit
   */
  function toggleDieet(optie) {
    if (optie === 'Geen restricties') {
      setGeselecteerdeDieet(['Geen restricties'])
      return
    }
    setGeselecteerdeDieet((prev) => {
      const zonderGeen = prev.filter((d) => d !== 'Geen restricties')
      if (zonderGeen.includes(optie)) {
        const nieuw = zonderGeen.filter((d) => d !== optie)
        return nieuw.length === 0 ? ['Geen restricties'] : nieuw
      }
      return [...zonderGeen, optie]
    })
  }

  /**
   * Sla profielgegevens op — later vervangen met API call
   */
  async function handleProfielOpslaan(e) {
    e.preventDefault()
    if (!naam || !email) {
      toast.error('Vul naam en e-mailadres in')
      return
    }
    setProfielLoading(true)
    // 🔧 MOCK — later vervangen met: await updateProfiel(naam, email)
    await new Promise((r) => setTimeout(r, 800))
    localStorage.setItem('user', JSON.stringify({ ...opgeslagenUser, name: naam, email }))
    toast.success('Profiel opgeslagen!')
    setProfielLoading(false)
  }

  /**
   * Wijzig wachtwoord — later vervangen met API call
   */
  async function handleWachtwoordWijzigen(e) {
    e.preventDefault()
    if (!huidigWachtwoord || !nieuwWachtwoord || !wachtwoordHerhaal) {
      toast.error('Vul alle wachtwoordvelden in')
      return
    }
    if (nieuwWachtwoord !== wachtwoordHerhaal) {
      toast.error('Nieuwe wachtwoorden komen niet overeen')
      return
    }
    if (nieuwWachtwoord.length < 8) {
      toast.error('Wachtwoord moet minimaal 8 tekens zijn')
      return
    }
    setWachtwoordLoading(true)
    // 🔧 MOCK — later vervangen met: await wijzigWachtwoord(huidigWachtwoord, nieuwWachtwoord)
    await new Promise((r) => setTimeout(r, 800))
    toast.success('Wachtwoord gewijzigd!')
    setHuidigWachtwoord('')
    setNieuwWachtwoord('')
    setWachtwoordHerhaal('')
    setWachtwoordLoading(false)
  }

  /**
   * Uitloggen — verwijdert localStorage en stuurt naar login
   */
  function handleUitloggen() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    toast.success('Je bent uitgelogd')
    setTimeout(() => navigate('/login'), 600)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/Home')}
            className="text-gray-400 hover:text-[#1a3d2b] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col leading-tight">
            <span className="text-[#1a3d2b] font-bold text-sm">Techniek</span>
            <span className="text-[#1a3d2b] font-bold text-sm">College</span>
            <span className="text-[#1a3d2b] font-bold text-sm">Rotterdam</span>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        <div>
          <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Mijn profiel</h1>
          <p className="text-sm text-gray-500">Beheer je gegevens en voorkeuren</p>
        </div>

        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#1a3d2b] flex items-center justify-center">
            <span className="text-[#d4e84a] font-bold text-xl">
              {naam.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a3d2b]">{naam}</p>
            <p className="text-xs text-gray-500 capitalize">{opgeslagenUser.role || 'student'}</p>
          </div>
        </motion.div>

        {/* Naam en email */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#1a3d2b]" />
            <h2 className="text-sm font-semibold text-[#1a3d2b]">Persoonlijke gegevens</h2>
          </div>

          <form onSubmit={handleProfielOpslaan} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Naam</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                  disabled={profielLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">E-mailadres</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={profielLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: profielLoading ? 1 : 1.02 }}
              whileTap={{ scale: profielLoading ? 1 : 0.98 }}
              type="submit"
              disabled={profielLoading}
              className="bg-[#d4e84a] text-[#1a3d2b] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#c8dc3e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {profielLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Opslaan...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Opslaan
                </>
              )}
            </motion.button>

          </form>
        </motion.div>

        {/* Dieetwensen */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-4 h-4 text-[#1a3d2b]" />
            <h2 className="text-sm font-semibold text-[#1a3d2b]">Dieetwensen</h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {dieetOpties.map((optie) => (
              <button
                key={optie}
                onClick={() => toggleDieet(optie)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  geselecteerdeDieet.includes(optie)
                    ? 'bg-[#1a3d2b] text-[#d4e84a] border-[#1a3d2b]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a3d2b]'
                }`}
              >
                {optie}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toast.success('Dieetwensen opgeslagen!')}
            className="mt-4 bg-[#d4e84a] text-[#1a3d2b] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#c8dc3e] transition-colors w-full flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Dieetwensen opslaan
          </motion.button>
        </motion.div>

        {/* Wachtwoord wijzigen */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-[#1a3d2b]" />
            <h2 className="text-sm font-semibold text-[#1a3d2b]">Wachtwoord wijzigen</h2>
          </div>

          <form onSubmit={handleWachtwoordWijzigen} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Huidig wachtwoord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={huidigWachtwoord}
                  onChange={(e) => setHuidigWachtwoord(e.target.value)}
                  placeholder="••••••••"
                  disabled={wachtwoordLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Nieuw wachtwoord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={nieuwWachtwoord}
                  onChange={(e) => setNieuwWachtwoord(e.target.value)}
                  placeholder="••••••••"
                  disabled={wachtwoordLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50"
                />
              </div>
              <p className="text-xs text-gray-400">Minimaal 8 tekens</p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Nieuw wachtwoord herhalen</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={wachtwoordHerhaal}
                  onChange={(e) => setWachtwoordHerhaal(e.target.value)}
                  placeholder="••••••••"
                  disabled={wachtwoordLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: wachtwoordLoading ? 1 : 1.02 }}
              whileTap={{ scale: wachtwoordLoading ? 1 : 0.98 }}
              type="submit"
              disabled={wachtwoordLoading}
              className="bg-[#d4e84a] text-[#1a3d2b] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#c8dc3e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {wachtwoordLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Wijzigen...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Wachtwoord wijzigen
                </>
              )}
            </motion.button>

          </form>
        </motion.div>

        {/* Uitloggen */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUitloggen}
            className="w-full bg-white border border-red-200 text-red-500 rounded-2xl py-4 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
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