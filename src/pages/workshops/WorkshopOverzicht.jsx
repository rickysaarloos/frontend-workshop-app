import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'

const mockWorkshops = [
  { id: 1, titel: 'Workshop Lassen', beschrijving: 'Leer de basis van het lassen met professioneel materiaal.', datum: '2026-06-10', tijd: '09:00 - 12:00', locatie: 'Lokaal B203', capaciteit: 15, ingeschreven: 11 },
  { id: 2, titel: 'Workshop 3D Printen', beschrijving: 'Ontwerp en print je eigen 3D model.', datum: '2026-06-10', tijd: '13:00 - 16:00', locatie: 'Medialab A101', capaciteit: 10, ingeschreven: 10 },
  { id: 3, titel: 'Workshop Elektrotechniek', beschrijving: 'Van schakelschema tot werkend circuit.', datum: '2026-06-12', tijd: '10:00 - 13:00', locatie: 'Practicum C105', capaciteit: 12, ingeschreven: 5 },
  { id: 4, titel: 'Workshop CNC Frezen', beschrijving: 'Werken met CNC freesmachines in de praktijk.', datum: '2026-06-15', tijd: '09:00 - 12:00', locatie: 'Werkplaats D01', capaciteit: 8, ingeschreven: 3 },
  { id: 5, titel: 'Workshop Robotica', beschrijving: 'Programmeer en bouw je eigen kleine robot.', datum: '2026-06-17', tijd: '13:00 - 17:00', locatie: 'Lab B105', capaciteit: 10, ingeschreven: 8 },
  { id: 6, titel: 'Workshop Houtbewerking', beschrijving: 'Maak kennis met de houtbewerkingsmachines van TCR.', datum: '2026-06-20', tijd: '09:00 - 12:00', locatie: 'Werkplaats E02', capaciteit: 12, ingeschreven: 6 },
]

const MAANDEN = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']
const DAGEN_KORT = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

function getKalenderDagen(jaar, maand) {
  const eerstedag = new Date(jaar, maand, 1)
  const aantalDagen = new Date(jaar, maand + 1, 0).getDate()
  let startOffset = eerstedag.getDay() - 1
  if (startOffset < 0) startOffset = 6
  const dagen = []
  for (let i = 0; i < startOffset; i++) dagen.push(null)
  for (let i = 1; i <= aantalDagen; i++) dagen.push(i)
  return dagen
}

function WorkshopOverzicht() {
  const navigate = useNavigate()
  const vandaag = new Date()

  const [jaar, setJaar] = useState(vandaag.getFullYear())
  const [maand, setMaand] = useState(vandaag.getMonth())
  const [geselecteerdeDag, setGeselecteerdeDag] = useState(null)

  const kalenderDagen = getKalenderDagen(jaar, maand)
  const workshopDatums = new Set(mockWorkshops.map((w) => w.datum))

  const geselecteerdeDatum = geselecteerdeDag
    ? `${jaar}-${String(maand + 1).padStart(2, '0')}-${String(geselecteerdeDag).padStart(2, '0')}`
    : null

  const zichtbareWorkshops = geselecteerdeDatum
    ? mockWorkshops.filter((w) => w.datum === geselecteerdeDatum)
    : mockWorkshops

  function vorigemMaand() {
    if (maand === 0) { setMaand(11); setJaar(j => j - 1) }
    else setMaand(m => m - 1)
    setGeselecteerdeDag(null)
  }

  function volgendeMaand() {
    if (maand === 11) { setMaand(0); setJaar(j => j + 1) }
    else setMaand(m => m + 1)
    setGeselecteerdeDag(null)
  }

  function formatDatum(datum) {
    return new Date(datum).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })
  }

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
          <h1 className="text-3xl font-black text-white tracking-tight leading-none">Workshops</h1>

        </motion.div>
      </div>

      {/* Witte content sectie */}
      <div className="flex-1 bg-gray-50 rounded-t-[2rem] px-5 pt-6 pb-8">

        {/* Hoofd layout — kalender + lijst naast elkaar */}
        <div className="max-w-5xl mx-auto flex gap-5 items-start">

          {/* Kalender */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 w-64 shrink-0"
          >
            {/* Maand navigatie */}
            <div className="flex items-center justify-between mb-4">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={vorigemMaand} className="p-1.5 rounded-xl hover:bg-gray-50 text-gray-300 hover:text-[#1a3d2b] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <span className="text-xs font-bold text-[#1a3d2b]">{MAANDEN[maand]} {jaar}</span>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={volgendeMaand} className="p-1.5 rounded-xl hover:bg-gray-50 text-gray-300 hover:text-[#1a3d2b] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Dag headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAGEN_KORT.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-gray-300 py-1">{d}</div>
              ))}
            </div>

            {/* Kalender dagen */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {kalenderDagen.map((dag, index) => {
                if (!dag) return <div key={`leeg-${index}`} />
                const datumStr = `${jaar}-${String(maand + 1).padStart(2, '0')}-${String(dag).padStart(2, '0')}`
                const heeftWorkshop = workshopDatums.has(datumStr)
                const isGeselecteerd = geselecteerdeDag === dag
                const isVandaag = dag === vandaag.getDate() && maand === vandaag.getMonth() && jaar === vandaag.getFullYear()

                return (
                  <motion.button
                    key={dag}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setGeselecteerdeDag(isGeselecteerd ? null : dag)}
                    className={`relative flex items-center justify-center rounded-xl text-[11px] font-medium transition-all duration-150 mx-auto w-7 h-7
                      ${isGeselecteerd ? 'bg-[#1a3d2b] text-[#d4e84a] font-bold shadow-md'
                        : isVandaag ? 'bg-[#d4e84a] text-[#1a3d2b] font-bold'
                        : heeftWorkshop ? 'text-[#1a3d2b] hover:bg-[#eaf3de]'
                        : 'text-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    {dag}
                    {heeftWorkshop && !isGeselecteerd && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1a3d2b]" />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Legenda */}
            <div className="mt-4 pt-3 border-t border-gray-50 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1a3d2b] shrink-0" />
                Workshop
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="w-5 h-4 rounded-md bg-[#d4e84a] shrink-0" />
                Vandaag
              </div>
              {geselecteerdeDag && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setGeselecteerdeDag(null)}
                  className="mt-1 text-xs text-[#1a3d2b] font-bold hover:underline underline-offset-2 text-left"
                >
                  ✕ Filter wissen
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Workshop lijst */}
          <div className="flex-1 flex flex-col gap-3">

            {/* Label */}
            <AnimatePresence mode="wait">
              <motion.p
                key={geselecteerdeDag || 'alle'}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-bold text-gray-400 uppercase tracking-widest"
              >
                {geselecteerdeDag
                  ? `Workshops op ${formatDatum(`${jaar}-${String(maand + 1).padStart(2, '0')}-${String(geselecteerdeDag).padStart(2, '0')}`)}`
                  : `Alle workshops (${mockWorkshops.length})`
                }
              </motion.p>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={geselecteerdeDag || 'alle'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {zichtbareWorkshops.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center">
                    <p className="text-sm text-gray-400">Geen workshops op deze dag</p>
                    <button onClick={() => setGeselecteerdeDag(null)} className="mt-2 text-xs text-[#1a3d2b] font-bold hover:underline">
                      Alle workshops tonen
                    </button>
                  </div>
                ) : (
                  zichtbareWorkshops.map((workshop, index) => {
                    const isVol = workshop.ingeschreven >= workshop.capaciteit
                    const procentVol = Math.round((workshop.ingeschreven / workshop.capaciteit) * 100)

                    return (
                      <motion.div
                        key={workshop.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.06 }}
                        whileHover={{ scale: 1.01, boxShadow: '0 4px 16px rgba(26,61,43,0.08)' }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => navigate(`/workshops/${workshop.id}`)}
                        className="bg-white rounded-3xl border border-gray-100 p-5 cursor-pointer transition-all duration-150"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icoon */}
                          <div className={`p-2.5 rounded-2xl shrink-0 ${isVol ? 'bg-red-50' : 'bg-[#eaf3de]'}`}>
                            <BookOpen className={`w-4 h-4 ${isVol ? 'text-red-400' : 'text-[#1a3d2b]'}`} />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h2 className="text-sm font-bold text-[#1a3d2b]">{workshop.titel}</h2>
                              {isVol && (
                                <span className="bg-red-50 text-red-400 text-xs font-bold px-2 py-0.5 rounded-lg border border-red-100">vol</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mb-3 leading-relaxed">{workshop.beschrijving}</p>

                            <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
                              <span>📅 <span className="capitalize">{formatDatum(workshop.datum)}</span></span>
                              <span>🕐 {workshop.tijd}</span>
                              <span>📍 {workshop.locatie}</span>
                            </div>

                            {/* Voortgangsbalk */}
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-100 rounded-full h-1">
                                <div
                                  className={`h-1 rounded-full transition-all ${isVol ? 'bg-red-300' : 'bg-[#1a3d2b]'}`}
                                  style={{ width: `${procentVol}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold shrink-0 ${isVol ? 'text-red-400' : 'text-[#1a3d2b]'}`}>
                                {workshop.ingeschreven}/{workshop.capaciteit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkshopOverzicht