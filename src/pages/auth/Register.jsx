import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { Mail, Lock, User, UserPlus } from 'lucide-react'
import { toast, Toaster } from 'sonner'

/**
 * Registreer pagina voor de Workshop app van TCR.
 * Bevat een formulier met naam, e-mailadres en wachtwoord.
 * Na succesvolle registratie wordt de gebruiker doorgestuurd naar de loginpagina.
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

  /**
   * Het herhaalde wachtwoord ter bevestiging.
   * @type {string}
   */
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')

  const navigate = useNavigate()

  /**
   * Verwerkt het registratieformulier.
   * Checkt of wachtwoorden overeenkomen voor verzenden.
   * Later vervangen met echte API call.
   *
   * @param {React.FormEvent} e - Het submit event van het formulier
   */
  function handleSubmit(e) {
    e.preventDefault()

    if (!naam || !email || !wachtwoord || !wachtwoordHerhaal) {
      toast.error('Vul alle velden in')
      return
    }

    if (wachtwoord !== wachtwoordHerhaal) {
      toast.error('Wachtwoorden komen niet overeen')
      return
    }

    // later vervangen met echte API call
    toast.success('Account aangemaakt!')
    console.log('registreren met:', naam, email, wachtwoord)
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Naam veld met icoon */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Naam</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                  placeholder="Jouw naam"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
                />
              </div>
            </div>

            {/* E-mailadres veld met icoon */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">E-mailadres</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="naam@tcrmbo.nl"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
                />
              </div>
            </div>

            {/* Wachtwoord veld met icoon */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Wachtwoord</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={wachtwoord}
                  onChange={(e) => setWachtwoord(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
                />
              </div>
            </div>

            {/* Wachtwoord herhalen veld met icoon */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Wachtwoord herhalen</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={wachtwoordHerhaal}
                  onChange={(e) => setWachtwoordHerhaal(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-[#d4e84a] text-[#1a3d2b] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#c8dc3e] transition-colors mt-2 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Account aanmaken
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