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

Para eso está **«Descargar respaldo»** abajo: baja todo en un `.json`. **«Restaurar
respaldo»** lo vuelve a meter, y **combina en vez de reemplazar** — nada se borra. Los
enunciados se unen por `id`; si el mismo `id` existe de los dos lados gana el que esté
marcado, y si los dos están marcados distinto se queda el de este dispositivo. Los días
se suman, y de cada textarea se conserva la versión más larga. Es la forma de pasar el
avance de la compu al teléfono sin perder nada.

La única excepción es el revisor: si lo activas y presionas el botón, ese texto se manda
al proxy para que lo lea el modelo. Nada se guarda del otro lado, pero sale del teléfono.
Si no configuras el revisor, esta excepción no existe.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La app completa: contenido, estilos y lógica |
| `sw.js` | Service worker; permite abrirla sin señal |
| `manifest.webmanifest` | Metadatos de instalación (nombre, iconos, color) |
| `icons/` | Iconos de la app |
| `proxy/` | Worker de Cloudflare que guarda la llave de la API (opcional) |

## Editar el contenido

Las ocho semanas son un arreglo `SEMANAS` al principio del `<script>` en `index.html`.
Cada entrada tiene `titulo`, `premisa`, `concepto[]`, `escrito{}`, `accion` y `guion[]`
(las líneas que aparecen durante la sesión). Cambia el texto ahí y haz commit.

Después de publicar un cambio, la app instalada puede tardar una carga en actualizarse;
si no aparece, súbele la versión al `CACHE` en `sw.js`.

### Dos formatos de ejercicio escrito

`escrito.formato` decide cómo se captura la semana:

| Valor | Qué muestra | Cómo se guarda |
|---|---|---|
| `"texto"` | Un textarea libre | `E.diario[semana]` |
| `"lista"` | Enunciados en filas, con estado | `E.enunciados[semana]` |

Hoy solo la semana 1 usa `"lista"`. Para pasar otra semana al formato de lista, cambia
su bandera y ya: la lógica es la misma para todas. En formato de lista cada enunciado es
`{ id, texto, estado }` con estado `"sin_marcar" | "heredado" | "comprobado"`.

**Migración automática.** La primera vez que una semana pasa a `"lista"`, si ya había
texto en su textarea se parte por saltos de línea y cada línea se vuelve un enunciado
`sin_marcar`. `E.diario` **no se borra**: queda como respaldo por si la partición sale
mal, y solo se vuelve a usar si borras `E.enunciados[semana]` de raíz.

El revisor recibe lo mismo en los dos formatos: los textos concatenados con saltos de
línea. El estado es del usuario y nunca sale del dispositivo.

## Revisor (opcional)

Debajo del textarea puede aparecer un botón **«Revisar lo que escribí»**. Manda lo que
escribiste a Claude y regresa una lectura de si tus enunciados están bien planteados
según el criterio de esa semana.

Es aditivo y nunca bloqueante: **si no lo configuras, el botón no existe y la app se
comporta exactamente igual.** Si lo configuras y el proxy deja de responder, el botón
también desaparece solo.

### Por qué hace falta un proxy

La llave de la API no puede vivir en `index.html`: es un archivo público, cualquiera
puede leerla y gastarte el saldo. El proxy es un Cloudflare Worker que guarda la llave
del lado del servidor, recibe `{semana, texto}` y devuelve `{revision}`.

### Desplegarlo

Necesitas una cuenta de Cloudflare (el plan gratis alcanza de sobra) y una llave de
[console.anthropic.com](https://console.anthropic.com/settings/keys).

```bash
cd proxy
npm install
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY   # pega la llave cuando la pida
npx wrangler deploy
```

`wrangler deploy` imprime la URL, algo como
`https://calibracion-revisor.TU-SUBDOMINIO.workers.dev`.

**La variable de entorno de la llave es `ANTHROPIC_API_KEY`, y se guarda como *secret*
de Wrangler, no como `[vars]` ni en ningún archivo del repo.** `wrangler secret put` la
sube cifrada a Cloudflare; nunca queda en git.

### Conectarlo

Pon esa URL en la constante al principio del `<script>` de `index.html`:

```js
const REVISOR_URL = "https://calibracion-revisor.TU-SUBDOMINIO.workers.dev/";
```

Haz commit, sube, y súbele la versión al `CACHE` en `sw.js` para que los teléfonos con
la app instalada agarren el cambio.

### Redactar el criterio de cada semana

El prompt del revisor vive en `proxy/src/index.ts`, no en el cliente — el cliente solo
manda el número de semana. El criterio por semana está en el objeto `CRITERIOS`:

- La **semana 1** ya está redactada (forma «no puedo hacer X», y las fallas NIEBLA,
  RASGO, HECHO, VAGO).
- Las **semanas 2 a 8** traen un texto genérico a propósito, y el revisor abre diciendo
  que el criterio de esa semana todavía no está calibrado.

Para redactar una, reemplaza `criterioPendiente(N)` por el texto de esa semana y vuelve
a hacer `npx wrangler deploy`. El cliente no se toca.

### Ajustes y límites

| Constante en `proxy/src/index.ts` | Valor |
|---|---|
| `MODELO` | `claude-sonnet-4-6` |
| `MAX_TOKENS` | 1000 |
| `MAX_CARACTERES` | 6000 (arriba de eso el proxy responde 413) |
| `ORIGEN_APP` | `https://aeal0692-oss.github.io` — único origen con CORS |

Nota sobre CORS: es una protección del navegador, no un candado. Alguien que conozca la
URL del Worker puede llamarlo desde fuera de un navegador y gastarte saldo. Si eso llega
a pasar, agrégale una regla de Rate Limiting en el panel de Cloudflare.

## Correr en local

Necesita un servidor (el service worker no funciona con `file://`):

```
python -m http.server 8000
```

Y abre `http://localhost:8000`.

Para probar el revisor en local, corre el Worker aparte y deja que ese origen pase CORS:

```bash
# en proxy/, crea .dev.vars (está en .gitignore, nunca se sube)
#   ANTHROPIC_API_KEY=sk-ant-...
#   ORIGENES_EXTRA=http://localhost:8000
npx wrangler dev --port 8787
```

Y apunta `REVISOR_URL` a `http://127.0.0.1:8787/` mientras pruebas.
