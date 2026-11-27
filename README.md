# Web de Creative Rent (creativerent.es)

Web de Creative Rent en castellano, catalán e inglés, alojada en **Webempresa** (el mismo hosting de siempre). Es una web estática: no hay base de datos ni plugins que actualizar. Cada cambio que se guarda en el panel vuelve a generar la web y la sube a Webempresa automáticamente en 2 o 3 minutos.

## Para el día a día (sin conocimientos técnicos)

### Entrar al panel
1. Abre **https://creativerent.es/admin/** en el móvil o en el ordenador.
2. Pulsa **«Sign In Using Access Token»** y pega tu clave de acceso de GitHub. Solo hay que hacerlo la primera vez en cada dispositivo.
   - La clave se crea una vez en GitHub: *Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token*, con acceso solo al repositorio `Creative-` y permiso **Contents: Read and write**. Guárdala en un lugar seguro y no la compartas.

### Añadir un trabajo desde el móvil
1. En el panel, entra en **Trabajos** y pulsa **«Nuevo trabajo»**.
2. En **Castellano**, escribe el título y un texto corto: qué se hizo, en qué espacio y qué servicios se dieron.
3. Rellena la fecha y el lugar, y elige el **tipo de cliente** y los **servicios**.
4. En **Foto principal**, pulsa y elige una foto del carrete. Mejor en horizontal. La foto se reduce sola, no hace falta prepararla.
5. Si quieres, añade más fotos en **Más fotos**.
6. **Catalán e inglés son opcionales.** Si los dejas vacíos, el trabajo se muestra en castellano en esas versiones de la web.
7. Pulsa **«Guardar»**. En 1 o 2 minutos el trabajo aparece en la web.

En la portada salen los **4 trabajos más recientes**. Si marcas **«¿Mostrar en portada?»** en un trabajo, sale el primero aunque sea antiguo. Mientras haya menos de 4 trabajos, el bloque «Trabajos recientes» no aparece en la portada.

Para que un trabajo deje de verse sin borrarlo, desmarca **«¿Publicado?»**.

### Otros cambios que puedes hacer
- **Clientes:** los logos del carrusel. Sube solo logos de clientes que hayan dado permiso.
- **Servicios:** los textos de los 8 servicios. No se pueden crear ni borrar servicios.
- **Ajustes:** teléfonos, email, dirección y foto de portada.

### Lo que no se cambia desde el panel
El diseño, el menú, los textos fijos de las páginas y los textos legales. Para eso hace falta un desarrollador.

### Si algo falla
- Si un cambio no aparece después de 5 minutos, puede que la publicación haya fallado. Normalmente la causa es un campo obligatorio vacío o una foto dañada. En GitHub, pestaña **Actions → Publicar web**, se ve el error. La web anterior sigue publicada mientras tanto, así que nunca se queda caída.
- Contacto técnico: _(rellenar con la persona que mantenga la web)_.

---

## Para desarrolladores

**Stack:**
- Astro (sitio estático) con TypeScript.
- Contenido en `src/content/` (JSON), editado con Sveltia CMS en `/admin` (acceso con clave personal de GitHub).
- Formulario de presupuesto: `public/api/presupuesto.php` (PHP ≥ 8.1, `mail()` del hosting), con campo trampa, tiempo mínimo y límite de 5 envíos por IP y hora.
- Alojamiento en Webempresa. `astro.config.ts` genera `.htaccess` (https, sin www, redirecciones de la web antigua, 404 y caché) y `robots.txt`.
- Publicación: `.github/workflows/publicar.yml` construye y sube `dist/` por FTPS en cada cambio de `main`.

```bash
npm install
npm run dev          # http://localhost:4321
npm test             # tests unitarios
npm run test:e2e     # tests en navegador (genera builds de pruebas y de producción)
npm run build        # build de pruebas (incluye el contenido de ejemplo)
npm run build:prod   # build de producción: falla si quedan datos pendientes (ver docs/LANZAMIENTO.md)
```

**Estructura:**

| Ruta | Contenido |
|---|---|
| `src/i18n/` | Rutas por idioma (`routes.ts`) y textos de interfaz (`ui.ts`). |
| `src/content/` | Trabajos, servicios, clientes, ajustes y textos legales. |
| `src/views/` | Una vista por tipo de página. `src/pages/[...route].astro` genera todas las páginas interiores en los 3 idiomas. |
| `src/lib/` | Lógica pura, con tests: selección de trabajos, SEO, redirecciones, validación del formulario y cálculo de proyección. |
| `public/admin/config.yml` | Configuración del panel. Los nombres de los campos deben coincidir con `src/content.config.ts`; lo comprueba un test. |

**Contenido de ejemplo:**
- Los trabajos y clientes con `"ejemplo": true` y la foto de portada en `src/assets/ejemplo/` solo salen en los builds de pruebas.
- Con `SITE_ENV=production` no se publican.
- Antes del lanzamiento hay que borrarlos del repositorio.

**Tipografía:** los titulares usan Exo 2. Si se consigue la licencia web de Amplesoft Pro, basta con añadir sus WOFF2 y cambiar `--font-display` en `src/styles/tokens.css`.

**Publicación (GitHub → Settings → Secrets and variables → Actions):**

| Nombre | Tipo | Valor |
|---|---|---|
| `FTP_SERVER` | Secreto | Servidor FTP de Webempresa |
| `FTP_USERNAME` | Secreto | Usuario FTP |
| `FTP_PASSWORD` | Secreto | Contraseña FTP |
| `FTP_DIR_PRUEBAS` | Secreto | Carpeta del subdominio de pruebas, terminada en `/` |
| `FTP_DIR_PRODUCCION` | Secreto | Carpeta de creativerent.es (`public_html/`), terminada en `/` |
| `DESTINO` | Variable | `pruebas` (por defecto) o `produccion`. **Solo se cambia a `produccion` con la confirmación del propietario.** |

En modo `pruebas` se publica el build de pruebas (con contenido de ejemplo, `noindex` y `robots.txt` que bloquea a los buscadores).

La calculadora de proyección original está en `legacy/calculadora.html`, solo como referencia. La versión publicada está en `src/views/Calculadora.astro`.
