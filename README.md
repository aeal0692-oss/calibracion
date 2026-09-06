# Calibración

Programa de ocho semanas sobre autoimagen, con una práctica guiada de 12 minutos al día.
Una sola página, sin servidor, sin cuenta, sin analítica.

Basado en *Psycho-Cybernetics* de Maxwell Maltz (1960) más investigación posterior en
ensayo mental, efecto reflector (Gilovich) y autocompasión (Neff).

> Material de trabajo personal, no terapia. Si lo que aparece es más pesado que un
> problema de confianza, eso se trabaja acompañado, con un profesional.

## Usarla en el celular

1. Abre la URL de GitHub Pages del repo en el navegador del teléfono.
2. **Android / Chrome:** menú ⋮ → *Agregar a pantalla principal*.
   **iPhone / Safari:** botón compartir → *Añadir a pantalla de inicio*.
3. Ábrela desde el icono. Corre a pantalla completa y funciona sin internet.

Durante la sesión de 12 minutos la app pide mantener la pantalla encendida
(`Screen Wake Lock`), así que el teléfono no se apaga a medio ejercicio.
En navegadores que no soportan esa API, sube el tiempo de apagado de pantalla a mano.

## Dónde se guarda el avance

Todo —días marcados, racha y lo que escribes en cada semana— vive en el
`localStorage` del navegador que usaste. **No se sincroniza ni sube a ningún lado.**
Consecuencias prácticas:

- Cada dispositivo lleva su propio avance.
- Si borras datos del sitio, desinstalas la app o usas modo incógnito, se pierde.
- El texto de tu diario nunca sale del teléfono.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa: contenido, estilos y lógica |
| `sw.js` | Service worker; permite abrirla sin señal |
| `manifest.webmanifest` | Metadatos de instalación (nombre, iconos, color) |
| `icons/` | Iconos de la app |

## Editar el contenido

Las ocho semanas son un arreglo `SEMANAS` al principio del `<script>` en `index.html`.
Cada entrada tiene `titulo`, `premisa`, `concepto[]`, `escrito{}`, `accion` y `guion[]`
(las líneas que aparecen durante la sesión). Cambia el texto ahí y haz commit.

Después de publicar un cambio, la app instalada puede tardar una carga en actualizarse;
si no aparece, súbele la versión al `CACHE` en `sw.js`.

## Correr en local

Necesita un servidor (el service worker no funciona con `file://`):

```
python -m http.server 8000
```

Y abre `http://localhost:8000`.
