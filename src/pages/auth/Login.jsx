import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { toast, Toaster } from 'sonner'

import { api } from '@/lib/api'

function Login() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [toonWachtwoord, setToonWachtwoord] = useState(false)
  const [transitioning, setTransitioning] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !wachtwoord) { toast.error('Vul alle velden in'); return }
    setIsLoading(true)
    try {
      const data = await api('/login', { method: 'POST', auth: false, body: { email, password: wachtwoord } })
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setTransitioning(true)
    } catch (err) {
      toast.error(err.message || 'Inloggen mislukt')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a3d2b] flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">
      <Toaster position="top-right" richColors />

      {/* Achtergrond blobs */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.07, 0.13, 0.07] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-24 -top-24 w-80 h-80 bg-[#d4e84a] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.22, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className="absolute -left-28 -bottom-20 w-72 h-72 bg-[#d4e84a] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute left-1/3 top-16 w-28 h-28 bg-white rounded-full pointer-events-none"
      />

      {/* Traag roterende decoratieve ringen */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[440px] h-[440px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(255,255,255,0.05)' }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 38, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(212,232,74,0.08)' }}
      />

      {/* Logo bovenaan */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 40 }}
        className="flex items-center gap-3 mb-8 z-10"
      >
        <img
          src="/img/techniek-college-rotterdam2.jpg"
          alt="Techniek College Rotterdam"
          className="h-9 w-auto object-contain rounded"
        />
        <div className="flex flex-col leading-none">
          <span className="text-white font-bold text-sm tracking-tight">Techniek College</span>
          <span className="text-white/50 font-medium text-xs tracking-tight">Rotterdam</span>
        </div>
      </motion.div>

      {/* Zwevende witte kaart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 32, delay: 0.14 }}
        className="w-full max-w-sm bg-white rounded-3xl p-7 z-10 relative"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.12)' }}
      >
        {/* Kaart heading */}
        <div className="mb-7">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
            className="text-[#1a3d2b]/40 text-xs font-bold uppercase tracking-widest mb-2"
          >
            Workshop app
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.32 }}
            className="text-3xl font-black text-[#1a3d2b] leading-none tracking-tight"
          >
            Welkom<br />terug.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            className="text-gray-400 text-xs mt-2.5"
          >
            Log in om verder te gaan
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* E-mail */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.44 }}
            className="flex flex-col gap-1.5"
          >
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              E-mailadres
            </label>
            <motion.div
              animate={{
                boxShadow: focusedField === 'email'
                  ? '0 0 0 2px #1a3d2b, 0 4px 12px rgba(26,61,43,0.1)'
                  : '0 0 0 1.5px #e5e7eb',
              }}
              transition={{ duration: 0.18 }}
              className="relative bg-gray-50 rounded-2xl overflow-hidden"
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
                className="w-full pl-10 pr-4 py-3.5 text-sm text-[#1a3d2b] bg-transparent outline-none placeholder:text-gray-300 disabled:opacity-50"
              />
            </motion.div>
          </motion.div>

          {/* Wachtwoord */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.5 }}
            className="flex flex-col gap-1.5"
          >
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Wachtwoord
            </label>
            <motion.div
              animate={{
                boxShadow: focusedField === 'wachtwoord'
                  ? '0 0 0 2px #1a3d2b, 0 4px 12px rgba(26,61,43,0.1)'
                  : '0 0 0 1.5px #e5e7eb',
              }}
              transition={{ duration: 0.18 }}
              className="relative bg-gray-50 rounded-2xl overflow-hidden"
            >
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'wachtwoord' ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
              <input
                type={toonWachtwoord ? 'text' : 'password'}
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                onFocus={() => setFocusedField('wachtwoord')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3.5 text-sm text-[#1a3d2b] bg-transparent outline-none placeholder:text-gray-300 disabled:opacity-50"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => setToonWachtwoord(!toonWachtwoord)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1a3d2b] transition-colors"
              >
                <AnimatePresence mode="wait">
                  {toonWachtwoord ? (
                    <motion.div key="hide" initial={{ opacity: 0, rotate: -10 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 10 }}>
                      <EyeOff className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="show" initial={{ opacity: 0, rotate: 10 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -10 }}>
                      <Eye className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.56 }}
            className="mt-1"
          >
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: isLoading ? 'none' : '0 10px 28px rgba(26,61,43,0.32)' }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
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
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    Inloggen
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

        </form>
      </motion.div>

      {/* Radiale transitie-overlay naar Home */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 62%)' }}
            animate={{ clipPath: 'circle(160% at 50% 62%)' }}
            transition={{ duration: 0.75, ease: [0.32, 0, 0.16, 1] }}
            onAnimationComplete={() => navigate('/home')}
            className="fixed inset-0 bg-[#1a3d2b] z-50"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Login
