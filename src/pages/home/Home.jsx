import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarDays, BookOpen, User } from 'lucide-react'

/**
 * Home / Dashboard pagina na het inloggen.
 * Toont een overzicht van de beschikbare secties.
 *
 * @returns {JSX.Element}
 */
function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex flex-col leading-tight">
          <span className="text-[#1a3d2b] font-bold text-sm">Techniek</span>
          <span className="text-[#1a3d2b] font-bold text-sm">College</span>
          <span className="text-[#1a3d2b] font-bold text-sm">Rotterdam</span>
        </div>
        <span className="text-sm text-gray-500">Welkom terug!</span>
      </header>

      <div className="max-w-2xl mx-auto w-full px-4 py-8">

        <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Dashboard</h1>
        <p className="text-sm text-gray-500 mb-8">Wat wil je doen vandaag?</p>

        {/* Menu kaarten */}
        <div className="grid grid-cols-1 gap-4">

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => navigate('/workshops')}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-pointer hover:border-[#1a3d2b] transition-colors flex items-center gap-4"
          >
            <div className="bg-[#eaf3de] p-3 rounded-xl">
              <BookOpen className="w-5 h-5 text-[#1a3d2b]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1a3d2b]">Workshops</h2>
              <p className="text-xs text-gray-500">Bekijk en schrijf je in voor workshops</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => navigate('/events')}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-pointer hover:border-[#1a3d2b] transition-colors flex items-center gap-4"
          >
            <div className="bg-[#eaf3de] p-3 rounded-xl">
              <CalendarDays className="w-5 h-5 text-[#1a3d2b]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1a3d2b]">Events</h2>
              <p className="text-xs text-gray-500">Bekijk aankomende evenementen</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            onClick={() => navigate('/profiel')}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm cursor-pointer hover:border-[#1a3d2b] transition-colors flex items-center gap-4"
          >
            <div className="bg-[#eaf3de] p-3 rounded-xl">
              <User className="w-5 h-5 text-[#1a3d2b]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#1a3d2b]">Mijn profiel</h2>
              <p className="text-xs text-gray-500">Dieetwensen en persoonlijke gegevens</p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default Home