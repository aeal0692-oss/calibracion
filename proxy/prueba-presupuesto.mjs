// Comprobación rápida de la curva de palabras: node prueba-presupuesto.mjs
import { presupuestoPalabras } from "./src/index.ts";

const casos = [1, 3, 4, 10, 12, 13, 20, 40];
for (const n of casos) {
  const texto = Array.from({ length: n }, (_, i) => `No puedo hacer la cosa ${i + 1}`).join("\n");
  console.log(`${String(n).padStart(2)} enunciados -> ${presupuestoPalabras(texto)} palabras`);
}
// líneas en blanco no cuentan
console.log("con blancos ->", presupuestoPalabras("uno\n\n\n  \ndos\ntres"), "(esperado 200, son 3 líneas)");
