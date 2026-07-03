import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { ChevronLeft, Moon, Sun, ScanLine, CheckCircle, XCircle, Camera, ShieldAlert } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { BrowserQRCodeReader } from '@zxing/browser'
import Footer from '../../components/Footer'
import Card from '../../components/Card'

import { api } from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

const EASE = [0.22, 1, 0.36, 1]

// Rollen die mogen scannen. Alleen 'student' is met zekerheid bekend (de default
// in Profiel), dus we staan al het overige (organisator/spreker/docent/beheerder)
// toe. Pas dit aan zodra de exacte rol-strings van de backend bekend zijn.
function magScannen(rol) {
  return typeof rol === 'string' && rol.toLowerCase() !== 'student'
}

// AANNAME — bevestig met de backend. Een organisator markeert een ándere gebruiker
// aanwezig via het attendance-endpoint met de gescande gebruikers-id in de body.
// Wijkt de echte route/payload af, pas dan alléén deze functie aan.
async function markeerAanwezig(workshopId, gebruikerId) {
  return api(`/workshops/${workshopId}/attendance`, {
    method: 'POST',
    body: { user_id: gebruikerId },
  })
}

// Leest workshop + gebruiker uit de gescande QR. De QR op de workshopdetailpagina
// codeert JSON: { workshop_id, user_id }. Als fallback wordt een URL met
// ?workshop_id=…&user_id=… ondersteund. Geeft null als het niet herkend wordt.
function parseQr(tekst) {
  if (!tekst) return null
  const t = tekst.trim()
  try {
    const obj = JSON.parse(t)
    const workshopId = obj.workshop_id ?? obj.w ?? null
    const userId = obj.user_id ?? obj.u ?? null
    if (workshopId && userId) return { workshopId, userId }
  } catch { /* geen JSON */ }
  try {
    const url = new URL(t)
    const workshopId = url.searchParams.get('workshop_id') || url.searchParams.get('workshop')
    const userId = url.searchParams.get('user_id') || url.searchParams.get('user')
    if (workshopId && userId) return { workshopId, userId }
  } catch { /* geen URL */ }
  return null
}

function ScanAanwezigheid() {
  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  const rol = (() => {
    const u = getStoredUser()
    return u?.roles?.[0] || u?.role || 'student'
  })()
  const toegestaan = magScannen(rol)

  const [scannen, setScannen] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [resultaat, setResultaat] = useState(null) // { ok, titel, sub, workshop }
  const [cameraFout, setCameraFout] = useState(null)

  const videoRef = useRef(null)
  const controlsRef = useRef(null)
  const workshopsRef = useRef([])          // alleen om de workshoptitel te tonen
  const laatsteScanRef = useRef({ waarde: null, tijd: 0 }) // dedupe

  function toggleDark() {
    setDark(d => {
      const next = !d
      localStorage.setItem('theme', next ? 'dark' : 'light')
      return next
    })
  }

  // Workshops ophalen, enkel om na een scan de titel te kunnen tonen.
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    api('/workshops').then(d => { workshopsRef.current = d.data || [] }).catch(() => {})
  }, [])

  // Eén gedecodeerde QR verwerken: uitlezen, dedupliceren en aanwezig zetten.
  async function verwerkScan(tekst) {
    const nu = Date.now()
    // Dezelfde code binnen 3s negeren — de camera levert vele frames per seconde.
    if (laatsteScanRef.current.waarde === tekst && nu - laatsteScanRef.current.tijd < 3000) return
    laatsteScanRef.current = { waarde: tekst, tijd: nu }

    const geparsed = parseQr(tekst)
    if (!geparsed) {
      setResultaat({ ok: false, titel: 'QR niet herkend', sub: 'Dit is geen geldige aanwezigheidscode.' })
      return
    }
    if (bezig) return

    const { workshopId, userId } = geparsed
    const workshop = workshopsRef.current.find(w => String(w.id) === String(workshopId))

    setBezig(true)
    try {
      const data = await markeerAanwezig(workshopId, userId)
      const naam = data?.data?.user?.name || data?.user?.name || data?.data?.name || null
      setResultaat({
        ok: true,
        titel: naam ? `${naam} op aanwezig gezet` : 'Aanwezigheid geregistreerd',
        sub: data?.message || '',
        workshop: workshop?.title || null,
      })
      toast.success(naam ? `${naam} is aanwezig` : 'Aanwezigheid geregistreerd')
    } catch (error) {
      setResultaat({ ok: false, titel: 'Niet gelukt', sub: error.message || 'Deze scan kon niet verwerkt worden', workshop: workshop?.title || null })
      toast.error(error.message || 'Aanwezig zetten mislukt')
    } finally {
      setBezig(false)
    }
  }

  // Camera starten/stoppen op basis van `scannen`. De reader levert elke gedecodeerde
  // QR aan de callback; opruimen stopt de camerastream weer.
  useEffect(() => {
    if (!scannen) return
    let gestopt = false
    const reader = new BrowserQRCodeReader()

    reader
      .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
        if (gestopt || !result) return
        verwerkScan(result.getText())
      })
      .then((controls) => { controlsRef.current = controls })
      .catch(() => {
        setCameraFout('Kan de camera niet openen. Geef toestemming in de browser, of gebruik een apparaat met camera (en een https-verbinding).')
        setScannen(false)
      })

    return () => {
      gestopt = true
      try { controlsRef.current?.stop() } catch { /* stream al gestopt */ }
      controlsRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannen])

  const d = dark
  const contentBg = d ? 'bg-[#111111]'  : 'bg-[#e4e8e2]'
  const titleClr  = d ? 'text-white'    : 'text-[#1a3d2b]'
  const subClr    = d ? 'text-white/60' : 'text-[#1a3d2b]/70'

  return (
    <div className="min-h-[100dvh] bg-[#1a3d2b] flex flex-col">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex items-center justify-between px-6 py-5"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => navigate('/home')}
            className="rounded-xl p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
            aria-label="Terug naar home"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
          <img
            src="/img/techniek-college-rotterdam2.jpg"
            alt="Techniek College Rotterdam"
            className="h-8 w-auto rounded object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-xs font-bold tracking-tight text-white">Techniek College</span>
            <span className="text-xs font-medium tracking-tight text-white/50">Rotterdam</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleDark}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/10 hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a]"
          aria-label="Wissel kleurmodus"
        >
          <AnimatePresence mode="wait">
            {dark ? (
              <motion.div key="sun" initial={shouldReduce ? false : { opacity: 0, rotate: -40, scale: 0.6 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={shouldReduce ? {} : { opacity: 0, rotate: 40, scale: 0.6 }} transition={{ duration: 0.18 }}>
                <Sun className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div key="moon" initial={shouldReduce ? false : { opacity: 0, rotate: 40, scale: 0.6 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={shouldReduce ? {} : { opacity: 0, rotate: -40, scale: 0.6 }} transition={{ duration: 0.18 }}>
                <Moon className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.header>

      {/* Hero */}
      <div className="relative overflow-hidden px-6 pb-12 pt-3">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#d4e84a]/[0.08] blur-2xl" />
        <motion.div
          initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.05 }}
          className="relative max-w-2xl"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4e84a]">Organisator</p>
          <h1 className="mb-4 text-[2.75rem] font-black leading-[0.95] tracking-[-0.04em] text-white md:text-6xl">Scan aanwezigheid</h1>
          <span className="inline-flex items-center gap-2 text-sm font-medium text-white/55">
            <ScanLine className="h-4 w-4 text-[#d4e84a]" />
            Scan de workshop-QR die de deelnemer toont om deze aanwezig te zetten
          </span>
        </motion.div>
      </div>

      {/* Content */}
      <div className={`flex-1 ${contentBg} rounded-t-[2.5rem] px-5 pb-10 pt-8 transition-colors duration-300`}>
        <div className="mx-auto flex max-w-2xl flex-col gap-5">

          {!toegestaan ? (
            /* Geen organisator-rol: geen toegang tot de scanner. */
            <Card dark={d}>
              <div className="p-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                  <ShieldAlert className="h-5 w-5 text-red-400" />
                </div>
                <p className={`mb-1 text-sm font-bold ${titleClr}`}>Geen toegang</p>
                <p className={`mb-4 text-xs ${subClr}`}>
                  Alleen organisatoren en sprekers kunnen aanwezigheid scannen. Je bent ingelogd als <span className="font-semibold capitalize">{rol}</span>.
                </p>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/home')}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d4e84a] ${d ? 'bg-[#d4e84a]/10 text-[#d4e84a] hover:bg-[#d4e84a]/20' : 'bg-[#1a3d2b] text-[#d4e84a] hover:bg-[#16331f]'}`}
                >
                  Terug naar home
                </motion.button>
              </div>
            </Card>
          ) : (
            <>
              {/* Camera / scanner */}
              <Card dark={d}>
                <div className="p-5">
                  <div className="mb-4 flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${d ? 'bg-[#d4e84a]/12' : 'bg-[#eaf3de]'}`}>
                      <Camera className={`h-4 w-4 ${d ? 'text-[#d4e84a]' : 'text-[#1a3d2b]'}`} />
                    </div>
                    <h2 className={`text-sm font-bold ${titleClr}`}>Camera</h2>
                  </div>

                  {/* Videovlak met scan-kader */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
                    <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
                    {!scannen && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-center">
                        <ScanLine className="h-8 w-8 text-white/70" />
                        <p className="px-6 text-xs text-white/70">Camera staat uit. Start het scannen hieronder.</p>
                      </div>
                    )}
                    {scannen && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-2/3 w-2/3 rounded-2xl border-2 border-[#d4e84a]/80 shadow-[0_0_0_100vmax_rgba(0,0,0,0.35)]" />
                      </div>
                    )}
                  </div>

                  {cameraFout && (
                    <p className="mt-3 text-xs text-red-400">{cameraFout}</p>
                  )}

                  {/* Start/stop */}
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setCameraFout(null); setScannen(s => !s) }}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                      ${scannen
                        ? 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-400'
                        : 'bg-[#d4e84a] text-[#1a3d2b] hover:bg-[#c8dc3e] focus-visible:ring-[#1a3d2b]'}`}
                  >
                    {scannen ? 'Stop scannen' : <><ScanLine className="h-4 w-4" />Start scannen</>}
                  </motion.button>
                </div>
              </Card>

              {/* Laatste resultaat */}
              <AnimatePresence mode="wait">
                {resultaat && (
                  <motion.div
                    key={resultaat.titel + resultaat.sub}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`flex items-start gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold ${
                      resultaat.ok
                        ? (d ? 'bg-[#1a3d2b] text-[#d4e84a]' : 'bg-[#eaf3de] text-[#1a3d2b]')
                        : (d ? 'bg-red-950/40 text-red-300' : 'bg-red-50 text-red-500')
                    }`}
                  >
                    {resultaat.ok ? <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
                    <div>
                      <p>{resultaat.titel}</p>
                      {resultaat.sub && <p className="mt-0.5 text-xs font-normal opacity-80">{resultaat.sub}</p>}
                      {resultaat.workshop && <p className="mt-0.5 text-xs font-normal opacity-60">Workshop: {resultaat.workshop}</p>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ScanAanwezigheid
