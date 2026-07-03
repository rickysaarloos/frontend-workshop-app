// Centrale configuratie voor de app.
//
// De backend-URL komt uitsluitend uit de env-variabele VITE_API_URL (zie .env).
// Bewust GEEN hardcoded fallback meer: een IP-adres met http:// in de broncode
// lekt infra-informatie naar iedereen die de repo kan lezen, en http betekent dat
// het bearer-token en wachtwoorden onversleuteld over de lijn gaan.
//
// Ontbreekt de variabele, dan falen we duidelijk in plaats van stilletjes terug te
// vallen op een onveilige URL.
const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error(
    'VITE_API_URL is niet ingesteld. Maak een .env-bestand aan met bijv. ' +
      'VITE_API_URL=https://jouw-backend en herstart de dev-server.',
  )
}

export { API_URL }
