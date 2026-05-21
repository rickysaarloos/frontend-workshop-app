import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, MapPin, ChevronRight } from 'lucide-react'

// ============================================================
// MOCK DATA — later vervangen met API call
// 🔧 Vervang met: const events = await getEvents()
// ============================================================
const mockEvents = [
  {
    id: 1,
    titel: 'Studiedag Techniek 2026',
    beschrijving: 'De jaarlijkse studiedag voor alle techniek studenten van TCR.',
    datum: '2026-06-10',
    tijd: '09:00 - 17:00',
    locatie: 'TCR Hoofdgebouw, Rotterdam',
  },
  {
    id: 2,
    titel: 'Open Dag TCR',
    beschrijving: 'Kom kijken bij Techniek College Rotterdam en ontdek alle opleidingen.',
    datum: '2026-06-20',
    tijd: '10:00 - 15:00',
    locatie: 'TCR Campus, Rotterdam',
  },
  {
    id: 3,
    titel: 'Gastcollege Bouwkunde',
    beschrijving: 'Een inspirerend gastcollege door een architect van een bekend bureau.',
    datum: '2026-07-05',
    tijd: '13:00 - 15:00',
    locatie: 'Aula TCR, Zaal 1',
  },
  {
    id: 4,
    titel: 'Innovatie Expo',
    beschrijving: 'Studenten presenteren hun innovatieve projecten aan bedrijven en docenten.',
    datum: '2026-07-15',
    tijd: '11:00 - 16:00',
    locatie: 'Sporthal TCR, Rotterdam',
  },
]
// ============================================================

/**
 * Event overzicht pagina voor de Workshop app van TCR.
 * Toont een lijst van events met datum, tijd en locatie.
 *
 * @returns {JSX.Element}
 */
function EventOverzicht() {
  const navigate = useNavigate()

  /**
   * Formatteert een datum naar Nederlands formaat
   */
  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/Home')}
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

        <div>
          <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Events</h1>
          <p className="text-sm text-gray-500">Bekijk aankomende evenementen</p>
        </div>

        {/* Events lijst */}
        <div className="flex flex-col gap-4">
          {mockEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              onClick={() => navigate(`/events/${event.id}`)}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-pointer hover:border-[#1a3d2b] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-3 flex-1">

                  <h2 className="text-sm font-semibold text-[#1a3d2b]">{event.titel}</h2>
                  <p className="text-xs text-gray-500 leading-relaxed">{event.beschrijving}</p>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5 text-[#1a3d2b] shrink-0" />
                      <span className="capitalize">{formatDatum(event.datum)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3.5 h-3.5 text-[#1a3d2b] shrink-0" />
                      <span>{event.tijd}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-[#1a3d2b] shrink-0" />
                      <span>{event.locatie}</span>
                    </div>
                  </div>

                </div>

                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0 mt-1" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default EventOverzicht