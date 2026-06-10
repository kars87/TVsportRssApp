# Live Sports Event Monitor

Et lynraskt, fullstack dashboard bygget for sanntidsaggregering og overvåkning av sportsnyheter og hendelser fra **TV 2** og **NRK**. 

Systemet henter data asynkront i bakgrunnen på serveren og dytter oppdateringer umiddelbart ut til nettleseren ved hjelp av en reaktiv strøm-arkitektur.

---

## 🚀 Teknisk Arkitektur

Applikasjonen er delt inn i to uavhengige moduler som snakker sammen over en tynn protokoll:

1. **Backend (Go):** En ekstremt lettvektig og trådsikker server. Den bruker parallelle **goroutines** for å polle RSS-feeder fra NRK og TV 2 uavhengig av hverandre hvert 30. sekund, slik at ingen av kildene blokkerer for den andre. Dataene flettes sammen og strømmes til klienter via **SSE (Server-Sent Events)**.
2. **Frontend (React + TypeScript):** Et moderne, mørkt dashboard styrt av streng TypeScript (`verbatimModuleSyntax`). Frontenden lytter på SSE-strømmen og rendrer innkommende artikler reaktivt med Tailwind CSS.

---

## ✨ Funksjoner

* **Sanntidsstrøm (SSE):** Ingen tunge API-forespørsler eller manuell oppdatering (refresh). Nyheter popper opp på skjermen i det sekundet de publiseres.
* **Parallelle Bakgrunns-workers:** Drevet av Go goroutines som deler et trådsikkert minnekart for å unngå duplikate saker.
* **Semantisk HTML & Universell Utforming (WCAG):** Kortene er bygget opp med korrekte elementer (`<article>`, `<header>`, `<time>`) og ARIA-attributter for optimal skjermleser-støtte.
* **Merkevare-deteksjon:** Systemet skiller automatisk mellom TV 2 og NRK, og tilpasser fargeprofiler (oransje/blå), logoer og vannmerker dynamisk.
* **Bildestøtte:** Kortene detekterer automatisk om saken har tilhørende bildemateriale (`imageUrl`) og tilpasser layouten sømløst med lazy-loading.

---

## 🛠️ Teknologier

### Backend
* **Go (Golang)**
* Standardbiblioteket (`net/http`, `encoding/xml`) for maksimal ytelse uten tunge rammeverk.
* Server-Sent Events (SSE) for reaktiv dataoverføring.

### Frontend
* **React 18+** & **TypeScript**
* **Vite** (Lynrask byggverktøy)
* **Tailwind CSS** (Inline utility-first styling)
* **Lucide React** (Ikoner)

---

## 💻 Kom i gang

### Forutsetninger
* [Go](https://go.dev/) (1.20 eller nyere)
* [Node.js](https://nodejs.org/) (v18 eller nyere)

### 1. Start Backenden
Naviger til backend-mappen din og kjør serveren:
```bash
cd tv-event-backend
go run main.go

2. Start Frontenden

Åpne et nytt terminalvindu, naviger til frontend-mappen, installer avhengigheter og start utviklerserveren:
Bash

cd tv-web-app
npm install
npm run dev


Åpne den lokale lenken som oppgis i terminalen (vanligvis http://localhost:5173) i nettleseren

📂 Prosjektstruktur (Sentrale filer)
Plaintext

├── tv-event-backend/       # Go Backend
│   ├── main.go             # SSE-broker, ruting og RSS-goroutines
│   └── ...
└── tv-web-app/             # React Frontend
    ├── src/
    │   ├── components/
    │   │   ├── EventCard.tsx  # Semantisk kort med dynamisk branding og bildestøtte
    │   │   ├── TV2Logo.tsx    # Responsiv inline SVG-logo
    │   │   └── NRKLogo.tsx    # Responsiv inline SVG-logo
    │   ├── App.tsx            # Dashboard-layout og SSE-tilkobling
    │   ├── types.ts           # Globale TypeScript-grensesnitt (LiveEvent)
    │   └── index.css          # Globalt Tailwind-oppsett
    └── tsconfig.json          # TypeScript-konfigurasjon