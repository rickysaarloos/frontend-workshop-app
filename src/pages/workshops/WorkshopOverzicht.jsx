import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { workshops } from '@/lib/mockData'

/**
 * De beschikbare dagen als filter tabs.
 * @type {string[]}
 */
const dagen = ['maandag', 'dinsdag', 'woensdag']

/**
 * Workshop overzichtspagina.
 * Toont alle workshops gefilterd op dag.
 * Workshops die vol zijn krijgen een "vol" badge.
 *
 * @returns {JSX.Element}
 */
function WorkshopOverzicht() {
  /**
   * De actief geselecteerde dag in de filter tabs.
   * @type {string}
   */
  const [activeDag, setActiveDag] = useState('maandag')

  const navigate = useNavigate()

  /**
   * Filtert workshops op de geselecteerde dag.
   * @type {Array}
   */
  const gefilterd = workshops.filter((w) => w.dag === activeDag)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-[#1a3d2b] font-bold text-sm">Techniek</span>
          <span className="text-[#1a3d2b] font-bold text-sm">College</span>
          <span className="text-[#1a3d2b] font-bold text-sm">Rotterdam</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto w-full px-4 py-8">

        <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Workshops</h1>
        <p className="text-sm text-gray-500 mb-6">Kies een workshop om je voor in te schrijven</p>

        {/* Dag filter tabs */}
        <div className="flex gap-2 mb-6">
          {dagen.map((dag) => (
            <button
              key={dag}
              onClick={() => setActiveDag(dag)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize
                ${activeDag === dag
                  ? 'bg-[#1a3d2b] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1a3d2b]'
                }`}
            >
              {dag}
            </button>
          ))}
        </div>

        {/* Workshop kaarten */}
        <div className="flex flex-col gap-4">
          {gefilterd.map((workshop, index) => {

            /** Is de workshop vol? */
            const isVol = workshop.ingeschreven >= workshop.capaciteit

            return (
              <motion.div
                key={workshop.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08 }}
                onClick={() => navigate(`/workshops/${workshop.id}`)}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-pointer hover:border-[#1a3d2b] transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-[#1a3d2b] mb-1">{workshop.titel}</h2>
                    <p className="text-sm text-gray-500 mb-3">{workshop.beschrijving}</p>

                    <div className="flex gap-4 text-xs text-gray-400">
                      <span>🕐 {workshop.tijd}</span>
                      <span>📍 {workshop.locatie}</span>
                    </div>
                  </div>

                  {/* Capaciteit badge */}
                  <div className="flex-shrink-0">
                    {isVol ? (
                      <span className="bg-red-100 text-red-600 text-xs font-medium px-3 py-1 rounded-full">
                        vol
                      </span>
                    ) : (
                      <span className="bg-[#eaf3de] text-[#1a3d2b] text-xs font-medium px-3 py-1 rounded-full">
                        {workshop.ingeschreven} / {workshop.capaciteit}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Geen workshops voor deze dag */}
          {gefilterd.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-12">
              Geen workshops op {activeDag}
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default WorkshopOverzicht