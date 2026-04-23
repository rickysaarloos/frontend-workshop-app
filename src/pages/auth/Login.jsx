import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

/**
 * Login pagina voor de Workshop app van TCR.
 * Bevat een formulier met e-mailadres en wachtwoord.
 * Na succesvolle login wordt de gebruiker doorgestuurd naar de homepagina.
 * 
 * @returns {JSX.Element} De login pagina
 */
function Login() {

  /**
   * Het e-mailadres dat de gebruiker invult.
   * @type {string}
   */
  const [email, setEmail] = useState('')

  /**
   * Het wachtwoord dat de gebruiker invult.
   * @type {string}
   */
  const [wachtwoord, setWachtwoord] = useState('')

  /**
   * Navigatie functie om naar andere pagina's te gaan.
   * Gebruikt React Router.
   */
  const navigate = useNavigate()

  /**
   * Verwerkt het inlogformulier als de gebruiker op "Inloggen" klikt.
   * Voorkomt dat de pagina herlaadt met e.preventDefault().
   * Later wordt dit vervangen met een echte API call naar de backend.
   * 
   * @param {React.FormEvent} e - Het submit event van het formulier
   */
  function handleSubmit(e) {
    e.preventDefault()
    console.log('inloggen met:', email, wachtwoord)
  }

  return ( 
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header met TCR logo tekst */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-[#1a3d2b] font-bold text-sm">Techniek</span>
          <span className="text-[#1a3d2b] font-bold text-sm">College</span>
          <span className="text-[#1a3d2b] font-bold text-sm">Rotterdam</span>
        </div>
      </header>

      {/* Gecentreerde login kaart met Framer Motion animatie */}
      <div className="flex-1 flex items-center justify-center px-4">

        {/*
         * motion.div animeert de kaart bij het laden:
         * - start onzichtbaar (opacity 0) en 20px naar beneden (y: 20)
         * - animeert naar volledig zichtbaar op de juiste positie
         * - duurt 0.4 seconden
         */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Inloggen</h1>
          <p className="text-sm text-gray-500 mb-6">Workshop app TCR</p>

          {/* Formulier — roept handleSubmit aan bij verzenden */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* E-mailadres veld */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@tcrmbo.nl"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
              />
            </div>

            {/* Wachtwoord veld */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Wachtwoord</label>
              <input
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                placeholder="••••••••"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
              />
            </div>

            {/*
             * Submit knop met Framer Motion animaties:
             * - whileHover: schaalt 2% groter bij hover
             * - whileTap: schaalt 2% kleiner bij klikken
             */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-[#d4e84a] text-[#1a3d2b] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#c8dc3e] transition-colors mt-2 flex items-center justify-center gap-2"
            >
              Inloggen →
            </motion.button>

            {/* Link naar de registreerpagina */}
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