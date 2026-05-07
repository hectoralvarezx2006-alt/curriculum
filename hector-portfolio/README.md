# hector-portfolio

Web-currículum de Héctor Álvarez — React + Framer Motion + IA.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Personalizar antes de subir

1. **Tu email / LinkedIn / GitHub** → `src/sections/ContactoSection.jsx`
2. **Detalles de proyectos** → `src/data/index.js`
3. **Commits / historia** → `src/data/index.js` (array COMMITS)
4. **System prompt del asistente IA** → `src/data/index.js` (SYSTEM_PROMPT)

## Stack

- React 18 + Vite
- Framer Motion (animaciones y transiciones)
- Claude API (asistente IA en modo interacción)
- CSS custom con tema cyberpunk dark

## Desplegar en Vercel

```bash
npm run build
# sube la carpeta /dist a Vercel o Netlify
```

## Notas

- El asistente IA usa la API de Claude directamente desde el frontend.
  Para producción, mueve la llamada a un backend para no exponer la API key.
- Cambia los placeholders de contacto por tus datos reales.
