import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'

/**
 * Registreer pagina voor de Workshop app van TCR.
 * Bevat een formulier met naam, e-mailadres en wachtwoord.
 * Na succesvolle registratie wordt de gebruiker doorgestuurd naar de loginpagina.
 *
 * @returns {JSX.Element} De registreer pagina
 */
function Register() {

  /**
   * De naam die de gebruiker invult.
   * @type {string}
   */
  const [naam, setNaam] = useState('')

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
   * Het herhaalde wachtwoord ter bevestiging.
   * Later gebruiken we dit om te checken of beide wachtwoorden overeenkomen.
   * @type {string}
   */
  const [wachtwoordHerhaal, setWachtwoordHerhaal] = useState('')

  /**
   * Navigatie functie om naar andere pagina's te gaan.
   * Gebruikt React Router.
   */
  const navigate = useNavigate()

  /**
   * Verwerkt het registratieformulier als de gebruiker op "Account aanmaken" klikt.
   * Voorkomt dat de pagina herlaadt met e.preventDefault().
   * Later wordt dit vervangen met een echte API call naar de backend.
   *
   * @param {React.FormEvent} e - Het submit event van het formulier
   */
  function handleSubmit(e) {
    e.preventDefault()
    console.log('registreren met:', naam, email, wachtwoord)
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

      {/* Gecentreerde registreer kaart met Framer Motion animatie */}
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
          className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 shadow-sm"
        >
          <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Account aanmaken</h1>
          <p className="text-sm text-gray-500 mb-6">Workshop app TCR</p>

          {/* Formulier — roept handleSubmit aan bij verzenden */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Naam veld */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Naam</label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                placeholder="Jouw naam"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
              />
            </div>

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

            {/* Wachtwoord herhalen veld — wordt later vergeleken met wachtwoord */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Wachtwoord herhalen</label>
              <input
                type="password"
                value={wachtwoordHerhaal}
                onChange={(e) => setWachtwoordHerhaal(e.target.value)}
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
              Account aanmaken →
            </motion.button>

            {/* Link naar de loginpagina */}
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