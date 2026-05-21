import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Mail, Lock, User, UserPlus } from 'lucide-react'
import { toast, Toaster } from 'sonner'

// ============================================================
// MOCK FUNCTIE — later vervangen met echte API call
// Verwijder deze functie en gebruik api.js wanneer backend klaar is
// ============================================================
async function mockRegister(naam, email, wachtwoord) {
  // Simuleert een netwerk delay van 1000ms
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Simuleer dat dit e-mailadres al bestaat
  const bestaandeEmails = ['bezet@tcrmbo.nl']
  if (bestaandeEmails.includes(email)) {
    throw { message: 'Dit e-mailadres is al in gebruik.' }
  }

  // Simuleert een succesvolle registratie response
  return {
    token: 'mock-token-nieuw-67890',
    user: {
      id: 99,
      name: naam,
      email: email,
      role: 'student',
    },
  }
}
// ============================================================
// EINDE MOCK — Echte implementatie:
//
// import { register } from '../api'   ← jouw api.js bestand
//
// async function handleSubmit(e) {
//   e.preventDefault()
//   setIsLoading(true)
//   try {
//     const data = await register(naam, email, wachtwoord)
//     localStorage.setItem('token', data.token)
//     localStorage.setItem('user', JSON.stringify(data.user))
//     toast.success('Account aangemaakt!')
//     navigate('/dashboard')
//   } catch (err) {
//     toast.error(err.message || 'Registreren mislukt')
//   } finally {
//     setIsLoading(false)
//   }
// }
// ============================================================

/**
 * Registreer pagina voor de Workshop app van TCR.
 * Bevat een formulier met naam, e-mailadres en wachtwoord.
 * Na succesvolle registratie wordt de gebruiker doorgestuurd naar het dashboard.
 *
 * @returns {JSX.Element} De registreer pagina
 */
function Register() {

  /** @type {string} */
  const [naam, setNaam] = useState('')

  /** @type {string} */
  const [email, setEmail] = useState('')

  /** @type {string} */
  const [wachtwoord, setWachtwoord] = useState('')

  /** @type {string} */
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')

  /** @type {boolean} Voorkomt dubbel klikken tijdens laden */
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  /**
   * Verwerkt het registratieformulier.
   * Gebruikt nu mock data — later vervangen met echte API call.
   *
   * @param {React.FormEvent} e - Het submit event van het formulier
   */
  async function handleSubmit(e) {
    e.preventDefault()

    if (!naam || !email || !wachtwoord || !wachtwoordHerhaal) {
      toast.error('Vul alle velden in')
      return
    }

    if (wachtwoord !== wachtwoordHerhaal) {
      toast.error('Wachtwoorden komen niet overeen')
      return
    }

    if (wachtwoord.length < 8) {
      toast.error('Wachtwoord moet minimaal 8 tekens zijn')
      return
    }

    setIsLoading(true)

    try {
      // 🔧 MOCK — vervang 'mockRegister' later met de echte 'register' functie uit api.js
      const data = await mockRegister(naam, email, wachtwoord)

      // Sla de gebruiker op in localStorage (zelfde patroon werkt met echte API)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Account aangemaakt! Welkom bij TCR.')

      // Korte delay zodat de toast zichtbaar is voor navigatie
setTimeout(() => navigate('/home'), 800)

    } catch (err) {
      toast.error(err.message || 'Registreren mislukt, probeer opnieuw.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Sonner toast container */}
      <Toaster position="top-right" richColors />

      {/* Header met TCR logo tekst */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-[#1a3d2b] font-bold text-sm">Techniek</span>
          <span className="text-[#1a3d2b] font-bold text-sm">College</span>
          <span className="text-[#1a3d2b] font-bold text-sm">Rotterdam</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Account aanmaken</h1>
          <p className="text-sm text-gray-500 mb-6">Workshop app TCR</p>

          {/* Tip voor ontwikkeling — verwijder dit blok wanneer backend klaar is */}
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <p className="font-semibold mb-1">🔧 Mock modus actief</p>
            <p>Vul een willekeurig e-mailadres in om te registreren.</p>
            <p className="mt-1">Test een fout met: <span className="font-medium">bezet@tcrmbo.nl</span></p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Naam veld */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Naam</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                  placeholder="Jouw naam"
                  disabled={isLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* E-mailadres veld */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">E-mailadres</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@tcrmbo.nl"
                  disabled={isLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Wachtwoord veld */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Wachtwoord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={wachtwoord}
                  onChange={(e) => setWachtwoord(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-400">Minimaal 8 tekens</p>
            </div>

            {/* Wachtwoord herhalen veld */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Wachtwoord herhalen</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={wachtwoordHerhaal}
                  onChange={(e) => setWachtwoordHerhaal(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className="bg-[#d4e84a] text-[#1a3d2b] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#c8dc3e] transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Account aanmaken...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Account aanmaken
                </>
              )}
            </motion.button>

            <p className="text-xs text-center text-gray-500">
              Al een account?{' '}
              <span
                onClick={() => navigate('/login')}
                className="text-[#1a3d2b] font-medium cursor-pointer hover:underline"
              >
                Inloggen
              </span>
            </p>

          </form>
        </motion.div>
      </div>

    </div>
  )
}

export default Register