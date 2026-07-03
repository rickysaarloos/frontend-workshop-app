# Frontend Workshop App

Een React + Vite single-page app (SPA) voor het inschrijven op workshops en events
van Techniek College Rotterdam. De app praat met een aparte backend-API via één
environment-variabele (`VITE_API_URL`).

> **Belangrijk:** dit is alleen de **frontend**. Er moet een draaiende backend zijn
> waar de app naartoe praat, anders werkt inloggen/inschrijven niet. Registreren
> kan bovendien alleen via een uitnodigingslink (met token) — er is geen open
> registratie meer vanaf de loginpagina.
>
> ⚠️ De backend van dit project draait op **platte HTTP** (`http://187.124.29.171:9000`),
> niet op HTTPS. Dat breekt de standaard-deploy en vereist een kleine omweg. Lees
> daarom eerst **[Start hier](#start-hier--deze-app-online-zetten)** voordat je gaat
> deployen — daar staat de route die voor dít project werkt.

---

## Inhoud

- [Voordat je begint](#voordat-je-begint)
- [Start hier — deze app online zetten](#start-hier--deze-app-online-zetten)
- [Techniek](#techniek)
- [Vereisten](#vereisten)
- [Lokaal draaien](#lokaal-draaien)
- [Environment-variabelen](#environment-variabelen)
- [Build maken](#build-maken)
- [Andere hostingopties](#andere-hostingopties)
  - [Netlify](#netlify)
  - [GitHub Pages](#github-pages)
  - [Eigen server met Nginx (VPS)](#eigen-server-met-nginx-vps)
  - [Vercel zónder proxy (backend mét HTTPS)](#vercel-zónder-proxy-backend-mét-https)
- [SPA-routing: waarom dit belangrijk is](#spa-routing-waarom-dit-belangrijk-is)
- [Backend, proxy & CORS](#backend-proxy--cors)
- [Problemen oplossen](#problemen-oplossen)
- [Handige commando's](#handige-commandos)

---

## Voordat je begint

Deze uitleg gaat ervan uit dat je kunt programmeren (backend of een andere taal),
maar dat React en frontend-deployen nieuw voor je zijn. Geen zorgen: **je hoeft de
React-code niet te begrijpen om de app te builden en online te zetten.** Je draait
straks alleen een paar commando's. Wat je nodig hebt:

- **Node.js** — de runtime die de build-tool (Vite) draait; vergelijkbaar met wat
  een JVM of Python-interpreter voor jou doet. Download de **LTS-versie** van
  <https://nodejs.org>. Je hebt **Node 20.19+ of 22.12+** nodig (Vite 8 vereist dit).
- **npm** — de package-manager voor Node. Die **komt automatisch mee** met Node, dus
  je hoeft die niet apart te installeren. Hiermee installeer je de dependencies en
  start je de build.
- **Een terminal** — het venster waarin je commando's typt:
  - **macOS:** app *Terminal* (Programma's → Hulpprogramma's).
  - **Windows:** *PowerShell* (klik op Start, typ "PowerShell", enter).
  - **Linux:** je gebruikelijke terminal.

Controleer of Node goed staat door dit in de terminal te typen:

```bash
node -v
```

Zie je een versie als `v20.19.0` of hoger, dan ben je klaar om te beginnen.

---

## Start hier — deze app online zetten

Dit is de aanbevolen route voor **dit specifieke project**. Volg 'm van boven naar
beneden en je hebt aan het eind een werkende online app op Vercel.

### Het probleem: Mixed Content

De backend draait op **HTTP** (`http://187.124.29.171:9000`). Zodra je de frontend
online zet op een moderne host zoals Vercel, draait die frontend op **HTTPS**
(`https://...`). En daar zit de klem: **een beveiligde HTTPS-pagina mag geen
onbeveiligde HTTP-resources laden.** De browser blokkeert dat automatisch met een
"Mixed Content"-fout. Het gevolg: elke API-call (inloggen, workshops ophalen,
inschrijven) mislukt zonder dat er iets zichtbaar misgaat — behalve fouten in de
console.

Wie klakkeloos `VITE_API_URL=http://187.124.29.171:9000` in het Vercel-dashboard
zet, loopt hier gegárandeerd op vast.

### De oplossing: een Vercel-proxy

In plaats van de browser rechtstreeks naar de HTTP-backend te laten praten, laat je
de browser **alleen met Vercel** praten (dat is HTTPS). Vercel stuurt de API-calls
vervolgens **door** naar de HTTP-backend. Server-naar-server verkeer heeft geen last
van de Mixed Content-regel, want die geldt alleen in de browser.

```
Browser  ──HTTPS──►  Vercel  ──HTTP──►  Backend (187.124.29.171:9000)
   ▲                    │
   └──── ziet nooit ────┘   de browser ziet alleen de veilige HTTPS-kant
```

Dit werkt met twee kleine wijzigingen: een `vercel.json` die de proxy instelt, en
één regel in `src/lib/config.js` zodat de app "praat met mezelf"-paden gebruikt.

> **Eerlijke kanttekening — dit is een tijdelijke noodoplossing, geen nette
> architectuur.** Het stuk tussen Vercel en de backend gaat nog steeds
> **onversleuteld over HTTP**, inclusief het inlog-token en wachtwoorden. Voor
> intern of kortdurend gebruik (bijvoorbeeld één studiedag) is dat een acceptabel
> risico. Voor echte productie hoort de backend zelf HTTPS te spreken. Twee nettere
> routes daarvoor:
> - **Domeinnaam + Let's Encrypt:** geef de backend een domeinnaam en een gratis
>   TLS-certificaat via [Let's Encrypt](https://letsencrypt.org/). Dan kun je de
>   proxy weglaten en direct met HTTPS praten.
> - **Cloudflare Tunnel:** zet een gratis [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
>   voor de HTTP-backend; die geeft je een HTTPS-URL zonder dat je zelf certificaten
>   beheert.
>
> Zodra de backend HTTPS spreekt, gebruik je de eenvoudigere aanpak uit
> [Vercel zónder proxy](#vercel-zónder-proxy-backend-mét-https).

### Stap 1 — `vercel.json` aanmaken

Maak in de **root** van het project (naast `package.json`) een bestand
`vercel.json` met exact deze inhoud:

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "http://187.124.29.171:9000/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**De volgorde is cruciaal.** Vercel loopt de regels van boven naar beneden af en
gebruikt de eerste die past:

1. De eerste regel vangt alles wat met `/api/` begint en stuurt dat door naar de
   backend (de proxy).
2. De tweede regel is een *catch-all* die al het overige naar `index.html` stuurt —
   dat is de [SPA-fallback](#spa-routing-waarom-dit-belangrijk-is) die nodig is voor
   client-side routing.

Zou je ze omdraaien, dan slokt de catch-all óók je API-calls op en bereikt geen
enkel verzoek de backend.

### Stap 2 — `src/lib/config.js` aanpassen

Nu staat er in [src/lib/config.js](src/lib/config.js) dat de backend-URL uit
`VITE_API_URL` komt, met een harde error als die ontbreekt:

```js
const API_URL = import.meta.env.VITE_API_URL

if (!API_URL) {
  throw new Error(/* ... */)
}

export { API_URL }
```

De app plakt daar `/api` + het pad achteraan, bijvoorbeeld
`` `${API_URL}/api/login` `` (zie [src/lib/api.js](src/lib/api.js)). Voor de proxy
wil je dat `API_URL` **leeg** is, zodat de app **relatieve** paden bouwt zoals
`/api/login`. Zo'n relatief pad gaat automatisch naar Vercel zelf — en Vercel proxyt
het door. Vervang de inhoud van `config.js` door:

```js
// Leeg = relatieve /api-paden die naar de eigen host (Vercel) gaan, waar de
// proxy in vercel.json ze doorstuurt naar de HTTP-backend. Zie de README.
// Lokaal ontwikkelen kan nog steeds tegen een directe backend via .env.
export const API_URL = import.meta.env.VITE_API_URL || ''
```

Hiermee geldt:

- **Op Vercel** (geen `VITE_API_URL` ingesteld) → `API_URL` is `''` → de app gebruikt
  `/api/...` → de proxy doet zijn werk. Je hoeft dus **géén** `VITE_API_URL` in het
  Vercel-dashboard te zetten.
- **Lokaal** (met een `.env`, zie [Lokaal draaien](#lokaal-draaien)) → `API_URL`
  wijst rechtstreeks naar de backend, precies zoals nu.

> Wil je puur de proxy en helemaal geen directe backend meer, dan kun je ook
> letterlijk `export const API_URL = ''` schrijven. De variant met
> `|| ''` hierboven heeft de voorkeur omdat lokaal ontwikkelen tegen de echte backend
> dan blijft werken. Let op: de *oorspronkelijke* `config.js` gooit een error bij een
> lege waarde — je kunt dus niet volstaan met een leeg `VITE_API_URL`; je moet de
> code echt aanpassen zoals hierboven.

### Stap 3 — Deployen naar Vercel

1. Zorg dat `vercel.json` en de aangepaste `config.js` gecommit en gepusht zijn naar
   GitHub.
2. Ga naar <https://vercel.com> en log in met je GitHub-account.
3. **Add New → Project** → kies de repo `frontend-workshop-app`.
4. Vercel detecteert Vite automatisch. Controleer:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. **Environment Variables:** laat leeg — bij de proxy-aanpak heb je hier niets nodig.
6. Klik **Deploy**.

Na de build test je het resultaat: open de Vercel-URL, log in en controleer of
workshops laden. Werkt inloggen, dan werkt de proxy. Zie je in de browserconsole
(F12) tóch een "Mixed Content"-melding, dan ontbreekt of klopt `vercel.json` niet —
zie [Problemen oplossen](#problemen-oplossen).

Elke volgende `git push` naar `main` triggert automatisch een nieuwe deploy.

---

## Techniek

| Onderdeel        | Keuze                                   |
| ---------------- | --------------------------------------- |
| Framework        | React 19                                |
| Build tool       | Vite 8                                  |
| Routing          | react-router-dom 7 (`BrowserRouter`)    |
| Styling          | Tailwind CSS 4                          |
| Animatie         | Motion                                  |
| Iconen           | lucide-react                            |
| Notificaties     | sonner                                  |

De output van een build is **statische HTML/CSS/JS** (`dist/`). Je kunt de app dus
op elke statische host of CDN kwijt — er is geen Node-server nodig om de frontend te
draaien.

---

## Vereisten

- **Node.js 20.19+ of 22.12+** (Vite 8 vereist dit; nieuwere versies zoals 24/26
  werken ook). Nog niet geïnstalleerd? Zie [Voordat je begint](#voordat-je-begint).
  Controleer met:
  ```bash
  node -v
  ```
- **npm** (komt mee met Node). `pnpm`/`yarn`/`bun` mag ook, maar de voorbeelden
  gebruiken npm.
- Een bereikbare **backend** (voor dit project: `http://187.124.29.171:9000`).

---

## Lokaal draaien

Lokaal ontwikkelen heeft **geen** last van het Mixed Content-probleem: de dev-server
draait zelf op `http://localhost`, en die mag prima met een HTTP-backend praten.
Je kunt dus gewoon rechtstreeks naar de backend wijzen via een `.env`-bestand.

```bash
# 1. Repository klonen
git clone https://github.com/rickysaarloos/frontend-workshop-app.git
cd frontend-workshop-app

# 2. Dependencies installeren
npm install

# 3. Environment-bestand aanmaken
cp .env.example .env
# open .env en vul de backend-URL in (voor dit project de HTTP-URL, zie hieronder)

# 4. Dev-server starten (met hot reload)
npm run dev
```

De app draait daarna op <http://localhost:5173>.

> Heb je `config.js` al aangepast naar de proxy-variant (`import.meta.env.VITE_API_URL || ''`)?
> Dan blijft dit lokaal gewoon werken zolang je `VITE_API_URL` in `.env` invult.

---

## Environment-variabelen

De app gebruikt één variabele. Vite leest alleen variabelen die met `VITE_` beginnen.

| Variabele       | Wanneer nodig | Voorbeeld                        | Uitleg |
| --------------- | ------------- | -------------------------------- | ------ |
| `VITE_API_URL`  | Lokaal draaien & de [Vercel-aanpak zónder proxy](#vercel-zónder-proxy-backend-mét-https) | `http://187.124.29.171:9000` | Base-URL van de backend, **zonder** `/api`-suffix. De code voegt `/api` zelf toe (bv. `${VITE_API_URL}/api/login`). |

Voorbeeld `.env` voor lokaal ontwikkelen tegen dit project:

```env
VITE_API_URL=http://187.124.29.171:9000
```

> Let op: het meegeleverde `.env.example` noemt `https://` als voorbeeld, maar de
> backend van dít project spreekt alleen **HTTP**. Gebruik lokaal dus de `http://`-URL
> hierboven.

**Bij de aanbevolen [proxy-aanpak op Vercel](#start-hier--deze-app-online-zetten)
zet je `VITE_API_URL` níét** — de app gebruikt dan relatieve `/api`-paden en de proxy
regelt de rest.

> ⚠️ **Twee valkuilen:**
> 1. **Géén `/api` op het einde.** `VITE_API_URL=http://host:poort` is goed;
>    `.../api` levert dubbele `/api/api`-paden op.
> 2. **Env-variabelen worden tijdens de _build_ ingebakken, niet at runtime.**
>    Verander je `VITE_API_URL`, dan moet je opnieuw builden/deployen. `.env` staat
>    in `.gitignore` en gaat dus niet mee de repo in.

---

## Build maken

```bash
npm run build      # genereert de statische site in dist/
npm run preview    # bekijk de productie-build lokaal op http://localhost:4173
```

`npm run preview` is puur om lokaal te testen — het is **geen** productieserver.

---

## Andere hostingopties

De [Start hier](#start-hier--deze-app-online-zetten)-route (Vercel + proxy) is de
aanbevolen aanpak voor dit project. De opties hieronder zijn generiek. **Let op:**
zolang de backend HTTP blijft, heb je bij elke host óf dezelfde proxy-truc nodig,
óf een backend met HTTPS. Waar dat speelt staat het erbij.

### Netlify

Net als Vercel kan Netlify aan je GitHub-repo koppelen.

1. Ga naar <https://netlify.com> → **Add new site → Import an existing project** →
   GitHub → kies de repo.
2. Build-instellingen:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
3. Deploy.

Voor SPA-routing voeg je een bestand `public/_redirects` toe (alles in `public/`
komt automatisch in `dist/`):

```
/*    /index.html   200
```

**HTTP-backend?** Dan heb je ook op Netlify de proxy nodig. Zet die in een
`netlify.toml` in de root, mét de API-regel vóór de SPA-fallback en pas
`config.js` aan zoals in [Stap 2](#stap-2--srclibconfigjs-aanpassen):

```toml
[[redirects]]
  from = "/api/*"
  to = "http://187.124.29.171:9000/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### GitHub Pages

Kan, maar heeft aandachtspunten: een **subpad** (`/frontend-workshop-app/`), de
**SPA-fallback**, én — belangrijk — GitHub Pages draait op **HTTPS zonder
proxy-mogelijkheid**. Met een HTTP-backend loop je hier dus tegen Mixed Content aan
en is er geen ingebouwde uitweg. **Gebruik GitHub Pages voor dit project alleen als
de backend HTTPS spreekt.**

1. Installeer het deploy-hulpje:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Zet in `vite.config.js` de `base` op de repo-naam:
   ```js
   export default defineConfig({
     base: '/frontend-workshop-app/',
     plugins: [react(), tailwindcss()],
     resolve: { alias: { '@': path.resolve(__dirname, './src') } },
   })
   ```
3. Voeg scripts toe aan `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
4. SPA-fallback: kopieer na de build `index.html` naar `404.html` (GitHub Pages
   serveert `404.html` bij onbekende paden):
   ```bash
   cp dist/index.html dist/404.html
   ```
5. Deploy met de (HTTPS-)backend-URL meegegeven:
   ```bash
   VITE_API_URL=https://jouw-https-backend npm run deploy
   ```
6. Zet in **Settings → Pages** de bron op de `gh-pages`-branch.

### Eigen server met Nginx (VPS)

Op een eigen server kun je Nginx zowel de statische bestanden laten serveren als de
API laten proxyen — dan heb je `vercel.json` niet nodig maar bereik je hetzelfde.

1. Bouw de app (met de proxy-variant van `config.js` hoeft `VITE_API_URL` niet):
   ```bash
   npm run build
   ```
2. Kopieer de inhoud van `dist/` naar bijvoorbeeld `/var/www/workshop-app`.
3. Nginx-config met HTTPS, API-proxy én SPA-fallback:
   ```nginx
   server {
       listen 443 ssl;
       server_name workshops.jouw-domein.nl;

       ssl_certificate     /etc/letsencrypt/live/workshops.jouw-domein.nl/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/workshops.jouw-domein.nl/privkey.pem;

       root /var/www/workshop-app;
       index index.html;

       # API doorsturen naar de HTTP-backend (zelfde truc als de Vercel-proxy)
       location /api/ {
           proxy_pass http://187.124.29.171:9000;
       }

       # Alle overige paden naar index.html (client-side routing)
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```
4. Herlaad Nginx: `sudo nginx -t && sudo systemctl reload nginx`.
   Gebruik [Certbot](https://certbot.eff.org/) voor een gratis SSL-certificaat.

### Vercel zónder proxy (backend mét HTTPS)

Zódra de backend HTTPS spreekt (zie de [betere routes](#de-oplossing-een-vercel-proxy)),
heb je de proxy niet meer nodig en is deployen eenvoudiger. Dan geldt de klassieke
aanpak:

1. Zet `config.js` terug naar het lezen van de env-variabele (of laat de
   `|| ''`-variant staan en vul gewoon `VITE_API_URL` in).
2. In het Vercel-dashboard onder **Environment Variables**:
   `VITE_API_URL = https://jouw-https-backend`.
3. Voor SPA-routing volstaat dan een `vercel.json` met **alleen** de catch-all:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

> Gebruik deze `vercel.json` **niet** samen met de proxy-aanpak — kies er één. Voor
> dit project met de HTTP-backend geldt de gecombineerde `vercel.json` uit
> [Stap 1](#stap-1--verceljson-aanmaken).

---

## SPA-routing: waarom dit belangrijk is

De app gebruikt `BrowserRouter` met routes zoals `/workshops/:id` en `/profiel`.
Deze paden bestaan **niet** als echte bestanden — React Router tekent ze in de
browser. Als een gebruiker `/workshops/3` rechtstreeks opent of de pagina ververst,
vraagt de host een bestand op dat er niet is → **404**.

De oplossing is overal dezelfde: **stuur elk onbekend pad terug naar `index.html`**,
zodat React Router het overneemt. Per platform:

| Platform      | Oplossing                                      |
| ------------- | ---------------------------------------------- |
| Vercel        | catch-all rewrite naar `/index.html` in `vercel.json` |
| Netlify       | `public/_redirects` bestand                    |
| GitHub Pages  | `404.html` = kopie van `index.html`            |
| Nginx         | `try_files $uri $uri/ /index.html;`            |

Bij dit project zit die catch-all al in de gecombineerde `vercel.json` uit
[Stap 1](#stap-1--verceljson-aanmaken) — als tweede regel, ná de API-proxy.

---

## Backend, proxy & CORS

- **Met de proxy-aanpak** (aanbevolen voor dit project) praat de browser alleen met
  de eigen host (Vercel). Dat is *same-origin*, dus je krijgt **geen CORS-fouten** en
  de backend hoeft geen CORS-config voor het frontend-domein te hebben. De browser
  ziet de HTTP-backend nooit.
- **Zónder proxy** (directe HTTPS-backend) draaien frontend en backend op
  verschillende domeinen. Dan moet de backend CORS-verzoeken toestaan vanaf het
  domein van de frontend (bv. `https://workshops.jouw-domein.nl`), en gebruik je
  uiteraard een `https://`-URL.
- De app zet zelf de `/api`-prefix op elk pad (`/api/login`, `/api/workshops`,
  `/api/workshops/:id/register`). Zet die prefix dus **niet** in `VITE_API_URL` en
  ook niet in de proxy-`destination` (die staat er in `vercel.json` al expliciet in).

---

## Problemen oplossen

| Symptoom | Waarschijnlijke oorzaak | Oplossing |
| -------- | ----------------------- | --------- |
| Online: inloggen doet niets, console meldt **"Mixed Content"** / "blocked" | HTTPS-frontend probeert de HTTP-backend rechtstreeks te bereiken | Gebruik de [Vercel-proxy](#start-hier--deze-app-online-zetten): `vercel.json` toevoegen én `config.js` op `import.meta.env.VITE_API_URL || ''` zetten. Zet géén HTTP-`VITE_API_URL` in het dashboard |
| Online: API-calls geven 404 of raken de backend niet | In `vercel.json` staat de catch-all vóór de `/api`-regel | Zet de `/api/:path*`-regel als **eerste**, de `/(.*)`-catch-all als tweede |
| App toont meteen een foutmelding over `VITE_API_URL` | `config.js` (originele versie) gooit een error bij een lege waarde | Pas `config.js` aan naar `import.meta.env.VITE_API_URL || ''`, of vul lokaal een `.env` in |
| Directe links / verversen geeft 404 | Geen SPA-fallback ingesteld | Voeg de catch-all rewrite/redirect voor je platform toe (zie [SPA-routing](#spa-routing-waarom-dit-belangrijk-is)) |
| Netwerkfout / "Kan geen verbinding maken met de server" | Backend onbereikbaar of verkeerde URL | Controleer de backend-URL en of de backend draait |
| Verzoeken gaan naar `/api/api/...` | `/api` staat per ongeluk in `VITE_API_URL` of in de proxy-`destination` | Haal de dubbele `/api` eruit |
| CORS-fout in de console (zónder proxy) | Backend staat het frontend-domein niet toe | Zet het frontend-domein in de CORS-config van de backend, of gebruik de proxy (same-origin, geen CORS) |
| Nieuwe `VITE_API_URL` heeft geen effect | Env-vars worden tijdens build ingebakken | Opnieuw builden/deployen |
| `npm install` of build faalt op oude Node | Node te oud voor Vite 8 | Upgrade naar Node 20.19+ / 22.12+ |

---

## Handige commando's

```bash
npm run dev       # lokaal ontwikkelen met hot reload
npm run build     # productie-build in dist/
npm run preview   # productie-build lokaal bekijken
npm run lint      # ESLint over de codebase
```
