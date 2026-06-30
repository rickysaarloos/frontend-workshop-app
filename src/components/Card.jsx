// Double-bezel card (outer shell + inner core), gedeeld door Home, Profiel en
// WorkshopDetail.
//
// Stond eerder als inline-component bínnen elke pagina gedefinieerd. Daardoor
// kreeg Card bij elke render een nieuwe functie-referentie en zag React een
// "nieuw" componenttype: de hele subtree (inclusief formuliervelden) werd dan
// ge-remount, wat focusverlies veroorzaakte tijdens het typen. Op module-niveau
// is de referentie stabiel en blijft de subtree behouden.
//
// De dark/token-waarden komen via de `dark`-prop binnen; de kleur-tokens worden
// hier afgeleid zodat de aanroepende pagina ze niet meer hoeft door te geven.
function Card({ children, className = '', dark }) {
  const d = dark
  const shellBg     = d ? 'bg-white/[0.025]'    : 'bg-black/[0.018]'
  const shellBorder = d ? 'border-white/[0.07]' : 'border-black/[0.05]'
  const cardBg      = d ? 'bg-[#1c1c1e]'        : 'bg-white'
  const innerShadow = d ? 'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]' : 'shadow-sm'

  return (
    <div className={`${shellBg} border ${shellBorder} p-[5px] rounded-[32px] ${className}`}>
      <div className={`${cardBg} rounded-[27px] overflow-hidden ${innerShadow} transition-colors duration-300`}>
        {children}
      </div>
    </div>
  )
}

export default Card
