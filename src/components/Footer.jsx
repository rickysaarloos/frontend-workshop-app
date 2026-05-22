import { useNavigate } from 'react-router-dom'
import { BookOpen, CalendarDays, User, ArrowRight } from 'lucide-react'

/**
 * Footer component voor de Workshop app van TCR.
 * Geïnspireerd op de officiële TCR website footer.
 *
 * @returns {JSX.Element}
 */
function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#1a3d2b] mt-auto">

      {/* Hoofd footer inhoud */}
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 gap-8 sm:grid-cols-3">

        {/* Kolom 1 — Logo en omschrijving */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#d4e84a] rounded-lg flex items-center justify-center shrink-0">
              <span className="text-[#1a3d2b] font-black text-sm">T</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-sm">Techniek College</span>
              <span className="text-white/40 text-xs">Rotterdam</span>
            </div>
          </div>
          <p className="text-white/40 text-xs leading-relaxed">
            De Workshop app van Techniek College Rotterdam. Schrijf je in voor workshops en bekijk aankomende evenementen.
          </p>
        </div>

        {/* Kolom 2 — Navigatie */}
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-xs uppercase tracking-widest mb-1">Navigatie</p>
          {[
            { label: 'Workshops', path: '/workshops', icon: BookOpen },
            { label: 'Events', path: '/events', icon: CalendarDays },
            { label: 'Mijn profiel', path: '/profiel', icon: User },
          ].map(({ label, path, icon: Icon }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-medium group"
            >
              <ArrowRight className="w-3 h-3 text-[#d4e84a] group-hover:translate-x-0.5 transition-transform" />
              {label}
            </button>
          ))}
        </div>

        {/* Kolom 3 — Contact */}
        <div className="flex flex-col gap-3">
          <p className="text-white font-bold text-xs uppercase tracking-widest mb-1">Contact</p>
          <p className="text-white/40 text-xs leading-relaxed">
            Techniek College Rotterdam<br />
            Postbus 6002<br />
            3002 AA Rotterdam
          </p>
          <a
            href="https://www.techniekcollegerotterdam.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#d4e84a] text-xs font-semibold hover:underline underline-offset-2 mt-1"
          >
            <ArrowRight className="w-3 h-3" />
            techniekcollegerotterdam.nl
          </a>
        </div>

      </div>

      {/* Onderste balk */}
      <div className="border-t border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} Techniek College Rotterdam
          </p>
          <div className="flex items-center gap-4">
            <span className="text-white/30 text-xs hover:text-white/60 cursor-pointer transition-colors">Privacy</span>
            <span className="text-white/30 text-xs hover:text-white/60 cursor-pointer transition-colors">Cookies</span>
            <span className="text-white/30 text-xs hover:text-white/60 cursor-pointer transition-colors">Toegankelijkheid</span>
          </div>
        </div>
      </div>

    </footer>
  )
}

export default Footer