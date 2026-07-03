import { motion } from 'motion/react'

function Footer() {
  const jaar = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-[#1a3d2b]">

      {/* Statische, rustige gloed (geen perpetuele puls) */}
      <div className="pointer-events-none absolute -right-24 -bottom-28 h-64 w-64 rounded-full bg-[#d4e84a]/[0.06] blur-2xl" />

      {/* Haarlijn scheiding */}
      <div className="h-px w-full bg-white/10" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">

        {/* Logo + naam */}
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 26 }}
          className="flex items-center gap-3"
        >
          <img
            src="/img/techniek-college-rotterdam2.jpg"
            alt="Techniek College Rotterdam"
            className="h-8 w-auto rounded object-contain"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-tight text-white">Techniek College</span>
            <span className="text-xs font-medium tracking-wide text-white/45">Rotterdam</span>
          </div>
        </motion.div>

        {/* Links + copyright */}
        <div className="flex items-center gap-6">
          {['Privacy', 'Cookies'].map((label) => (
            <motion.span
              key={label}
              whileHover={{ y: -1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="cursor-pointer text-xs font-medium text-white/45 transition-colors duration-200 hover:text-[#d4e84a]"
            >
              {label}
            </motion.span>
          ))}
          <span className="h-3 w-px rounded-full bg-white/15" />
          <span className="text-xs tabular-nums text-white/30">© {jaar} TCR</span>
        </div>

      </div>
    </footer>
  )
}

export default Footer
