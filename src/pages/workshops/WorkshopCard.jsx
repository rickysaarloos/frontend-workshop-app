import { motion } from 'motion/react'
import { BookOpen, MapPin, Clock, Calendar, Users, AlertTriangle, ClipboardList, Leaf } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1]

const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
}

// Datum/tijd komen als "YYYY-MM-DD HH:MM:SS" óf als null binnen.
// Session-mode workshops hebben geen start_date/end_date op workshop-niveau
// (die tijden zitten in de sessies), dus we lezen defensief uit i.p.v. .split op null.
const datumDeel = (s) => (typeof s === 'string' ? s.split(' ')[0] : '')
const tijdDeel = (s) => (typeof s === 'string' ? s.split(' ')[1] || '' : '')

function WorkshopCard({ workshop, navigate, formatDatum, dark }) {
  const d = dark
  const isVol = workshop.is_full
  const procentVol = workshop.capacity ? Math.round((workshop.registered / workshop.capacity) * 100) : 0

  const datum = datumDeel(workshop.start_date)
  const tijdStart = tijdDeel(workshop.start_date)
  const tijdEind = tijdDeel(workshop.end_date)

  const cardBg     = d ? 'bg-[#1c1c1e]'        : 'bg-white'
  const cardBorder = d ? 'border-white/[0.08]'  : 'border-black/[0.06]'
  const hairline   = d ? 'border-white/[0.07]'  : 'border-[#1a3d2b]/[0.07]'
  const titleClr   = d ? 'text-white'           : 'text-[#1a3d2b]'
  const subClr     = d ? 'text-white/70'        : 'text-[#1a3d2b]/70'
  const metaClr    = d ? 'text-white/70'        : 'text-[#1a3d2b]/70'
  const cardShadow = d ? 'shadow-[0_2px_20px_rgba(0,0,0,0.30)]' : 'shadow-[0_1px_2px_rgba(26,61,43,0.04),0_14px_30px_-18px_rgba(26,61,43,0.20)]'
  const barTrack   = d ? 'bg-white/10'          : 'bg-[#1a3d2b]/[0.08]'
  const barFill    = isVol ? 'bg-red-400' : (d ? 'bg-[#d4e84a]' : 'bg-[#1a3d2b]')
  const countClr   = isVol ? 'text-red-400' : titleClr
  const iconTile   = isVol
    ? (d ? 'bg-red-500/12 text-red-400' : 'bg-red-50 text-red-400')
    : (d ? 'bg-white/[0.06] text-[#d4e84a]' : 'bg-[#eaf3de] text-[#1a3d2b]')

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onClick={() => navigate(`/workshops/${workshop.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/workshops/${workshop.id}`) } }}
      className={`group ${cardBg} border ${cardBorder} ${cardShadow} cursor-pointer rounded-[26px] p-5 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]`}
    >
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${iconTile}`}>
          <BookOpen className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h2 className={`text-[15px] font-bold leading-snug tracking-[-0.01em] ${titleClr}`}>{workshop.title}</h2>
            <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              isVol
                ? (d ? 'bg-red-500/12 text-red-400' : 'bg-red-50 text-red-500')
                : (d ? 'bg-[#d4e84a]/12 text-[#d4e84a]' : 'bg-[#eaf3de] text-[#2c5a3d]')
            }`}>
              {isVol ? 'vol' : 'open'}
            </span>
          </div>

          <p className={`mt-1.5 line-clamp-2 text-[13px] leading-relaxed ${subClr}`}>{workshop.description}</p>

          {/* Meta-regel: één rustige inline rij i.p.v. losse chips.
              Datum/tijd alleen tonen als ze bekend zijn (session-mode kan ze leeg laten). */}
          <div className={`mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs ${metaClr}`}>
            {datum && (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 opacity-50" />
                <span className="capitalize">{formatDatum(datum)}</span>
              </span>
            )}
            {(tijdStart || tijdEind) && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <Clock className="h-3.5 w-3.5 opacity-50" />
                {tijdStart}{tijdEind ? ` - ${tijdEind}` : ''}
              </span>
            )}
            {workshop.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 opacity-50" />
                {workshop.location}
              </span>
            )}
          </div>

          {/* Capaciteit: instrument-stijl met haarlijn erboven */}
          <div className={`mt-3.5 flex items-center gap-3 border-t ${hairline} pt-3.5`}>
            <div className={`h-1 flex-1 overflow-hidden rounded-full ${barTrack}`}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${procentVol}%` }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
                className={`h-full rounded-full ${barFill}`}
              />
            </div>
            <span className={`flex shrink-0 items-center gap-1.5 text-xs font-bold tabular-nums ${countClr}`}>
              <Users className={`h-3.5 w-3.5 ${d ? 'text-white/25' : 'text-[#1a3d2b]/30'}`} />
              {workshop.registered}<span className={subClr}>/{workshop.capacity}</span>
            </span>
          </div>

          {/* Aandachtspunten */}
          {(workshop.important_notes || workshop.requirements || workshop.dietary_info || workshop.allergens) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {workshop.important_notes && (
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${d ? 'bg-amber-500/12 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Waarschuwing
                </span>
              )}
              {workshop.requirements && (Array.isArray(workshop.requirements) ? workshop.requirements.length > 0 : true) && (
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${d ? 'bg-white/[0.06] text-white/70' : 'bg-[#1a3d2b]/[0.05] text-[#1a3d2b]/65'}`}>
                  <ClipboardList className="h-2.5 w-2.5" />
                  Benodigdheden
                </span>
              )}
              {(workshop.dietary_info || workshop.allergens) && (
                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-semibold ${d ? 'bg-[#d4e84a]/10 text-[#d4e84a]/70' : 'bg-[#eaf3de] text-[#4a8c60]'}`}>
                  <Leaf className="h-2.5 w-2.5" />
                  Dieetinfo
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default WorkshopCard
