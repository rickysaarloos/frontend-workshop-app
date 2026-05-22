import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, CalendarDays, Clock, MapPin, ArrowRight, Search, X } from 'lucide-react'
import Footer from '@/components/Footer'

const mockEvents = [
  {
    id: 1,
    titel: 'Studiedag Techniek 2026',
    beschrijving: 'De jaarlijkse studiedag voor alle techniek studenten van TCR.',
    datum: '2026-06-10',
    tijd: '09:00 - 17:00',
    locatie: 'TCR Hoofdgebouw, Rotterdam',
    categorie: 'Studiedag',
  },
  {
    id: 2,
    titel: 'Open Dag TCR',
    beschrijving: 'Kom kijken bij Techniek College Rotterdam en ontdek alle opleidingen.',
    datum: '2026-06-20',
    tijd: '10:00 - 15:00',
    locatie: 'TCR Campus, Rotterdam',
    categorie: 'Open dag',
  },
  {
    id: 3,
    titel: 'Gastcollege Bouwkunde',
    beschrijving: 'Een inspirerend gastcollege door een architect van een bekend bureau.',
    datum: '2026-07-05',
    tijd: '13:00 - 15:00',
    locatie: 'Aula TCR, Zaal 1',
    categorie: 'Gastcollege',
  },
  {
    id: 4,
    titel: 'Innovatie Expo',
    beschrijving: 'Studenten presenteren hun innovatieve projecten aan bedrijven en docenten.',
    datum: '2026-07-15',
    tijd: '11:00 - 16:00',
    locatie: 'Sporthal TCR, Rotterdam',
    categorie: 'Expo',
  },
]

const categorieen = ['Alle', 'Studiedag', 'Open dag', 'Gastcollege', 'Expo']

function EventOverzicht() {
  const navigate = useNavigate()
  const [zoekterm, setZoekterm] = useState('')
  const [actieveCategorie, setActieveCategorie] = useState('Alle')

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', {
      weekday: 'short', day: 'numeric', month: 'long',
    })
  }

  function getDagenTot(datum) {
    const verschil = new Date(datum) - new Date()
    return Math.ceil(verschil / (1000 * 60 * 60 * 24))
  }

  const gefilterd = mockEvents.filter((e) => {
    const matchZoek = e.titel.toLowerCase().includes(zoekterm.toLowerCase())
    const matchCategorie = actieveCategorie === 'Alle' || e.categorie === actieveCategorie
    return matchZoek && matchCategorie
  })

  return (
    <div className="min-h-screen bg-[#1a3d2b] flex flex-col">

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 py-5 flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/home')}
          className="text-white/40 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
        <div className="w-7 h-7 bg-[#d4e84a] rounded-lg flex items-center justify-center">
          <span className="text-[#1a3d2b] font-black text-xs">T</span>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-white font-bold text-xs tracking-tight">Techniek College</span>
          <span className="text-white/40 text-xs">Rotterdam</span>
        </div>
      </motion.header>

      {/* Hero */}
      <div className="px-6 pt-2 pb-8 relative overflow-hidden">
        <div className="absolute -right-16 -top-8 w-56 h-56 bg-[#d4e84a]/5 rounded-full pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="text-[#d4e84a] text-xs font-bold uppercase tracking-widest mb-2">Agenda</p>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Events</h1>
          <p className="text-white/40 text-sm mt-2">{mockEvents.length} aankomende evenementen</p>
        </motion.div>

        {/* Zoekbalk */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative mt-5"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={zoekterm}
            onChange={(e) => setZoekterm(e.target.value)}
            placeholder="Zoek een event..."
            className="w-full bg-white/10 border border-white/10 rounded-2xl pl-11 pr-10 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-[#d4e84a]/50 focus:bg-white/15 transition-all"
          />
          {zoekterm && (
            <button onClick={() => setZoekterm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </div>

      {/* Witte content sectie */}
      <div className="flex-1 bg-gray-50 rounded-t-[2rem] px-5 pt-6 pb-8 flex flex-col gap-4">

        {/* Categorie filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {categorieen.map((cat) => (
            <motion.button
              key={cat}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActieveCategorie(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                actieveCategorie === cat
                  ? 'bg-[#1a3d2b] text-[#d4e84a] shadow-sm'
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-[#1a3d2b]/30'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {/* Resultaat label */}
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {gefilterd.length} {gefilterd.length === 1 ? 'event' : 'events'} gevonden
        </p>

        {/* Events lijst */}
        <AnimatePresence mode="wait">
          <motion.div
            key={actieveCategorie + zoekterm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3"
          >
            {gefilterd.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
                <p className="text-sm text-gray-400">Geen events gevonden</p>
                <button onClick={() => { setZoekterm(''); setActieveCategorie('Alle') }} className="mt-2 text-xs text-[#1a3d2b] font-semibold hover:underline">
                  Filter wissen
                </button>
              </div>
            ) : (
              gefilterd.map((event, index) => {
                const dagenTot = getDagenTot(event.datum)
                const isSnel = dagenTot <= 14

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.06 }}
                    whileHover={{ scale: 1.01, boxShadow: '0 4px 20px rgba(26,61,43,0.08)' }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate(`/events/${event.id}`)}
                    className="bg-white rounded-3xl border border-gray-100 p-5 cursor-pointer transition-all duration-150"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">

                        {/* Categorie + snel badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-[#eaf3de] text-[#1a3d2b] text-xs font-bold px-2.5 py-0.5 rounded-lg">
                            {event.categorie}
                          </span>
                          {isSnel && (
                            <span className="bg-[#d4e84a] text-[#1a3d2b] text-xs font-bold px-2.5 py-0.5 rounded-lg">
                              Bijna!
                            </span>
                          )}
                        </div>

                        <h2 className="text-sm font-bold text-[#1a3d2b] mb-1.5">{event.titel}</h2>
                        <p className="text-xs text-gray-400 leading-relaxed mb-3">{event.beschrijving}</p>

                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <CalendarDays className="w-3.5 h-3.5 text-[#1a3d2b] shrink-0" />
                            <span className="capitalize">{formatDatum(event.datum)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5 text-[#1a3d2b] shrink-0" />
                            <span>{event.tijd}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin className="w-3.5 h-3.5 text-[#1a3d2b] shrink-0" />
                            <span>{event.locatie}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-lg font-black text-[#1a3d2b] leading-none">{dagenTot}</p>
                          <p className="text-xs text-gray-400">dagen</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </AnimatePresence>
        <Footer />
      </div>
    </div>
  )
}

export default EventOverzicht