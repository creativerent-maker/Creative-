# Web nueva creativerent.es: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web estática trilingüe (es/ca/en) de Creative Rent, con panel de edición móvil en `/admin`, lista para revisión en una URL de pruebas. El dominio NO se toca en este plan.

**Architecture:** Proyecto Astro en la raíz del repo con salida estática. El contenido (trabajos, clientes, servicios y ajustes) vive en `src/content/` como archivos que edita Sveltia CMS mediante commits en GitHub. El formulario de presupuesto es una Cloudflare Pages Function. Las redirecciones van en `public/_redirects`.

**Tech Stack:** Astro (la última estable al instalar, versión fijada en `package.json`), TypeScript, Vitest, Playwright (ya instalado en la máquina: `require('playwright')`), Sveltia CMS (CDN `https://unpkg.com/@sveltia/cms@<versión fijada>/dist/sveltia-cms.js`), Cloudflare Pages + Functions, Resend (envío de email) y Cloudflare Turnstile.

**Spec:** `docs/superpowers/specs/2026-11-19-web-creativerent-design.md`

## Global Constraints

- Colores: naranja `#f26241`, azul `#313151`, magenta `#ff4158` (magenta solo en degradados con el naranja).
- Tipografías: titulares en Exo 2 (sustituye a Amplesoft Pro hasta que haya licencia; cambiarla debe ser un solo token CSS `--font-display`) y texto en Roboto. Ambas alojadas en el propio sitio en WOFF2 (`@fontsource/exo-2` y `@fontsource/roboto`), solo los pesos 400/500/700.
- Idiomas: `es` en `/` (por defecto), `ca` en `/ca/`, `en` en `/en/`. Slugs traducidos, sin tildes.
- Contacto: 977 199 720 · 639 654 816 (WhatsApp `https://wa.me/34639654816`) · info@creativerent.es · C/ Campsrodons, nave 14, 43110 La Canonja (Tarragona).
- Lema del pie: «Servicios audiovisuales profesionales.»
- Prohibido en todo el sitio: bodas o celebraciones privadas (`boda`, `bodas`, `casament`, `wedding`).
- El contenido de muestra lleva `ejemplo: true` y nunca se genera cuando `SITE_ENV=production`.
- Sin cookies no técnicas: sin banner de cookies. Mapas enlazados, no incrustados.
- Rendimiento: portada de menos de 1 MB en la primera carga. Sin scroll horizontal a 360 px. Zoom permitido (sin `user-scalable=0`). WCAG 2.1 AA.
- Prohibido tocar DNS, servidores de nombres, MX o hosting de creativerent.es/.net. Es el paso final y necesita confirmación del propietario.

## Review Focus

1. Un trabajo con solo el castellano relleno, visto en `/ca/` o `/en/`: se muestra en castellano, sin `hreflang` para ese idioma y con la URL canónica apuntando a la versión en castellano. Lo cubren las tareas 2 y 6.
2. Menos de 4 trabajos publicados y no de ejemplo: el bloque «Trabajos recientes» desaparece de la portada y `/trabajos/` muestra los que haya, o un texto si no hay ninguno. Lo cubren las tareas 2 y 3.
3. Contenido de muestra en un build de producción: no aparece ni una página, imagen ni logo de ejemplo. Lo cubre la tarea 2.
4. Formulario con datos vacíos, un email inválido, un mensaje de más de 5000 caracteres, sin aceptar la política de privacidad o sin token de Turnstile: responde 400 con un mensaje claro y no envía nada. Lo cubre la tarea 5.
5. Fotos de más de 4000 px subidas desde el móvil: el panel las convierte a WebP de 2400 px como máximo en el lado largo, y la web sirve variantes AVIF/WebP. Lo cubre la tarea 7 (configuración más una comprobación manual).

---

## File Structure

```
astro.config.mjs            i18n, sitemap, salida estática
src/i18n/ui.ts              textos de interfaz es/ca/en
src/i18n/routes.ts          tabla de slugs por idioma y helpers de rutas
src/lib/works.ts            selección, traducción con respaldo y regla de los 4
src/lib/seo.ts              canonical + hreflang
src/lib/quote.ts            validación del formulario (pura)
src/lib/redirects.ts        genera public/_redirects
src/content.config.ts       colecciones trabajos, clientes, servicios y ajustes
src/content/{trabajos,clientes,servicios}/ , src/content/ajustes.json
src/styles/tokens.css       tokens de marca
src/layouts/Base.astro      head, SEO, cabecera y pie
src/components/*.astro      Header, Footer, Hero, ForBand, ServiceCards, RecentWorks,
                            ClientMarquee, CtaBand, WorkCard, WorkFilters, ContactForm
src/pages/[...lang]/…       páginas generadas por idioma (ver Tarea 1)
functions/api/presupuesto.ts  Pages Function del formulario
public/admin/{index.html,config.yml}  Sveltia CMS
tests/unit/*.test.ts, tests/e2e/*.spec.ts
```

---

### Task 1: Esqueleto Astro, marca, i18n de rutas y layout base

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `src/styles/tokens.css`, `src/i18n/ui.ts`, `src/i18n/routes.ts`, `src/layouts/Base.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `public/brand/logo-h.svg`, `public/brand/logo-h-neg.svg`, `public/favicon.svg`
- Move: `index.html` → `legacy/calculadora.html` (la adapta la Tarea 4)
- Test: `tests/unit/routes.test.ts`

**Interfaces:**
- Produces:
  - `type Locale = 'es'|'ca'|'en'`
  - `type PageKey = 'home'|'servicios'|'trabajos'|'crealuxe'|'contacto'|'calculadora'|'aviso-legal'|'privacidad'|'cookies'|'accesibilidad'`
  - `localizedPath(key: PageKey, locale: Locale, slug?: string): string`
  - `t(locale: Locale, key: keyof typeof ui.es): string`
  - `Base.astro` props: `{ title: string; description: string; locale: Locale; alternates: {locale: Locale; href: string}[]; canonical: string; ogImage?: string }`

Slugs:

| Clave | es | ca | en |
|---|---|---|---|
| servicios | servicios | serveis | services |
| trabajos | trabajos | treballs | projects |
| crealuxe | crealuxe-fx | crealuxe-fx | crealuxe-fx |
| contacto | contacto | contacte | contact |
| calculadora | herramientas/calculadora-proyeccion | eines/calculadora-projeccio | tools/projection-calculator |
| aviso-legal | aviso-legal | avis-legal | legal-notice |
| privacidad | privacidad | privacitat | privacy |
| cookies | cookies | cookies | cookies |
| accesibilidad | accesibilidad | accessibilitat | accessibility |

- [ ] **Step 1: Write the failing test** `tests/unit/routes.test.ts`:
  - `localizedPath('home','es') === '/'` y `localizedPath('home','ca') === '/ca/'`
  - `localizedPath('servicios','en','mapping') === '/en/services/mapping/'`
  - `localizedPath('trabajos','ca') === '/ca/treballs/'`
  - `localizedPath('calculadora','es') === '/herramientas/calculadora-proyeccion/'`
  - Cada clave de `ui.es` existe en `ui.ca` y en `ui.en` (sin traducciones que falten).
- [ ] **Step 2:** `npx vitest run tests/unit/routes.test.ts` → FAIL (módulo inexistente).
- [ ] **Step 3: Scaffold.**
  - `npm create astro@latest . -- --template minimal --typescript strict --no-git --install`.
  - Añadir `@astrojs/sitemap`, `@fontsource/exo-2`, `@fontsource/roboto`, `vitest`.
  - En `astro.config.mjs`: `site: 'https://creativerent.es'`, `trailingSlash: 'always'`, `i18n: { locales: ['es','ca','en'], defaultLocale: 'es', routing: { prefixDefaultLocale: false } }`.
  - Implementar `routes.ts`/`ui.ts` con la tabla de arriba.
  - `tokens.css`: tokens de color y de tipografía de la maqueta aprobada.
  - El logo sale del PDF del manual (página 5) con `pdftocairo -svg`, recortado con `viewBox="344 356 456 110"`. El negativo sustituye el relleno azul `rgb(19.215393%, 19.215393%, 31.764221%)` por blanco. Hay que limpiar los glifos no usados para que pese menos de 40 KB.
  - Header y Footer según §7.1 y §7.8 del spec. En móvil, el menú pasa a un botón de hamburguesa (`<button aria-expanded>`), el selector de idioma enlaza a `alternates` y el teléfono y el email son texto seleccionable además de enlaces.
- [ ] **Step 4:** `npx vitest run` → PASS. `npx astro build` → sin errores.
- [ ] **Step 5:** Commit `feat: scaffold Astro site with brand tokens, i18n routes and base layout`.

### Task 2: Colecciones de contenido y lógica de trabajos

**Files:**
- Create: `src/content.config.ts`, `src/lib/works.ts`, `src/lib/seo.ts`, `src/content/servicios/*.json` (8), `src/content/clientes/*.json` (12 de ejemplo), `src/content/trabajos/*.json` (4 de ejemplo), `src/content/ajustes.json`, `src/assets/ejemplo/*.jpg`
- Test: `tests/unit/works.test.ts`, `tests/unit/seo.test.ts`

**Interfaces:**
- Consumes: `Locale`, `localizedPath`.
- Produces:
  - Esquema `trabajo`:
    - `{ slug, fecha: Date, lugar: string, tipoCliente: 'ayuntamientos'|'instituciones'|'empresas'|'congresos', servicios: ServicioId[], portada: image, galeria: image[], destacado: boolean, publicado: boolean, ejemplo?: boolean, es: {titulo, texto}, ca?: {titulo?, texto?}, en?: {titulo?, texto?} }`
    - Es la estructura i18n `single_file` de Sveltia, con los idiomas anidados por clave.
  - `type ServicioId = 'alquiler-material-audiovisual'|'pantallas-led'|'streaming'|'infraestructura'|'produccion-completa'|'mapping'|'postproduccion'|'personal-tecnico'`. Son los slugs en castellano. Cada JSON de servicio lleva además `orden: 1..8` y `slug` por idioma.
  - `visibleWorks(all: Trabajo[], env: 'production'|'preview'): Trabajo[]`: filtra `publicado`, excluye `ejemplo` en producción y ordena por `fecha` descendente.
  - `recentWorks(visible: Trabajo[]): Trabajo[]`: los 4 primeros de los destacados, completando con los más recientes; devuelve `[]` si `visible.length < 4`.
  - `localizeWork(w: Trabajo, locale: Locale): { titulo: string; texto: string; translated: boolean }`: si falta, usa el castellano y devuelve `translated: false`.
  - `workAlternates(w: Trabajo): { canonicalByLocale: Record<Locale,string>; hreflang: {locale: Locale; href: string}[] }`: el hreflang solo incluye idiomas con traducción, y el canonical de un idioma sin traducir apunta a la URL `es`.
  - `siteEnv(): 'production'|'preview'` lee `import.meta.env.SITE_ENV`; por defecto `'preview'`.

Copy de los servicios (castellano, de §6 del spec): títulos y frases cortas literales. El texto largo de cada servicio lo redacta el implementador en es/ca/en a partir de las webs actuales, sin mencionar bodas ni celebraciones privadas.

- [ ] **Step 1: Write the failing tests.**
  - `visibleWorks` en `'production'` con 2 normales y 1 `ejemplo` → 2. En `'preview'` → 3. Un trabajo con `publicado:false` no sale nunca.
  - `recentWorks` con 3 visibles → `[]`. Con 6 visibles, de los que 1 es destacado y antiguo → 4 elementos, con el destacado el primero.
  - `localizeWork(trabajoSoloEs,'ca')` → `{ titulo: <es>, translated: false }`.
  - `workAlternates(trabajoSoloEs)`:
    - `hreflang` solo contiene `es` y `x-default`.
    - `canonicalByLocale.ca === canonicalByLocale.es === 'https://creativerent.es/trabajos/<slug>/'`.
- [ ] **Step 2:** `npx vitest run tests/unit` → FAIL.
- [ ] **Step 3:** Implementar el esquema con zod y los helpers.
  - Contenido de muestra con `ejemplo: true`: los 4 trabajos inventados de la maqueta («Fiesta mayor · Concierto en la plaza», «Jornada institucional», «Convención anual de empresa», «Congreso nacional») y los 12 clientes de la maqueta con logos de texto en SVG gris.
  - Las fotos de Unsplash ya descargadas están en `/tmp/claude-0/-home-user-Creative-/22f90702-5b94-5039-a9a1-60479d02a967/scratchpad/photos/` (`u-1587825140708…` para la portada, `u-1563841930606…`, `u-1531058020387…`, `u-1540575467063…` y `u-1511578314322…` para los trabajos). Se copian a `src/assets/ejemplo/`.
- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat: content collections, work visibility and translation fallback`.

### Task 3: Portada en 3 idiomas

**Files:**
- Create: `src/components/{Hero,ForBand,ServiceCards,RecentWorks,WorkCard,ClientMarquee,CtaBand}.astro`, `src/pages/index.astro`, `src/pages/ca/index.astro`, `src/pages/en/index.astro`, que comparten `src/views/Home.astro` con la prop `locale`
- Test: `tests/e2e/home.spec.ts`

**Interfaces:**
- Consumes: `visibleWorks`, `recentWorks`, `localizeWork`, `getCollection('servicios'|'clientes')`, `ajustes.json` (foto y textos de la portada).
- Produces: `WorkCard.astro` props `{ work: Trabajo; locale: Locale }` y `ServiceCards.astro` props `{ locale: Locale; servicios: Servicio[] }`, que reutiliza la Tarea 4.

Bloques y copy literales en castellano según §7 del spec. La maqueta de referencia está en `/tmp/claude-0/-home-user-Creative-/22f90702-5b94-5039-a9a1-60479d02a967/scratchpad/portada-combinada.html`: hay que reproducir su CSS con unidades normales (rem y clamp), no con las unidades `cqi` de la maqueta.
- Foto del hero con `<Image>` de Astro, `loading="eager"`, `fetchpriority="high"` y anchos 640/1280/1920.
- Carrusel: pista duplicada con `aria-hidden` en la copia, animación CSS de 40 s, `:hover` la pausa y `prefers-reduced-motion` la detiene.

- [ ] **Step 1: Write the failing e2e test** `tests/e2e/home.spec.ts` contra `npx astro preview` (Playwright, viewport 390×844 y 1440×900):
  - `/`, `/ca/` y `/en/` responden 200 y tienen exactamente un `h1`.
  - Con `SITE_ENV=preview` aparece el texto «Trabajos recientes» y 4 `.work-card`.
  - Con un build `SITE_ENV=production` (sin trabajos reales) no aparece «Trabajos recientes».
  - `document.documentElement.scrollWidth <= innerWidth` a 390 px.
  - Con `reducedMotion: 'reduce'`, `getComputedStyle(track).animationName === 'none'`.
  - El total de bytes transferidos en `/` es menor de 1 000 000 (suma de `transferSize` de `performance.getEntriesByType('resource')` más el documento).
- [ ] **Step 2:** `npx playwright test tests/e2e/home.spec.ts` → FAIL.
- [ ] **Step 3:** Implementar componentes y vistas.
- [ ] **Step 4:** Volver a ejecutar → PASS.
- [ ] **Step 5:** Commit `feat: homepage in es/ca/en`.

### Task 4: Servicios, trabajos, Crealuxe FX, contacto, calculadora, legales y 404

**Files:**
- Create: `src/views/{Servicios,Servicio,Trabajos,Trabajo,Crealuxe,Contacto,Calculadora,Legal}.astro`, las páginas por idioma en `src/pages/`, `src/pages/404.astro`, `src/components/{WorkFilters,ContactForm}.astro`, `src/content/legal/{aviso-legal,privacidad,cookies,accesibilidad}.{es,ca,en}.md`
- Test: `tests/e2e/pages.spec.ts`

**Interfaces:**
- Consumes: `WorkCard`, `ServiceCards`, `localizeWork`, `workAlternates`, `localizedPath`.
- Produces:
  - `ContactForm.astro` hace POST JSON a `/api/presupuesto` con los campos `{ nombre, organizacion, email, telefono, tipoEvento, fecha, lugar, asistentes, mensaje, privacidad: boolean, turnstileToken }`.
  - `tipoEvento` acepta: `'institucional'|'corporativo'|'congreso'|'fiesta-popular'|'otro'`.

Detalles:
- Trabajos: filtros por tipo de cliente y por servicio con botones (JS mínimo que oculta y muestra tarjetas; sin JS se ven todas). Si no hay trabajos, aparece el texto `t('trabajos.vacio')`.
- Calculadora: se lleva la lógica de `legacy/calculadora.html` a `Calculadora.astro` dentro de `Base`, con los tokens de la marca. La lógica de cálculo no cambia.
- Legales: un texto base con marcadores `[RAZÓN SOCIAL]`, `[CIF]` y `[DOMICILIO SOCIAL]`. Mientras sigan los marcadores, la página lleva `noindex`, y la Tarea 8 bloquea la publicación.

- [ ] **Step 1: Write the failing e2e test** `tests/e2e/pages.spec.ts`:
  - Cada URL de la tabla de la Tarea 1, más las 8 fichas de servicio y 1 ficha de trabajo, en los 3 idiomas, responde 200 y tiene un `h1` y un `<link rel="canonical">`.
  - `/no-existe/` responde 404 con enlaces a servicios, trabajos y contacto.
  - En `/trabajos/`, pulsar el filtro «Congresos» deja visibles solo las tarjetas con `data-tipo="congresos"`.
  - La calculadora da el mismo resultado que antes con una entrada fija (tomar un caso de `legacy/calculadora.html` y fijarlo en el test).
- [ ] **Step 2:** Ejecutar → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Ejecutar → PASS.
- [ ] **Step 5:** Commit `feat: inner pages, contact form UI, calculator and legal pages`.

### Task 5: Función del formulario de presupuesto

**Files:**
- Create: `src/lib/quote.ts`, `functions/api/presupuesto.ts`
- Test: `tests/unit/quote.test.ts`

**Interfaces:**
- Consumes: el payload de `ContactForm` (Tarea 4).
- Produces:
  - `validateQuote(input: unknown): { ok: true; data: Quote } | { ok: false; errors: Record<string,string> }`
  - `onRequestPost(ctx)`, que lee las variables `RESEND_API_KEY`, `TURNSTILE_SECRET`, `QUOTE_TO` (=`info@creativerent.es`) y `QUOTE_FROM` (=`web@creativerent.es`).
  - Respuestas: 200 `{ok:true}`, 400 `{ok:false, errors}` y 502 si falla el envío.

- [ ] **Step 1: Write the failing tests.** `validateQuote`:
  - Rechaza el `nombre` vacío.
  - Rechaza `email: 'no-es-email'`.
  - Rechaza un `mensaje` de 5001 caracteres.
  - Rechaza `privacidad: false`.
  - Rechaza la ausencia de `turnstileToken`.
  - Acepta un payload completo y recorta los espacios de los extremos.
  - Más un test de `onRequestPost` con `fetch` simulado: un token de Turnstile inválido → 400 sin llamar a Resend.
- [ ] **Step 2:** `npx vitest run tests/unit/quote.test.ts` → FAIL.
- [ ] **Step 3:** Implementar.
  - Verificación de Turnstile: POST a `https://challenges.cloudflare.com/turnstile/v0/siteverify`.
  - Envío: POST a `https://api.resend.com/emails`, con `reply_to` igual al email del cliente.
  - Sin almacenamiento.
- [ ] **Step 4:** Ejecutar → PASS.
- [ ] **Step 5:** Commit `feat: quote request function with validation and Turnstile`.

### Task 6: SEO y redirecciones

**Files:**
- Create: `src/lib/redirects.ts`, `scripts/build-redirects.ts` (se ejecuta en `prebuild` y escribe `public/_redirects`), `src/components/JsonLd.astro`
- Modify: `src/layouts/Base.astro` (hreflang, canonical, OG, JSON-LD)
- Test: `tests/unit/redirects.test.ts`, `tests/e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `localizedPath`, `workAlternates`.
- Produces: `redirectRules(): string[]`, con líneas del formato `"/antigua /nueva 301"` de Cloudflare `_redirects`.

- [ ] **Step 1: Write the failing tests.**
  - `redirectRules()` contiene, literalmente, todas las filas de la tabla de §9 del spec:
    - `/alquiler-de-material-audiovisual/ /servicios/alquiler-material-audiovisual/ 301`
    - `/project/* /trabajos/ 301`
    - `/feed/* / 301`
    - `/cookie-policy/ /cookies/ 301`
    - …el resto de filas.
  - Las reglas también existen sin la barra final, porque Cloudflare distingue `/x` de `/x/`.
  - e2e: `/` tiene `hreflang` es/ca/en/x-default y JSON-LD `LocalBusiness` con `telephone: '+34977199720'` y la dirección del spec.
  - e2e: una ficha de trabajo solo en castellano, vista en `/ca/`, no tiene `hreflang="ca"` y su canonical es la URL `es`.
  - e2e: `/sitemap-index.xml` existe y no incluye páginas `ejemplo` en el build de producción.
- [ ] **Step 2:** Ejecutar → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Ejecutar → PASS.
- [ ] **Step 5:** Commit `feat: SEO metadata, JSON-LD, sitemap and legacy redirects`.

### Task 7: Panel Sveltia CMS en `/admin`

**Files:**
- Create: `public/admin/index.html`, `public/admin/config.yml`
- Test: `tests/unit/cms-config.test.ts`

**Interfaces:**
- Consumes: los esquemas de la Tarea 2. Los nombres de los campos del panel coinciden exactamente con los del esquema zod.

Configuración:
- `backend: { name: github, repo: creativerent-maker/Creative-, branch: main, base_url: <URL del worker sveltia-cms-auth; marcador hasta tener la cuenta de Cloudflare> }`.
- `i18n: { structure: single_file, locales: [es, ca, en], default_locale: es }`.
- Media: `media_folder: src/assets/trabajos`, con transformación de imágenes raster a `webp`, `quality: 85`, `width: 2400` y `height: 2400`.
- Colecciones:
  - Trabajos: se pueden crear y borrar. El campo `ejemplo` está oculto.
  - Clientes.
  - Servicios: sin crear ni borrar.
  - Ajustes: archivo único `ajustes.json`.
- Etiquetas del panel en castellano llano: «Nuevo trabajo», «Fotos», «¿Mostrar en portada?».

- [ ] **Step 1: Write the failing test.** Parsear `config.yml` con `yaml` y comprobar:
  - Cada campo de la colección `trabajos` existe en el esquema de la Tarea 2 y al revés.
  - `servicios.create === false` y `servicios.delete === false`.
  - Existe la transformación `width: 2400`.
- [ ] **Step 2:** Ejecutar → FAIL.
- [ ] **Step 3:** Implementar.
- [ ] **Step 4:** Ejecutar → PASS.
- [ ] **Step 5:** Comprobación manual que queda pendiente hasta tener la cuenta: crear un trabajo desde Safari iOS y Chrome Android en menos de 2 min, con una foto de más de 4000 px que se guarde como WebP de 2400 px como máximo. Se anota en `docs/LANZAMIENTO.md`.
- [ ] **Step 6:** Commit `feat: Sveltia CMS admin for works, clients, services and settings`.

### Task 8: Controles de calidad, guía del propietario y vista previa

**Files:**
- Create: `tests/e2e/quality.spec.ts`, `README.md` (guía del propietario en castellano), `docs/LANZAMIENTO.md` (lista de lanzamiento, que incluye el procedimiento de dominio y email de §9 del spec como último paso con confirmación), `.github/dependabot.yml`
- Modify: `package.json` (scripts `test`, `test:e2e`, `build:prod`)

- [ ] **Step 1: Write the failing tests** `tests/e2e/quality.spec.ts`, que recorre todas las URLs del sitemap del build de preview:
  - Ningún texto visible contiene `/\b(boda|bodas|casament|wedding)s?\b/i`.
  - Ninguna página tiene `user-scalable=0`.
  - Toda `<img>` tiene un `alt`.
  - No hay enlaces internos rotos (cada `href` interno responde 200).
  - No hay scroll horizontal a 360 px.
  - El build de producción falla si algún legal contiene `[CIF]`: script `scripts/check-launch.ts` en `build:prod`.
- [ ] **Step 2:** Ejecutar → FAIL hasta corregir lo que salga.
- [ ] **Step 3:** Corregir, y escribir el README y `LANZAMIENTO.md`.
  - `LANZAMIENTO.md` lista lo que falta del propietario según §11 del spec, más las cuentas de Cloudflare y Resend a nombre de la empresa.
- [ ] **Step 4:** `npm test && npm run test:e2e` → todo PASS.
- [ ] **Step 5: Vista previa para el propietario.**
  - Publicar `dist/` (build preview) como artifact multi-archivo, con la herramienta Artifact y `files`, para que el propietario revise.
  - Avisar de que el formulario y `/admin` solo funcionarán en Cloudflare.
- [ ] **Step 6:** Commit `chore: quality checks, owner guide and launch checklist` y push a `claude/sleepy-galileo-9g51hh`.
