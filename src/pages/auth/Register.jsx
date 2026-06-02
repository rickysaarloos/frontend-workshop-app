import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react'
import { toast, Toaster } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://187.124.29.171:8002'

function Register() {
  const navigate = useNavigate()
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)

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
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: naam,
          email,
          password: wachtwoord,
          password_confirmation: wachtwoordHerhaal,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.message || 'Registreren mislukt')
        return
      }

      toast.success('Account succesvol aangemaakt')

      setTimeout(() => {
        navigate('/login')
      }, 1000)

    } catch (error) {
      toast.error('Kan geen verbinding maken met de server')
    } finally {
      setIsLoading(false)
    }
  }



  const fields = [
    { key: 'naam', label: 'Naam', type: 'text', value: naam, onChange: setNaam, placeholder: 'Jouw volledige naam', Icon: User },
    { key: 'email', label: 'E-mailadres', type: 'email', value: email, onChange: setEmail, placeholder: 'naam@tcrmbo.nl', Icon: Mail },
    { key: 'wachtwoord', label: 'Wachtwoord', type: 'password', value: wachtwoord, onChange: setWachtwoord, placeholder: '••••••••', Icon: Lock },
    { key: 'herhaal', label: 'Wachtwoord herhalen', type: 'password', value: wachtwoordHerhaal, onChange: setWachtwoordHerhaal, placeholder: '••••••••', Icon: Lock },
  ]

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

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 px-1"
          >
            <h1 className="text-2xl font-bold text-[#1a3d2b] tracking-tight">Account aanmaken</h1>
            <p className="text-sm text-gray-400 mt-1">Workshop app · Techniek College Rotterdam</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-3xl border border-gray-100 p-8 shadow-lg shadow-gray-100/80"
          >


            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {fields.map(({ key, label, type, value, onChange, placeholder, Icon }, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.07 }}
                  className="flex flex-col gap-1.5"
                >
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</label>
                  <motion.div
                    animate={{ scale: focusedField === key ? 1.01 : 1 }}
                    transition={{ duration: 0.15 }}
                    className="relative"
                  >
                    <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === key ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
                    <input
                      type={type}
                      value={value}
                      onChange={(e) => onChange(e.target.value)}
                      onFocus={() => setFocusedField(key)}
                      onBlur={() => setFocusedField(null)}
                      placeholder={placeholder}
                      disabled={isLoading}
                      className="w-full border-2 border-gray-100 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none focus:border-[#1a3d2b] bg-gray-50 focus:bg-white transition-all duration-200 disabled:opacity-50"
                    />
                  </motion.div>
                  {key === 'wachtwoord' && (
                    <p className="text-xs text-gray-400 pl-1">Minimaal 8 tekens</p>
                  )}
                </motion.div>
              ))}

              <motion.button
                whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: isLoading ? 'none' : '0 8px 24px rgba(212,232,74,0.4)' }}
                whileTap={{ scale: isLoading ? 1 : 0.97 }}
                type="submit"
                disabled={isLoading}
                className="bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Account aanmaken...
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Account aanmaken
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              <p className="text-xs text-center text-gray-400 pt-1">
                Al een account?{' '}
                <span onClick={() => navigate('/login')} className="text-[#1a3d2b] font-semibold cursor-pointer hover:underline underline-offset-2">
                  Inloggen
                </span>
              </p>

            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register