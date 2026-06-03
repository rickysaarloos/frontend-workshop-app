import { motion } from 'motion/react'

function Footer() {
  return (
    <footer className="bg-[#1a3d2b] relative overflow-hidden">

      {/* Decoratieve blob rechtsonder */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.06, 0.1, 0.06] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-16 -bottom-16 w-48 h-48 bg-[#d4e84a] rounded-full pointer-events-none"
      />

      {/* Subtiele scheidingslijn */}
      <div className="w-full h-px bg-white/10" />

      <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap relative z-10">

        {/* Logo + naam */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="flex items-center gap-3 cursor-default"
        >
          <img
            src="/img/techniek-college-rotterdam2.jpg"
            alt="Techniek College Rotterdam"
            className="h-8 w-auto object-contain rounded"
          />
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-xs tracking-tight">Techniek College</span>
            <span className="text-white/50 font-medium text-xs tracking-tight">Rotterdam</span>
          </div>
        </motion.div>
        

        {/* Links + copyright */}
        <div className="flex items-center gap-5">
          {['Privacy', 'Cookies'].map((label) => (
            <motion.span
              key={label}
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="text-white/30 text-xs font-medium hover:text-[#d4e84a] cursor-pointer transition-colors duration-200"
            >
              {label}
            </motion.span>
          ))}
          <span className="w-px h-3 bg-white/15 rounded-full" />
          <span className="text-white/20 text-xs">© {new Date().getFullYear()} TCR</span>
        </div>

      </div>
    </footer>
  )
}

export default Footer
