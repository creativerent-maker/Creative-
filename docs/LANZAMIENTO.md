# Lista de lanzamiento de creativerent.es (hosting Webempresa)

Orden obligatorio. **El paso 5 (sustituir la web actual) no se empieza sin la confirmación expresa del propietario.**

El dominio, las DNS y el correo **no se tocan**: la web nueva se publica en el mismo hosting de Webempresa donde está hoy creativerent.es.

## 1. Preparación (propietario, con ayuda)
- [ ] **Rama principal:** crear `main` a partir de la rama de trabajo. La publicación automática y el panel trabajan sobre `main`.
- [ ] **Subdominio de pruebas** en el panel de Webempresa, por ejemplo `nueva.creativerent.es`, con su certificado SSL (normalmente se activa solo). Apuntar la carpeta que crea Webempresa para él.
- [ ] **Secretos de publicación** en GitHub (*Settings → Secrets and variables → Actions*): `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_DIR_PRUEBAS` y `FTP_DIR_PRODUCCION`. **Nunca se envían por chat ni por email.**
- [ ] **Variable** `DESTINO` = `pruebas`.
- [ ] **PHP 8.1 o superior** en el hosting (se elige en el panel de Webempresa).
- [ ] **Clave de acceso al panel**: cada persona que vaya a editar crea su clave personal de GitHub (ver README).

## 2. Prueba en el subdominio
- [ ] La publicación automática (GitHub → Actions → *Publicar web*) termina en verde y la web se ve en el subdominio.
- [ ] Portada, servicios, trabajos, contacto, Crealuxe FX y calculadora, en los 3 idiomas.
- [ ] **Formulario:** enviar una solicitud de prueba. Llega a info@creativerent.es y, al responder, va al email del cliente. Si llega a spam, revisar el SPF del dominio con Webempresa.
- [ ] **Panel desde el móvil**, en iPhone (Safari) y Android (Chrome):
  - Crear un trabajo con una foto de más de 4000 px en menos de 2 minutos.
  - Comprobar que se guarda como WebP de 2400 px como máximo y que aparece en el subdominio en 2 o 3 minutos.
  - Editar un servicio y un cliente sin errores.
- [ ] **Textos de los 8 servicios:** los ha redactado el desarrollador. El propietario confirma que todo lo que se dice es cierto (por ejemplo: grupos electrógenos, cubiertas de escenario, documentación para permisos).
- [ ] Revisión de las traducciones al catalán y al inglés.

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
- [ ] `npm run build:prod` termina sin errores.

## 5. Sustituir la web actual: SOLO con confirmación expresa del propietario
1. [ ] **Copia de seguridad completa del WordPress actual** desde el panel de Webempresa (archivos y base de datos). Guardarla fuera del hosting.
2. [ ] Retirar el WordPress de `public_html/`, moviéndolo a una carpeta de copia fuera de la web pública. **No tocar nada del correo** (buzones, MX, DNS).
3. [ ] Cambiar la variable `DESTINO` a `produccion` y lanzar *Publicar web* desde GitHub → Actions.
4. [ ] Comprobar:
   - https://creativerent.es y https://www.creativerent.es (debe redirigir a la versión sin www).
   - Las direcciones antiguas: `/mapping/`, `/project/...`, `/trabajos-realizados/`.
   - El formulario de presupuesto.
   - Que el correo sigue entrando y saliendo con normalidad.
5. [ ] Google Search Console: verificar el dominio y enviar `https://creativerent.es/sitemap-index.xml`.
6. [ ] Retirar el subdominio de pruebas, o dejarlo como zona de pruebas.
7. [ ] creativerent.net (cuando el acuerdo del Kit Digital lo permita, y con acceso al dominio):
   - Redirección 301 de todas sus URLs a creativerent.es.
   - `/fx` → `/crealuxe-fx/`.
   - `/gracias` → `/contacto/`.
   - Las demás, a su equivalente o a `/`.
8. [ ] Pasadas unas semanas sin incidencias, borrar la copia del WordPress del hosting, conservando la copia externa.
