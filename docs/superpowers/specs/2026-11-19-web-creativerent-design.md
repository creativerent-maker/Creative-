# Web nueva de Creative Rent (creativerent.es): diseño

Fecha: 19/11/2026 · Estado: pendiente de aprobación

## 1. Intención

Creative Rent es una empresa de servicios audiovisuales de La Canonja (Tarragona). Hoy tiene dos webs:

- **creativerent.es**: WordPress 5.4 y Divi 4.4 de 2020, sin actualizar. Carga 39 MB en móvil, el último trabajo publicado es de 2019, no tiene textos legales y el banner de cookies no cumple la normativa.
- **creativerent.net**: hecha por BeeDIGITAL con el Kit Digital. Es genérica, sin fotos ni trabajos.

Las dos compiten entre sí en Google.

Se sustituyen por **una sola web en creativerent.es**. La web tiene que dejar claro **qué hace la empresa y para quién**, y transmitir **seriedad y profesionalidad**.

**Público principal:** técnicos de ayuntamientos, instituciones públicas, empresas y centros de congresos, que llegan buscando un proveedor audiovisual fiable.

**Lo que tiene que conseguir:** que esos visitantes pidan presupuesto, por formulario, teléfono o WhatsApp.

## 2. Objetivos, fuera de alcance y lo que no debe pasar

**Objetivos**
- Que en 5 segundos se entienda qué hace Creative Rent (sus 8 servicios) y para quién (los 4 tipos de cliente).
- Que pedir presupuesto sea fácil desde cualquier página.
- Que el propietario pueda **añadir trabajos con fotos desde el móvil** sin ayuda técnica.
- Rendimiento alto. La portada pesa menos de 1 MB en la primera carga. En móvil 4G, el elemento principal tarda menos de 2 s en mostrarse (LCP < 2 s). Lighthouse da 95 o más en rendimiento, accesibilidad, buenas prácticas y SEO.
- Web en tres idiomas: **castellano** (principal), **catalán** e **inglés**.
- Cumplimiento legal en España: LSSI, RGPD y la normativa de cookies (guía de la AEPD). Accesibilidad WCAG 2.1 AA.
- **No perder posicionamiento** en Google: redirecciones 301 desde las URLs antiguas del .es y desde el .net.

**Fuera de alcance (por ahora)**
- Catálogo de equipos con precios. El propietario no lo tiene acabado. Se deja preparado un hueco en la estructura (§6), pero sin páginas publicadas.
- Tienda online y reservas de material.
- Blog o noticias.

**Lo que no debe pasar**
- **No se menciona en ninguna parte: bodas, celebraciones privadas ni eventos particulares.** No son su mercado.
- Que se publique contenido de ejemplo (trabajos inventados, fotos de banco de imágenes, logos de muestra).
- Que la web vuelva a quedar abandonada: si necesita actualizaciones constantes de plugins o un servidor que mantener, el proyecto ha fracasado.
- **Que se corte el email @creativerent.es durante el cambio de dominio** (§9).
- Fechas que hagan parecer la web desactualizada. En la portada no salen fechas de trabajos antiguos.

## 3. Restricciones

- **Manual de marca** (`MANUAL_DE_MARCA_CREATIVE_RENT.pdf`, hecho por Brandoon):
  - Colores: naranja principal `#f26241` (Pantone 171C), azul secundario `#313151` (533C) y magenta `#ff4158` (1787C), este último **solo en degradados con el naranja**.
  - Logo: horizontal y vertical. Las versiones en negativo mantienen el naranja y pasan el azul a blanco. Hay que respetar el área de seguridad y no deformar el logo.
  - Tipografías: **Amplesoft Pro** (de pago, de Fontfabric) para titulares y **Roboto** para el texto.
  - Se puede extraer el logo en vectorial de la página 5 del PDF con `pdftocairo -svg`. Mejor aún si el propietario pasa los archivos originales.
- **Datos de contacto:**
  - Teléfono fijo 977 199 720.
  - Móvil y WhatsApp 639 654 816.
  - Email info@creativerent.es.
  - Dirección: C/ Campsrodons, nave 14, 43110 La Canonja (Tarragona). Es la de las tarjetas de visita y la tiene que confirmar el propietario (§11).
- **Crealuxe FX** es otra empresa del propietario, de material de efectos especiales, con web propia en https://www.crealuxefx.com. Aparece como empresa hermana.
- Repositorio: `creativerent-maker/Creative-`. Ya contiene `index.html`, una calculadora de distancia de proyección que pasa a formar parte de la web (§6).
- La persona que edita no es técnica y trabajará sobre todo **desde el móvil**.

## 4. Enfoques considerados

| Enfoque | Ventajas | Inconvenientes |
|---|---|---|
| **1. Web estática con un panel de edición basado en Git (elegido)** | Muy rápida y segura, sin servidor ni plugins que mantener. Alojamiento gratuito o casi. Panel accesible desde el navegador del móvil. | El panel solo sirve para contenido (trabajos, textos, fotos). Los cambios de diseño los hace un desarrollador. |
| 2. WordPress nuevo | App móvil oficial y plataforma conocida. | Necesita actualizaciones constantes y hosting de pago, y es más lento. Es lo que llevó a la web actual al abandono. |
| 3. Publicación automática desde Telegram o Google Drive | No hace falta abrir ningún panel. | Poco control sobre textos y selección de fotos, y más piezas que pueden fallar. Se puede añadir más adelante encima del enfoque 1. |

**El propietario eligió el enfoque 1.**

## 5. Decisiones de cómo se construye

Las marcadas con *(propuesta)* son decisiones técnicas que no ha tomado el propietario. Se pueden cambiar si hay un motivo de peso.

- **Generador:** Astro, con salida 100 % estática. Usa su sistema de imágenes (sharp) para generar AVIF y WebP en varios tamaños. *(propuesta)*
- **Panel de edición:** Sveltia CMS, compatible con la configuración de Decap y pensado para usarse bien en móvil. Está en `/admin` y guarda los cambios como commits en el repositorio de GitHub. Cada commit vuelve a generar la web automáticamente en 1-2 min. *(propuesta)*
  - Para entrar al panel hace falta una cuenta de GitHub con acceso al repositorio. La autenticación OAuth se hace con el worker oficial `sveltia-cms-auth` en Cloudflare.
- **Alojamiento:** Cloudflare (sitio estático), con despliegue automático desde la rama principal y vistas previas de cada rama. *(propuesta)*
  - Para servir el dominio sin `www` (§9.6), Cloudflare necesita gestionar los **DNS de creativerent.es**. Por eso el traslado de los DNS a Cloudflare forma parte del plan, no es opcional. Se copian todos los registros actuales y el registrador sigue siendo el mismo; solo cambian los servidores de nombres.
- **Titularidad de las cuentas** *(propuesta)*:
  - Todas las cuentas van **a nombre del propietario**: GitHub, Cloudflare y el proveedor de envío de email. El desarrollador trabaja con acceso delegado. Así la web no depende de nadie si cambia el desarrollador.
  - El repositorio es **privado**, para que no se vean trabajos sin publicar ni logos sin permiso.
- **Mantenimiento** *(propuesta)*:
  - Las dependencias se fijan a versiones concretas y se actualizan automáticamente con Dependabot o Renovate, con revisión de una persona.
  - Se incluye un `README` breve para el propietario: cómo añadir un trabajo, cómo cambiar teléfonos y a quién llamar si algo falla.
  - Al tratarse de una web estática, si nadie la toca sigue funcionando y no se vuelve insegura.
- **Formulario de presupuesto:** función en el propio alojamiento (Cloudflare) que envía el mensaje a info@creativerent.es. Lleva protección anti-spam con Cloudflare Turnstile, que no usa cookies. No se guarda nada en una base de datos. *(propuesta)* El proveedor de envío de email queda a elección del desarrollador (§10).
- **Analítica:** Cloudflare Web Analytics, que no usa cookies. *(propuesta)*
  - Como así no hay cookies que no sean técnicas, **no hace falta un banner de consentimiento**. Basta con la política de cookies en el pie.
  - Si en el futuro se añade Google Analytics o un píxel de redes sociales, habrá que poner un banner con los botones «Aceptar» y «Rechazar» al mismo nivel.
- **Tipografía de titulares:** Amplesoft Pro si el propietario tiene la licencia web (§11). Si no, **Exo 2** (Google Fonts, alojada en la propia web), que es la de las maquetas aprobadas. Roboto se aloja también en la propia web, en formato WOFF2 y solo con los pesos que se usan.

## 6. Estructura de la web

Las URLs están en castellano y sin tildes. El catalán va bajo `/ca/` y el inglés bajo `/en/`, con los slugs traducidos.

| Página | URL (es) | Contenido |
|---|---|---|
| Inicio | `/` | Ver §7 (aprobada). |
| Servicios | `/servicios/` | Las 8 tarjetas de servicio. |
| Ficha de servicio (×8) | `/servicios/<slug>/` | Qué incluye, para qué tipo de actos, 3-4 trabajos relacionados y botón de presupuesto. |
| Trabajos | `/trabajos/` | Cuadrícula filtrable por tipo de cliente (ayuntamientos, instituciones, empresas, congresos) y por servicio. Ordenada por fecha, de más reciente a más antigua. |
| Ficha de trabajo | `/trabajos/<slug>/` | Título, lugar, año, tipo de cliente, servicios, texto breve y galería de fotos. |
| Crealuxe FX | `/crealuxe-fx/` | Página breve: qué es (efectos especiales), qué material tiene y enlace a crealuxefx.com. |
| Contacto | `/contacto/` | Formulario de presupuesto, teléfonos, WhatsApp, email, dirección y mapa enlazado (no incrustado, para no cargar cookies de terceros). |
| Calculadora de proyección | `/herramientas/calculadora-proyeccion/` | El `index.html` actual, adaptado al diseño de la web. |
| Aviso legal | `/aviso-legal/` | Textos legales (§10). |
| Política de privacidad | `/privacidad/` | Ídem. |
| Política de cookies | `/cookies/` | Ídem. |
| Declaración de accesibilidad | `/accesibilidad/` | Ídem. |
| Página de error 404 | — | Con enlaces a servicios, trabajos y contacto. |

**Los 8 servicios** (nombre y frase corta de la portada aprobada):
1. Alquiler de material audiovisual: sonido, iluminación, vídeo y proyección.
2. Pantallas LED: interior y exterior, a medida del espacio.
3. Streaming y eventos híbridos: retransmisión, grabación multicámara y conexiones remotas.
4. Infraestructura: escenarios, estructuras, tarimas y energía.
5. Producción completa: un único responsable técnico de principio a fin.
6. Mapping: proyección sobre fachadas, blending y warping.
7. Postproducción y contenidos: filmación, edición y vídeos para el evento.
8. Personal técnico: técnicos de sonido, luces, vídeo y realización.

**Menú principal:** Servicios (desplegable con los 8) · Trabajos · Crealuxe FX · Contacto · selector ES / CA / EN · botón «Pedir presupuesto».

**Catálogo (futuro):** no se publica nada, pero se reserva `/catalogo/` en el diseño de la navegación y del modelo de contenido, para añadirlo sin rehacer la web.

## 7. Portada (aprobada)

Maqueta aprobada: https://claude.ai/artifact/1rMSq8HRDYeK5u7DBhASgS (versión 3). Bloques, de arriba abajo:

1. **Cabecera:** logo horizontal, menú, selector de idioma y botón naranja «Pedir presupuesto».
2. **Foto a todo ancho** de un montaje propio, con un velo azul degradado de izquierda a derecha. Encima:
   - Antetítulo: «Servicios audiovisuales · Tarragona».
   - Titular: «Técnica audiovisual fiable para actos que no pueden fallar».
   - Subtítulo: «Ayuntamientos, instituciones, empresas y centros de congresos confían en nuestro equipo…».
   - Botones «Pedir presupuesto» y «Ver trabajos».
3. **Franja azul «Trabajamos para»:** Ayuntamientos · Instituciones públicas · Empresas · Centros de congresos.
4. **«Qué hacemos»:** 8 tarjetas de servicio con una barrita naranja, título y frase. Cada tarjeta enlaza a su ficha.
5. **«Trabajos recientes»:** los 4 últimos trabajos (foto, título y una línea con el tipo de cliente y los servicios), más el enlace «Ver todos los trabajos».
6. **«Han confiado en nosotros»:** logos de clientes en **una sola fila que se desplaza sola** (carrusel continuo).
   - Se para al pasar el ratón por encima.
   - Los bordes se difuminan.
   - Queda quieto si el usuario tiene activada la opción de reducir el movimiento.
   - Los logos van en gris y se gestionan desde el panel.
7. **Bloque de presupuesto** con degradado magenta → naranja: «¿Tienes un acto en preparación?», botón «Pedir presupuesto» y botón «WhatsApp 639 654 816».
8. **Pie** azul: logo en negativo, «Servicios audiovisuales profesionales.», datos de contacto, enlaces a servicios, trabajos, Crealuxe FX y textos legales.

Las fotos y los logos de la maqueta son de muestra y no se publican.

En móvil, los bloques se apilan en una columna y el menú pasa a ser un botón de hamburguesa. El botón «Pedir presupuesto» y el de WhatsApp quedan accesibles. El desarrollador decide el diseño exacto en móvil, manteniendo la jerarquía de la versión de escritorio.

## 8. Contenido editable desde el panel (`/admin`)

| Colección | Campos | Notas |
|---|---|---|
| **Trabajos** | Título (es obligatorio; ca y en opcionales), fecha, lugar, tipo de cliente (uno de los 4), servicios (varios de los 8), texto breve (por idioma), foto de portada, galería, «destacado en portada» (sí/no), publicado (sí/no) | Es el uso principal desde el móvil. Las fotos se suben desde el carrete y se redimensionan antes de guardarlas en el repositorio (máximo 2400 px en el lado largo) para que el repositorio no crezca demasiado. |
| **Clientes** | Nombre, logo (SVG o PNG), enlace opcional, orden | Alimenta el carrusel. |
| **Servicios** | Título, frase corta, texto, foto (por idioma) | Hay 8 fijos: se pueden editar, pero no crear ni borrar desde el panel. |
| **Ajustes** | Teléfonos, email, dirección, foto y textos de la portada, enlace a Crealuxe FX | |

**Traducciones:** el castellano es obligatorio. Si un trabajo no tiene traducción al catalán o al inglés, en esos idiomas se muestra igualmente con el texto en castellano. No se generan páginas vacías.

**Trabajo publicado en catalán o inglés sin traducir:** su página no lleva `hreflang` para ese idioma y su URL canónica apunta a la versión en castellano, para que Google no la vea como contenido duplicado.

**Panel en móvil:** el flujo «Nuevo trabajo → fotos → publicar» debe completarse en menos de 2 minutos en un móvil. Hay que probarlo en iOS Safari y Android Chrome antes de entregar.

## 9. Migración, dominio y email

**Estado actual de los dominios (consultado el 19/11/2026)**

**creativerent.es**
- DNS en Webempresa (`ns1221/ns1222.webempresa.eu`).
- El registro A apunta a `213.158.86.115`, que es el hosting de Webempresa.
- El **registro MX apunta a `creativerent.es`, es decir, al mismo servidor que la web**.
- SPF: `ip4:213.158.86.115 include:_spf.webempresa.eu …`.

**creativerent.net**
- DNS en `tpiol.com`. El registro A apunta a `52.59.120.70` (la web de BeeDIGITAL).
- El registro MX apunta a `smtp-02.servidoresdns.net`.

**Consecuencia:** si se cambia el registro A de creativerent.es al nuevo alojamiento sin hacer nada más, **el correo dejará de llegar**, porque el MX apunta a ese mismo nombre.

**Regla del propietario: el dominio se toca solo al final y con su confirmación.**
- Se prepara y se prueba todo en una URL de pruebas: la web, el panel, el formulario y las redirecciones.
- No se modifica ningún registro DNS, servidor de nombres, MX, hosting ni configuración de creativerent.es ni de creativerent.net hasta que el propietario lo confirme de forma explícita, justo antes de publicar.
- El cambio de dominio es **el último paso de la publicación**.

**Pasos obligatorios, en este orden** (los pasos 2 a 6 solo después de esa confirmación):
1. El email **se queda en Webempresa** (decidido por el propietario). Se mantiene ese hosting solo para el correo.
2. Cambiar el MX a un nombre de servidor propio de Webempresa (por ejemplo `mail.creativerent.es`, con su registro A a `213.158.86.115`). Comprobar que se envía y se recibe correo **antes** de mover la web.
3. Mantener el registro SPF existente y revisar DKIM y DMARC. Añadir al SPF el proveedor que envíe los emails del formulario.
4. Bajar el TTL de los registros 24 h antes del cambio.
5. Publicar la web nueva en una URL de pruebas. Cuando el propietario la apruebe, añadir la zona de creativerent.es a Cloudflare y copiar **todos** los registros existentes (MX, SPF, DKIM, los de webmail, etc.). Comprobar que coinciden y después cambiar los servidores de nombres en el registrador. Por último, conectar `creativerent.es` y `www` al sitio.
6. La versión principal es `https://creativerent.es` (sin `www`). `www` redirige con 301.

**Redirecciones 301 desde la web antigua del .es**

| Antigua | Nueva |
|---|---|
| `/alquiler-de-material-audiovisual/` | `/servicios/alquiler-material-audiovisual/` |
| `/alquiler-de-infraestructura/` | `/servicios/infraestructura/` |
| `/produccion-completa/` | `/servicios/produccion-completa/` |
| `/mapping/` | `/servicios/mapping/` |
| `/post-produccion/` | `/servicios/postproduccion/` |
| `/personal-tecnico/` | `/servicios/personal-tecnico/` |
| `/trabajos-realizados/` | `/trabajos/` |
| `/contacto/` | `/contacto/` |
| `/cookie-policy/` | `/cookies/` |
| `/project/<slug>/` | `/trabajos/` |
| `/feed/`, `/comments/feed/`, `/category/*`, `/author/*`, `/?attachment_id=*` | `/` |

**creativerent.net**
- Cuando se pueda (§11), redirige con 301 URL a URL a sus equivalentes en creativerent.es.
- `/fx` → `/crealuxe-fx/`.
- `/gracias` → `/contacto/`.
- El resto → la página equivalente o, si no hay, `/`.

**Trabajos antiguos: no se migran** (decidido por el propietario). Los 57 trabajos de 2012 a 2019 se han quedado desfasados técnicamente. Todos los `/project/<slug>/` redirigen con 301 a `/trabajos/`.

**Requisito para publicar:** como la web arranca sin trabajos antiguos, antes del lanzamiento el propietario sube desde el panel **al menos 4 trabajos recientes con fotos reales**, que son los que salen en la portada. Si al acabar la web aún no hay 4, se publica igualmente: el bloque «Trabajos recientes» se oculta automáticamente mientras haya menos de 4 trabajos publicados, y la página `/trabajos/` muestra los que haya.

## 9 bis. Calendario

No hay fecha límite, pero el propietario no quiere que el proyecto se alargue. Se publica todo junto (los tres idiomas), sin fases, y se evita ampliar el alcance durante la construcción: lo que surja nuevo se apunta para después del lanzamiento.

Orden de trabajo:
1. Web y panel en la URL de pruebas, con material de muestra.
2. Revisión del propietario.
3. Material real (fotos, logos y al menos 4 trabajos).
4. Textos legales con sus datos fiscales.
5. Confirmación del propietario y cambio de dominio, como último paso.

## 10. Lo que queda a criterio del desarrollador

- Estructura interna del proyecto Astro, componentes y nombres de archivos.
- Proveedor de envío de los emails del formulario (por ejemplo, Resend o MailChannels), siempre que respete el SPF y el RGPD.
- Diseño exacto en móvil y tablet, iconos y microinteracciones (con moderación y respetando la opción de reducir el movimiento).
- Redacción final de los textos de las páginas de servicio, partiendo de los de las dos webs actuales. **Las traducciones al catalán y al inglés las redacta el desarrollador y las revisa el propietario.**
- Textos legales. Se redactan con los datos fiscales de la empresa (razón social, CIF y domicilio social), que hay que pedir al propietario. El responsable del tratamiento es la empresa. El formulario lleva una casilla de aceptación de la política de privacidad, sin marcar por defecto.
- Datos estructurados: `LocalBusiness` con dirección, teléfonos y horario si se facilita; `Service` para cada servicio; `BreadcrumbList`.
- Imagen para compartir en redes (Open Graph) por página.
- Mientras no lleguen los archivos reales: logos de clientes y fotos de muestra **solo en la URL de pruebas**, nunca en producción. Antes de publicar, el desarrollador entrega al propietario una lista concreta del material necesario.

## 11. Pendiente del propietario

1. **Kit Digital:** ¿el acuerdo con BeeDIGITAL obliga a mantener creativerent.net activo hasta alguna fecha? Esto marca cuándo se puede redirigir.
2. **Licencia web de Amplesoft Pro:** ¿la tienen? Si no, se usa Exo 2.
3. **Material:** foto de portada en horizontal, al menos 4 trabajos recientes con fotos, logos de clientes (con permiso para mostrarlos) y logo de la empresa en vectorial.
4. **Datos fiscales** para los textos legales, y confirmación de la dirección (C/ Campsrodons, nave 14).
5. **Cuenta de GitHub** de cada persona que vaya a usar el panel.
6. **Accesos** (solo se necesitan en el paso final): ¿quién puede entrar al panel de Webempresa y al registrador de creativerent.es? ¿creativerent.net está registrado a nombre de la empresa o lo controla BeeDIGITAL?
