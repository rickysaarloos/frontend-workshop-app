// Auth-state staat in localStorage.
//
// Bewuste afweging: localStorage is simpel en overleeft een page-refresh, maar is
// leesbaar vanuit JavaScript en daarmee kwetsbaar bij een XSS-aanval (een script kan
// het token uitlezen). Een httpOnly-cookie zou veiliger zijn omdat het token dan niet
// vanuit JS bereikbaar is, maar dat vereist aanpassingen aan de Laravel-backend.
// Voor nu accepteren we deze afweging bewust.

// Haalt de ingelogde gebruiker veilig op uit localStorage.
// Een corrupte/ongeldige JSON-waarde mag nooit de hele app op wit zetten:
// in dat geval ruimen we de waarde op en geven we null terug.
export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

// Haalt het bearer-token op (of null als de gebruiker niet is ingelogd).
export function getToken() {
  return localStorage.getItem('token')
}

// Wist alle auth-state. Gebruikt bij uitloggen en bij een 401-respons.
export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}
