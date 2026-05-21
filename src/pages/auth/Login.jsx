import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Mail, Lock, LogIn } from 'lucide-react'
import { toast, Toaster } from 'sonner'

// ============================================================
// MOCK FUNCTIE — later vervangen met echte API call
// Verwijder deze functie en gebruik api.js wanneer backend klaar is
// ============================================================
async function mockLogin(email, wachtwoord) {
  // Simuleert een netwerk delay van 800ms
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Test accounts voor ontwikkeling
  const mockUsers = [
    { email: 'student@tcrmbo.nl', password: 'wachtwoord123', name: 'Jan de Vries', role: 'student' },
    { email: 'docent@tcrmbo.nl', password: 'wachtwoord123', name: 'Mevr. Bakker', role: 'docent' },
    { email: 'admin@tcrmbo.nl', password: 'wachtwoord123', name: 'Admin TCR', role: 'admin' },
  ]

  const user = mockUsers.find(
    (u) => u.email === email && u.password === wachtwoord
  )

  if (!user) {
    // Simuleert een fout van de server
    throw { message: 'Deze combinatie van e-mailadres en wachtwoord klopt niet.' }
  }

  // Simuleert een succesvolle response van de server
  return {
    token: 'mock-token-12345',
    user: {
      id: 1,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  }
}
// ============================================================
// EINDE MOCK — Echte implementatie:
//
// import { login } from '../api'   ← jouw api.js bestand
//
// async function handleSubmit(e) {
//   e.preventDefault()
//   setIsLoading(true)
//   try {
//     const data = await login(email, wachtwoord)
//     localStorage.setItem('token', data.token)
//     localStorage.setItem('user', JSON.stringify(data.user))
//     toast.success('Succesvol ingelogd!')
//     navigate('/dashboard')
//   } catch (err) {
//     toast.error(err.message || 'Inloggen mislukt')
//   } finally {
//     setIsLoading(false)
//   }
// }
// ============================================================

/**
 * Login pagina voor de Workshop app van TCR.
 * Bevat een formulier met e-mailadres en wachtwoord.
 * Na succesvolle login wordt de gebruiker doorgestuurd naar de homepagina.
 *
 * @returns {JSX.Element} De login pagina
 */
function Login() {

  /** @type {string} */
  const [email, setEmail] = useState('')

  /** @type {string} */
  const [wachtwoord, setWachtwoord] = useState('')

  /** @type {boolean} Voorkomt dubbel klikken tijdens laden */
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  /**
   * Verwerkt het inlogformulier.
   * Gebruikt nu mock data — later vervangen met echte API call.
   *
   * @param {React.FormEvent} e - Het submit event van het formulier
   */
  async function handleSubmit(e) {
    e.preventDefault()

    if (!email || !wachtwoord) {
      toast.error('Vul alle velden in')
      return
    }

    setIsLoading(true)

    try {
      // 🔧 MOCK — vervang 'mockLogin' later met de echte 'login' functie uit api.js
      const data = await mockLogin(email, wachtwoord)

      // Sla de gebruiker op in localStorage (zelfde patroon werkt met echte API)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success(`Welkom terug, ${data.user.name}!`)

      // Korte delay zodat de toast zichtbaar is voor navigatie
     setTimeout(() => navigate('/home'), 800)


    } catch (err) {
      toast.error(err.message || 'Inloggen mislukt, probeer opnieuw.')
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
          className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Inloggen</h1>
          <p className="text-sm text-gray-500 mb-6">Workshop app TCR</p>

          {/* Tip voor ontwikkeling — verwijder dit blok wanneer backend klaar is */}
          <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <p className="font-semibold mb-1">🔧 Mock modus actief</p>
            <p>Gebruik een van deze test accounts:</p>
            <p className="mt-1"><span className="font-medium">student@tcrmbo.nl</span> / wachtwoord123</p>
            <p><span className="font-medium">docent@tcrmbo.nl</span> / wachtwoord123</p>
            <p><span className="font-medium">admin@tcrmbo.nl</span> / wachtwoord123</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

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
                  Bezig met inloggen...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Inloggen
                </>
              )}
            </motion.button>

            <p className="text-xs text-center text-gray-500">
              Nog geen account?{' '}
              <span
                onClick={() => navigate('/register')}
                className="text-[#1a3d2b] font-medium cursor-pointer hover:underline"
              >
                Registreren
              </span>
            </p>

          </form>
        </motion.div>
      </div>

    </div>
  )
}

export default Login