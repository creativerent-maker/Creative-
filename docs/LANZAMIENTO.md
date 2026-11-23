# Lista de lanzamiento de creativerent.es

Orden obligatorio. **El paso 5 (dominio y email) no se empieza sin la confirmación expresa del propietario.**

## 1. Cuentas, a nombre de la empresa
- [ ] **GitHub:** repositorio `creativerent-maker/Creative-` en **privado**. Añadir como colaboradores a quienes vayan a usar el panel.
- [ ] **Cloudflare:** cuenta de la empresa.
  - Crear un proyecto de Pages conectado al repositorio:
    - Rama de producción: `main`.
    - Comando de build: `npm run build`.
    - Carpeta de salida: `dist`.
    - Node 22.
  - Variables de entorno: las de la tabla del README.
  - Activar Web Analytics (sin cookies).
- [ ] **Turnstile:** crear un sitio para `creativerent.es` y `*.pages.dev` y copiar las claves.
- [ ] **Resend:** cuenta de la empresa. Verificar el dominio `creativerent.es`, lo que requiere añadir registros DNS (**se hace en el paso 5**). Mientras tanto, para probar se puede usar el remitente de pruebas de Resend.
- [ ] **Acceso al panel:**
  - Desplegar el worker [`sveltia-cms-auth`](https://github.com/sveltia/sveltia-cms-auth) en Cloudflare.
  - Crear una OAuth App en GitHub (callback: `https://<worker>/callback`).
  - Poner la URL del worker en `public/admin/config.yml` → `backend.base_url`.

## 2. Revisión del propietario en la URL de pruebas (`*.pages.dev`)
- [ ] Portada, servicios, trabajos, contacto, Crealuxe FX y calculadora, en los 3 idiomas.
- [ ] **Textos de los 8 servicios:** los ha redactado el desarrollador. El propietario confirma que todo lo que se dice es cierto (por ejemplo: grupos electrógenos, cubiertas de escenario, documentación para permisos).
- [ ] Revisión de las traducciones al catalán y al inglés.
- [ ] Prueba del panel desde **iPhone (Safari)** y **Android (Chrome)**:
  - Crear un trabajo con una foto de más de 4000 px en menos de 2 minutos.
  - Comprobar que se guarda como WebP de 2400 px como máximo y que aparece en la web.
- [ ] Prueba del formulario de presupuesto: llega a info@creativerent.es, con el email del cliente como dirección de respuesta.

## 3. Material real
- [ ] Foto de portada en horizontal, de 1920 px o más (Ajustes → Foto de portada).
- [ ] Al menos 4 trabajos recientes con fotos, subidos desde el panel.
- [ ] Logos de clientes con permiso (Clientes), en SVG o PNG transparente.
- [ ] **Borrar el contenido de ejemplo:**
  - `src/content/trabajos/ejemplo-*`
  - `src/content/clientes/ejemplo-*`
  - `src/assets/ejemplo/`
  - `src/assets/clientes/ejemplo-*`
- [ ] (Opcional) Sustituir la imagen para compartir en redes `public/brand/og-default.jpg` (1200×630) por una con foto propia.

## 4. Textos legales
- [x] Datos fiscales en los textos legales (Creative Rent, S.L.U. · B55562714 · C/ Campsrodons, nave 14, 43110 La Canonja), en los 3 idiomas.
- [ ] `npm run build:prod` termina sin errores. Este comando bloquea la publicación mientras queden datos pendientes.

## 5. Dominio y email: SOLO con confirmación expresa del propietario
Estado de los DNS consultado el 19/11/2026. **Volver a consultarlo antes de empezar.**
- creativerent.es:
  - DNS en Webempresa.
  - Registro A `213.158.86.115`.
  - **MX = `creativerent.es`**: el correo se entrega en el mismo servidor que la web antigua.
- El email **se queda en Webempresa**.

Pasos, en este orden:
1. [ ] Bajar el TTL de los registros a 300 s, 24 h antes.
2. [ ] Crear `mail.creativerent.es` → A `213.158.86.115` y cambiar el MX a `mail.creativerent.es`.
   - Comprobar que se envía y se recibe correo.
   - **No seguir si el correo no funciona.**
3. [ ] Añadir la zona `creativerent.es` a Cloudflare y copiar **todos** los registros existentes: MX, SPF, DKIM, webmail, autodiscover, etc.
   - Comparar uno a uno con los de Webempresa.
   - Añadir al SPF el include de Resend y los registros de verificación de Resend.
4. [ ] Cambiar los servidores de nombres en el registrador a los de Cloudflare.
5. [ ] En Pages → Custom domains, añadir `creativerent.es`, que es la versión principal, y `www.creativerent.es`.
   - Añadir una regla de redirección 301 de `www` → `creativerent.es`.
6. [ ] Comprobar:
   - Correo entrante y saliente.
   - https://creativerent.es.
   - Las redirecciones antiguas, por ejemplo `/mapping/` y `/project/...`.
   - El formulario de presupuesto.
7. [ ] Google Search Console: verificar el dominio y enviar `https://creativerent.es/sitemap-index.xml`.
8. [ ] creativerent.net (cuando el acuerdo del Kit Digital lo permita, y con acceso al dominio):
   - Redirección 301 de todas sus URLs a creativerent.es.
   - `/fx` → `/crealuxe-fx/`.
   - `/gracias` → `/contacto/`.
   - Las demás, a su equivalente o a `/`.
9. [ ] Dar de baja el WordPress antiguo en Webempresa, **manteniendo el plan de correo**.
