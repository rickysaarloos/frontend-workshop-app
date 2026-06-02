import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react'
import { toast, Toaster } from 'sonner'

function Login() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()

    if (!email || !wachtwoord) {
      toast.error('Vul alle velden in')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        'http://187.124.29.171:8002/api/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            email,
            password: wachtwoord,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Inloggen mislukt')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success(`Welkom terug, ${data.user.name}!`)

      setTimeout(() => {
        navigate('/home')
      }, 1000)

    } catch (error) {
      toast.error('Kan geen verbinding maken met de server')
    } finally {
      setIsLoading(false)
    }
  }


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

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">

          {/* Titel boven kaart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 px-1"
          >
            <h1 className="text-2xl font-bold text-[#1a3d2b] tracking-tight">Inloggen</h1>
            <p className="text-sm text-gray-400 mt-1">Workshop app · Techniek College Rotterdam</p>
          </motion.div>

          {/* Kaart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg shadow-gray-100/80"
          >
            {/* Mock tip */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="mb-6 p-3.5 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-700"
            >
              <p className="font-semibold mb-1.5">🔧 Mock modus actief</p>
              <p className="text-amber-600">student@tcrmbo.nl · docent@tcrmbo.nl · admin@tcrmbo.nl</p>
              <p className="text-amber-600 mt-0.5">Wachtwoord: <span className="font-medium">wachtwoord123</span></p>
            </motion.div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* E-mail veld */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mailadres</label>
                <motion.div
                  animate={{ scale: focusedField === 'email' ? 1.01 : 1 }}
                  transition={{ duration: 0.15 }}
                  className="relative"
                >
                  <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="naam@tcrmbo.nl"
                    disabled={isLoading}
                    className="w-full border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1a3d2b] bg-gray-50 focus:bg-white transition-all duration-200 disabled:opacity-50"
                  />
                </motion.div>
              </div>

              {/* Wachtwoord veld */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Wachtwoord</label>
                <motion.div
                  animate={{ scale: focusedField === 'wachtwoord' ? 1.01 : 1 }}
                  transition={{ duration: 0.15 }}
                  className="relative"
                >
                  <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'wachtwoord' ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
                  <input
                    type="password"
                    value={wachtwoord}
                    onChange={(e) => setWachtwoord(e.target.value)}
                    onFocus={() => setFocusedField('wachtwoord')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1a3d2b] bg-gray-50 focus:bg-white transition-all duration-200 disabled:opacity-50"
                  />
                </motion.div>
              </div>

              {/* Submit knop */}
              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: isLoading ? 'none' : '0 8px 24px rgba(212,232,74,0.4)' }}
                whileTap={{ scale: isLoading ? 1 : 0.97 }}
                type="submit"
                disabled={isLoading}
                className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 mt-1 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Bezig met inloggen...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <LogIn className="w-4 h-4" />
                      Inloggen
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Link naar register */}
              <p className="text-xs text-center text-gray-400 pt-1">
                Nog geen account?{' '}
                <span
                  onClick={() => navigate('/register')}
                  className="text-[#1a3d2b] font-semibold cursor-pointer hover:underline underline-offset-2"
                >
                  Registreren
                </span>
              </p>

            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login