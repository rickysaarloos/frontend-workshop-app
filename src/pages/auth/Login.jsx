import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    console.log('inloggen met:', email, wachtwoord)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-[#1a3d2b] font-bold text-sm">Techniek</span>
          <span className="text-[#1a3d2b] font-bold text-sm">College</span>
          <span className="text-[#1a3d2b] font-bold text-sm">Rotterdam</span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">

          <h1 className="text-xl font-semibold text-[#1a3d2b] mb-1">Inloggen</h1>
          <p className="text-sm text-gray-500 mb-6">Workshop app TCR</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">E-mailadres</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@tcrmbo.nl"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Wachtwoord</label>
              <input
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                placeholder="••••••••"
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#1a3d2b] focus:ring-2 focus:ring-[#1a3d2b]/10 transition-all"
              />
            </div>

            <button
              type="submit"
              className="bg-[#d4e84a] text-[#1a3d2b] rounded-lg py-2.5 text-sm font-semibold hover:bg-[#c8dc3e] transition-colors mt-2 flex items-center justify-center gap-2"
            >
              Inloggen →
            </button>

            <p className="text-xs text-center text-gray-500">
              Nog geen account?{' '}
              <span
                onClick={() => navigate('/register')}
                className="text-[#1a3d2b] font-medium cursor-pointer hover:underline"
              >
                Registreren
              </span>
            </p>
          </form>

        </div>
      </div>

    </div>
  )
}

export default Login