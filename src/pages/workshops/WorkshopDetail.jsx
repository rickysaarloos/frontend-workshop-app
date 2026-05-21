import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, Users, CheckCircle } from 'lucide-react'
import { toast, Toaster } from 'sonner'

// ============================================================
// MOCK DATA — later vervangen met API call
// 🔧 Vervang met: const workshop = await getWorkshop(id)
// ============================================================
const mockWorkshops = [
  {
    id: 1,
    titel: 'Workshop Lassen',
    beschrijving: 'In deze workshop leer je de basisvaardigheden van het lassen. Je werkt met professioneel materiaal en krijgt begeleiding van een ervaren docent. Geschikt voor beginners en gevorderden.',
    datum: '2026-06-10',
    tijd: '09:00 - 12:00',
    locatie: 'Lokaal B203',
    maxDeelnemers: 15,
    ingeschreven: 11,
    docent: 'Dhr. Verhoeven',
  },
  {
    id: 2,
    titel: 'Workshop 3D Printen',
    beschrijving: 'Ontdek de wereld van 3D printen. Je leert hoe je een model ontwerpt in software en dit vervolgens print op een van onze printers. Na afloop neem je jouw eigen print mee naar huis.',
    datum: '2026-06-12',
    tijd: '13:00 - 16:00',
    locatie: 'Medialab A101',
    maxDeelnemers: 10,
    ingeschreven: 10,
    docent: 'Mevr. Smits',
  },
  {
    id: 3,
    titel: 'Workshop Elektrotechniek',
    beschrijving: 'Leer de basis van elektrotechniek. Van het lezen van schakelschema\'s tot het bouwen van je eerste circuit. Een praktische workshop voor iedereen die meer wil weten over elektronica.',
    datum: '2026-06-15',
    tijd: '10:00 - 13:00',
    locatie: 'Practicum C105',
    maxDeelnemers: 12,
    ingeschreven: 5,
    docent: 'Dhr. De Jong',
  },
]
// ============================================================

/**
 * Workshop detail pagina voor de Workshop app van TCR.
 * Toont naam, beschrijving, datum, tijd, plekken en inschrijven knop.
 *
 * @returns {JSX.Element}
 */
function WorkshopDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // 🔧 MOCK — later vervangen met API call naar /api/workshops/{id}
  const workshop = mockWorkshops.find((w) => w.id === parseInt(id)) || mockWorkshops[0]

  const [ingeschreven, setIngeschreven] = useState(false)
  const [loading, setLoading] = useState(false)

  const plekkenOver = workshop.maxDeelnemers - workshop.ingeschreven
  const isVol = plekkenOver === 0

  /**
   * Schrijft de gebruiker in voor de workshop
   * 🔧 Later vervangen met: await inschrijven(id)
   */
  async function handleInschrijven() {
    if (ingeschreven) {
      toast.info('Je bent al ingeschreven voor deze workshop')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 800))
    setIngeschreven(true)
    toast.success('Je bent ingeschreven voor deze workshop!')
    setLoading(false)
  }

  /**
   * Formatteert een datum naar Nederlands formaat
   */
  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/workshops')}
          className="text-gray-400 hover:text-[#1a3d2b] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col leading-tight">
          <span className="text-[#1a3d2b] font-bold text-sm">Techniek</span>
          <span className="text-[#1a3d2b] font-bold text-sm">College</span>
          <span className="text-[#1a3d2b] font-bold text-sm">Rotterdam</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Titel en docent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">{workshop.titel}</h1>
              <p className="text-xs text-gray-500">Gegeven door {workshop.docent}</p>
            </div>
            {ingeschreven && (
              <div className="flex items-center gap-1 bg-[#eaf3de] text-[#1a3d2b] px-3 py-1.5 rounded-lg text-xs font-medium shrink-0">
                <CheckCircle className="w-3.5 h-3.5" />
                Ingeschreven
              </div>
            )}
          </div>
        </motion.div>

        {/* Info kaart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4"
        >

          <div className="flex items-center gap-3">
            <div className="bg-[#eaf3de] p-2.5 rounded-xl">
              <CalendarDays className="w-4 h-4 text-[#1a3d2b]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Datum</p>
              <p className="text-sm font-medium text-[#1a3d2b] capitalize">{formatDatum(workshop.datum)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#eaf3de] p-2.5 rounded-xl">
              <Clock className="w-4 h-4 text-[#1a3d2b]" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Tijd</p>
              <p className="text-sm font-medium text-[#1a3d2b]">{workshop.tijd}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isVol ? 'bg-red-50' : 'bg-[#eaf3de]'}`}>
              <Users className={`w-4 h-4 ${isVol ? 'text-red-400' : 'text-[#1a3d2b]'}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Beschikbare plekken</p>
              <p className={`text-sm font-medium ${isVol ? 'text-red-500' : 'text-[#1a3d2b]'}`}>
                {isVol ? 'Vol — geen plekken meer beschikbaar' : `${plekkenOver} van ${workshop.maxDeelnemers} plekken vrij`}
              </p>
            </div>
          </div>

          {/* Voortgangsbalk plekken */}
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full transition-all ${isVol ? 'bg-red-400' : 'bg-[#1a3d2b]'}`}
              style={{ width: `${(workshop.ingeschreven / workshop.maxDeelnemers) * 100}%` }}
            />
          </div>

        </motion.div>

        {/* Beschrijving */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <h2 className="text-sm font-semibold text-[#1a3d2b] mb-3">Over deze workshop</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{workshop.beschrijving}</p>
        </motion.div>

        {/* Inschrijven knop */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: loading || isVol || ingeschreven ? 1 : 1.02 }}
            whileTap={{ scale: loading || isVol || ingeschreven ? 1 : 0.98 }}
            onClick={handleInschrijven}
            disabled={loading || isVol || ingeschreven}
            className={`w-full rounded-2xl py-4 text-sm font-semibold transition-colors flex items-center justify-center gap-2
              ${ingeschreven
                ? 'bg-[#eaf3de] text-[#1a3d2b] cursor-default'
                : isVol
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#d4e84a] text-[#1a3d2b] hover:bg-[#c8dc3e]'
              } disabled:opacity-60`}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Inschrijven...
              </>
            ) : ingeschreven ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Ingeschreven
              </>
            ) : isVol ? (
              'Workshop is vol'
            ) : (
              'Inschrijven'
            )}
          </motion.button>
        </motion.div>

      </div>
    </div>
  )
}

export default WorkshopDetail