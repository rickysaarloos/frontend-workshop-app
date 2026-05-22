/**
 * Footer component voor de Workshop app van TCR.
 *
 * @returns {JSX.Element}
 */
function Footer() {
  return (
    <footer className="bg-[#1a3d2b] px-6 py-5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#d4e84a] rounded-md flex items-center justify-center shrink-0">
            <span className="text-[#1a3d2b] font-black text-xs">T</span>
          </div>
          <span className="text-white/50 text-xs">Techniek College Rotterdam</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-xs hover:text-white/60 cursor-pointer transition-colors">Privacy</span>
          <span className="text-white/30 text-xs hover:text-white/60 cursor-pointer transition-colors">Cookies</span>
          <span className="text-white/30 text-xs">© {new Date().getFullYear()}</span>
        </div>

      </div>
    </footer>
  )
}

export default Footer