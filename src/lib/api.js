// Centrale API-laag voor de hele app.
//
// Voorheen deed elke pagina zijn eigen fetch met handmatig token ophalen,
// headers samenstellen, res.json() en een if (!res.ok)-check. Dat leverde ~30×
// dezelfde plumbing op én subtiel verschillend gedrag per pagina (vooral bij
// 401, lege responses en trage verbindingen). Deze helper centraliseert dat:
//
//   - voegt de base-URL + /api-prefix toe (API_URL uit config bevat géén /api);
//   - zet Accept altijd, Content-Type alleen bij een body, Authorization als auth aanstaat;
//   - bij 401: clearAuth() + redirect naar /login, daarna gooien (centraliseert H3);
//   - parseert de body veilig (lege/niet-JSON body wordt null i.p.v. een crash, M1);
//   - gooit bij een niet-ok response een ApiError met message, status en errors;
//   - heeft een timeout van 15s via AbortSignal (M2).

import { API_URL } from './config'
import { getToken, clearAuth } from './auth'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) headers.Authorization = `Bearer ${getToken()}`

  let res
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    })
  } catch (e) {
    // Netwerk- of timeoutfout: er is geen HTTP-response.
    if (e.name === 'TimeoutError') {
      throw new ApiError('Het verzoek duurde te lang. Controleer je verbinding.', 0)
    }
    throw new ApiError('Kan geen verbinding maken met de server.', 0)
  }

  // Verlopen/ongeldig token: lokaal opruimen en terug naar login.
  if (res.status === 401) {
    clearAuth()
    window.location.assign('/login')
    throw new ApiError('Niet ingelogd', 401)
  }

  // Veilig parsen: een lege body (204) of niet-JSON (bv. 500-HTML) mag niet crashen.
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(data?.message || 'Er ging iets mis', res.status, data?.errors)
  }

  return data
}
