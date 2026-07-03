import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import { toast, Toaster } from 'sonner'

import { api } from '@/lib/api'

// Grove wachtwoordsterkte voor de balk: 0 leeg, 1 te kort, 2 redelijk, 3 sterk.
function passwordStrength(pw) {
  if (!pw) return 0
  if (pw.length < 8) return 1
  if (pw.length < 12) return 2
  return 3
}

const strengthMeta = {
  1: { label: 'Te kort',  color: 'bg-red-400' },
  2: { label: 'Redelijk', color: 'bg-amber-400' },
  3: { label: 'Sterk',    color: 'bg-[#1a3d2b]' },
}

// Registratiepagina (route /register). Werkt alleen met een geldig `token` uit de
// query-string; zonder (of bij een afgekeurd) token toont de pagina een blokkade.
function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [toonWachtwoord, setToonWachtwoord] = useState(false)
  const [toonHerhaal, setToonHerhaal] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [linkError, setLinkError] = useState(null)

  // Valideert de velden, registreert via de API met het uitnodigingstoken en
  // vertaalt backend-fouten (afgekeurd token, 422, 429, netwerk) naar toasts.
  async function handleSubmit(e) {
    e.preventDefault()

    // Client-side controles: wijs precies aan wélk veld nog niet klopt,
    // zodat de gebruiker meteen weet wat er moet gebeuren.
    if (!naam.trim()) {
      toast.error('Vul je naam in', {
        description: 'We hebben je volledige naam nodig voor je account.',
      })
      return
    }
    if (!email.trim()) {
      toast.error('Vul je e-mailadres in', {
        description: 'Met dit adres log je straks in.',
      })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Dit e-mailadres klopt niet', {
        description: 'Controleer of het adres een @ en een geldig domein bevat, bijv. naam@tcrmbo.nl.',
      })
      return
    }
    if (!wachtwoord) {
      toast.error('Kies een wachtwoord', {
        description: 'Gebruik minimaal 8 tekens.',
      })
      return
    }
    if (wachtwoord.length < 8) {
      toast.error('Je wachtwoord is te kort', {
        description: `Gebruik minimaal 8 tekens — je hebt er nu ${wachtwoord.length}.`,
      })
      return
    }
    if (!wachtwoordHerhaal) {
      toast.error('Herhaal je wachtwoord', {
        description: 'Vul je wachtwoord nog een keer in ter controle.',
      })
      return
    }
    if (wachtwoord !== wachtwoordHerhaal) {
      toast.error('De wachtwoorden komen niet overeen', {
        description: 'Zorg dat je in beide velden exact hetzelfde wachtwoord typt.',
      })
      return
    }

    setIsLoading(true)
    try {
      await api('/register', {
        method: 'POST',
        auth: false,
        body: {
          name: naam.trim(),
          // E-mail genormaliseerd: de backend slaat adressen in kleine letters op,
          // dus een hoofdletter aan het begin leverde anders een 422 op.
          email: email.trim().toLowerCase(),
          password: wachtwoord,
          password_confirmation: wachtwoordHerhaal,
          token,
        },
      })
      setRegistered(true)
    } catch (err) {
      // Stuurlink afgekeurd door de backend (ongeldig of verlopen)
      const tokenError = err.errors?.token?.[0]
      if (tokenError || err.status === 403 || err.status === 410) {
        setLinkError(tokenError || err.message || 'Deze stuurlink is ongeldig of verlopen.')
        return
      }

      // Geen HTTP-response: netwerk- of timeoutfout (api.js zet status op 0).
      if (err.status === 0) {
        toast.error('Geen verbinding met de server', {
          description: err.message || 'Controleer je internetverbinding en probeer het opnieuw.',
        })
        return
      }

      // Te veel pogingen achter elkaar.
      if (err.status === 429) {
        toast.error('Te veel pogingen', {
          description: 'Wacht even en probeer het over een paar minuten opnieuw.',
        })
        return
      }

      // Validatiefouten van de backend (422): toon het eerste, veldspecifieke bericht.
      if (err.status === 422 && err.errors) {
        const emailError = err.errors.email?.[0]
        const passwordError = err.errors.password?.[0]
        const nameError = err.errors.name?.[0]

        if (emailError) {
          const alreadyUsed = /taken|bestaat|already|in gebruik/i.test(emailError)
          toast.error(alreadyUsed ? 'Dit e-mailadres is al in gebruik' : 'Controleer je e-mailadres', {
            description: alreadyUsed
              ? 'Er bestaat al een account met dit adres. Log in of gebruik een ander e-mailadres.'
              : emailError,
          })
          return
        }
        toast.error('Controleer je gegevens', {
          description: passwordError || nameError || 'Niet alle velden zijn correct ingevuld.',
        })
        return
      }

      // Alle overige fouten (bijv. 500).
      toast.error('Registreren is mislukt', {
        description: err.message || 'Er ging iets mis aan onze kant. Probeer het later opnieuw.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const pwStrength = passwordStrength(wachtwoord)
  const pwMeta = strengthMeta[pwStrength]
  // Zonder geldige stuurlink is registreren niet mogelijk (US-04c),
  // en een door de backend afgekeurde link toont dezelfde kaart (US-04b).
  const showBlocked = !token || linkError

  return (
    <div className="min-h-[100dvh] bg-[#1a3d2b] flex flex-col items-center justify-center relative overflow-hidden px-6 py-12">
      <Toaster position="top-right" richColors />

      {/* Achtergrond blobs — gespiegeld t.o.v. Login */}
      <motion.div
        animate={{ scale: [1, 1.18, 1], opacity: [0.07, 0.13, 0.07] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute -left-24 -top-24 w-80 h-80 bg-[#d4e84a] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.22, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className="absolute -right-28 -bottom-20 w-72 h-72 bg-[#d4e84a] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className="absolute right-1/3 top-16 w-28 h-28 bg-white rounded-full pointer-events-none"
      />

      {/* Roterende ringen — andere maten en richting dan Login */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(255,255,255,0.05)' }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{ border: '1px solid rgba(212,232,74,0.08)' }}
      />

      {/* Logo */}
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

      {/* Kaart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 32, delay: 0.14 }}
        className="w-full max-w-sm bg-white rounded-3xl p-7 z-10 relative"
        style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.28), 0 8px 24px rgba(0,0,0,0.12)' }}
      >
        {showBlocked ? (
          /* Geblokkeerd: geen of ongeldige stuurlink (US-04b / US-04c) */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.28 }}
            className="flex flex-col items-center text-center py-2"
          >
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
              <ShieldAlert className="w-7 h-7 text-red-400" />
            </div>
            <h1 className="text-2xl font-black text-[#1a3d2b] leading-tight tracking-tight mb-2">
              {linkError ? 'Ongeldige stuurlink' : 'Stuurlink vereist'}
            </h1>
            <p className="text-gray-400 text-xs leading-relaxed mb-6 max-w-[16rem]">
              {linkError
                ? linkError
                : 'Registreren kan alleen via een geldige stuurlink. Vraag je beheerder om een nieuwe uitnodiging.'}
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/login')}
              className="w-full bg-[#1a3d2b] text-[#d4e84a] rounded-2xl py-3.5 text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2"
            >
              Naar inloggen
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        ) : (
         <>
        {/* Kaart heading */}
        <div className="mb-6">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
            className="text-[#1a3d2b]/40 text-xs font-bold uppercase tracking-widest mb-2"
          >
            Nieuw account
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.32 }}
            className="text-3xl font-black text-[#1a3d2b] leading-none tracking-tight"
          >
            Maak een<br />account.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.42 }}
            className="text-gray-400 text-xs mt-2.5"
          >
            Vul je gegevens in om te beginnen
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Naam */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.44 }}
            className="flex flex-col gap-1.5"
          >
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Naam</label>
            <motion.div
              animate={{
                boxShadow: focusedField === 'naam'
                  ? '0 0 0 2px #1a3d2b, 0 4px 12px rgba(26,61,43,0.1)'
                  : '0 0 0 1.5px #e5e7eb',
              }}
              transition={{ duration: 0.18 }}
              className="relative bg-gray-50 rounded-2xl overflow-hidden"
            >
              <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'naam' ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                onFocus={() => setFocusedField('naam')}
                onBlur={() => setFocusedField(null)}
                placeholder="Jouw volledige naam"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3.5 text-sm text-[#1a3d2b] bg-transparent outline-none placeholder:text-gray-300 disabled:opacity-50"
              />
            </motion.div>
          </motion.div>

          {/* E-mail */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.50 }}
            className="flex flex-col gap-1.5"
          >
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">E-mailadres</label>
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

          {/* Wachtwoord + sterkte */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.56 }}
            className="flex flex-col gap-1.5"
          >
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Wachtwoord</label>
            <motion.div
              animate={{
                boxShadow: focusedField === 'pw'
                  ? '0 0 0 2px #1a3d2b, 0 4px 12px rgba(26,61,43,0.1)'
                  : '0 0 0 1.5px #e5e7eb',
              }}
              transition={{ duration: 0.18 }}
              className="relative bg-gray-50 rounded-2xl overflow-hidden"
            >
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'pw' ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
              <input
                type={toonWachtwoord ? 'text' : 'password'}
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                onFocus={() => setFocusedField('pw')}
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

            {/* Wachtwoord sterkte-balk */}
            {wachtwoord.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-0.5"
              >
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map((level) => (
                    <div key={level} className="h-[3px] flex-1 rounded-full bg-gray-100 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${pwStrength >= level ? pwMeta.color : ''}`}
                        initial={{ width: '0%' }}
                        animate={{ width: pwStrength >= level ? '100%' : '0%' }}
                        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 font-medium w-11 text-right tabular-nums">
                  {pwMeta.label}
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Herhaal wachtwoord */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.62 }}
            className="flex flex-col gap-1.5"
          >
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Herhaal wachtwoord</label>
            <motion.div
              animate={{
                boxShadow: focusedField === 'herhaal'
                  ? '0 0 0 2px #1a3d2b, 0 4px 12px rgba(26,61,43,0.1)'
                  : '0 0 0 1.5px #e5e7eb',
              }}
              transition={{ duration: 0.18 }}
              className="relative bg-gray-50 rounded-2xl overflow-hidden"
            >
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focusedField === 'herhaal' ? 'text-[#1a3d2b]' : 'text-gray-300'}`} />
              <input
                type={toonHerhaal ? 'text' : 'password'}
                value={wachtwoordHerhaal}
                onChange={(e) => setWachtwoordHerhaal(e.target.value)}
                onFocus={() => setFocusedField('herhaal')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3.5 text-sm text-[#1a3d2b] bg-transparent outline-none placeholder:text-gray-300 disabled:opacity-50"
              />
              <motion.button
                type="button"
                whileTap={{ scale: 0.88 }}
                onClick={() => setToonHerhaal(!toonHerhaal)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#1a3d2b] transition-colors"
              >
                <AnimatePresence mode="wait">
                  {toonHerhaal ? (
                    <motion.div key="hide2" initial={{ opacity: 0, rotate: -10 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 10 }}>
                      <EyeOff className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="show2" initial={{ opacity: 0, rotate: 10 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -10 }}>
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
            transition={{ type: 'spring', stiffness: 200, damping: 38, delay: 0.68 }}
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
                    Account aanmaken...
                  </motion.div>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-2"
                  >
                    Account aanmaken
                    <ArrowRight className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>

          {/* Login link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.76 }}
            className="text-xs text-center text-gray-400 pt-1"
          >
            Al een account?{' '}
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="text-[#1a3d2b] font-bold cursor-pointer hover:underline underline-offset-2"
            >
              Inloggen
            </motion.span>
          </motion.p>

        </form>
         </>
        )}
      </motion.div>

      {/* Radiale transitie-overlay naar Login, identiek aan Login → Home */}
      <AnimatePresence>
        {registered && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 62%)' }}
            animate={{ clipPath: 'circle(160% at 50% 62%)' }}
            transition={{ duration: 0.75, ease: [0.32, 0, 0.16, 1] }}
            onAnimationComplete={() => navigate('/login')}
            className="fixed inset-0 bg-[#1a3d2b] z-50"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Register
