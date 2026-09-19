# Forma exterior y altura de teclas OEM

Fecha: 2026-09-20. Estado: plan propuesto; los nuevos controles no están implementados ni calibrados. El usuario ha priorizado **forma exterior y altura** frente a encaje o grosores y ha aceptado la denominación **«OEM derivado»** para alturas distintas de las originales de cada fila. Este plan parte del catálogo existente de fila OEM + ancho en `u`. La carga del SVG, el tamaño de su leyenda en mm y los dos colores siguen siendo independientes.

## Objetivo y límite del perfil

Permitir ajustes concretos de la silueta y la altura sin presentar como un rango OEM oficial valores que KeyV2 fija por fila. Conservar **fila 5 · 1u** y su geometría impresa como valor inicial exacto. Cada control debe modificar realmente el 3MF, tener un intervalo o conjunto de valores justificado y mostrar si esa variante ha pasado pruebas físicas. Un intervalo admitido por OpenSCAD no equivale a un intervalo seguro para el teclado.

En el KeyV2 fijado en el proyecto, `oem_row(row, column)` asigna el ancho/alto nominal de la base (18,05 mm antes de aplicar unidades), las diferencias de ancho/alto de la tapa (5,8/4 mm), plato cilíndrico de 1 mm, desplazamiento de tapa de 1,75 mm e inserción del anclaje de 1,2 mm. **También fija la profundidad nominal y la inclinación según la fila**: fila 1 = 9,45 mm/1°, fila 2 = 9 mm/6°, filas 3 y 4 = 9,25 mm/9° y 10°, fila 5 = 11,2 mm/−3°. Son parámetros fuente, no la altura medida de la malla exportada. La fila y el ancho ya se eligen mediante el catálogo; la profundidad de leyenda de 0,5 mm se conserva como contrato Body/Legend.

KeyV2 deja el **radio de esquina** (`$corner_radius`, valor fuente 1 mm) fuera de `oem_row`, por lo que es el primer candidato de forma exterior sin sobrescribir una medida fijada por esa función. Aun así, no hay un intervalo de radio validado para el producto. La **altura vertical** es distinta: cambiar `$total_depth` después de `oem_row` modifica un valor que la fila fija. Si se admite, cada resultado distinto del valor original debe identificarse como **OEM derivado**, no como OEM exacto. Cambiar profundidad también altera el cálculo de la altura del anclaje y sus soportes en KeyV2; no basta con mover la superficie superior.

La receta actual fija `cherry(0.35)`, `$stem_inner_slop=0.2`, recorrido de anclaje de 4 mm, soporte estructural `flared` y ayudas de impresión del anclaje desactivadas. Grosor de pared/techo y tolerancias del anclaje también quedan fijos en esta fase. Que KeyV2 deje una variable técnicamente configurable no autoriza por sí mismo un rango público ni garantiza resistencia, encaje o impresión.

## Controles candidatos y orden de decisión

| Grupo                 | Candidato                                                                                | Efecto y condición                                                                     | Propuesta                                                                            |
| --------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Ya disponible         | Fila OEM, ancho en `u`, SVG, tamaño de leyenda y colores                                 | Selección de malla y encastre de leyenda existentes                                    | Mantener sin cambios                                                                 |
| Forma exterior        | Radio de esquina                                                                         | Ajuste KeyV2 no sobrescrito por `oem_row`; cambia huella, holgura y contorno del techo | Primer experimento aislado, con valor inicial 1 mm y rango aún por medir             |
| Altura vertical       | Diferencia respecto a la profundidad nominal de cada fila                                | Sobrescribe `$total_depth`; cambia altura real, paredes, anclaje y soportes            | Segundo experimento; «OEM derivado» fuera del valor inicial, acordado con el usuario |
| Fuera de este trabajo | Plato, inclinación, diferencia base/tapa, sesgo, grosor, encaje y profundidad de leyenda | Perfil, referencia impresa o contrato de exportación                                   | Sin controles nuevos                                                                 |

El orden recomendado es **radio primero, altura después**. El plan no decide por adelantado mínimos, máximos ni pasos. Tampoco atribuye al perfil OEM un rango de altura que KeyV2 no documenta. El ensayo de impresión con paredes de ancho adaptable que investiga el relieve de la leyenda sigue siendo independiente; registrar su resultado antes de cambiar la profundidad del encastre de leyenda.

## Restricción de implementación

La web carga para cada fila/ancho una malla de tecla completa y otra de exterior, generadas fuera del navegador. Cambiar un número en React no altera esas mallas. Hay dos vías legítimas:

1. **Valores discretos precalculados**, preferidos para un único ajuste estrecho: producir con la versión fijada de KeyV2/OpenSCAD cada variante de blank y exterior, con ID, parámetros, hash y estado físico. Exponer botones/opciones discretas, no un deslizador continuo engañoso. Cargar solo el recurso elegido. El número de recursos crece como producto de fila × ancho × valores; acotar primero el control a fila 5/1u y ampliar el catálogo solo cuando aporte valor.
2. **Geometría paramétrica en el navegador**, solo si el usuario necesita un intervalo continuo o muchas combinaciones: estudiar una implementación independiente de React que conserve fielmente la forma y el anclaje de KeyV2 con Manifold, o una tecnología compatible con la arquitectura browser-only. Requiere un ADR nuevo, comparación geométrica contra las mallas fijadas, evaluación de tamaño/tiempo de carga y revisión de licencias. No sustituir la referencia impresa por una aproximación sin nuevas pruebas físicas.

No escalar la malla completa para simular radio o altura: también deformaría la cruz Cherry, las paredes, el plato y los soportes. El preset predeterminado debe generar exactamente el mismo Body/Legend y 3MF que ahora; guardar un fingerprint antes de modificar el generador. Para altura, comparar al menos dos construcciones en una prueba aislada: modificar `$total_depth` dentro de KeyV2 y reconstruir únicamente la carcasa preservando la geometría de inserción. Elegir una solo tras medir qué cambia realmente en el anclaje y el techo; ninguna es equivalente por definición a la referencia impresa.

## Secuencia de trabajo para el primer control

1. **Fijar la referencia y definir los controles.** Capturar fingerprint de Body/Legend y 3MF de fila 5/1u actual. Definir «radio de esquina» en mm con valor inicial 1 mm y «altura adicional respecto a la fila OEM» en mm con valor inicial 0. La altura nominal depende de la fila; el usuario no debe introducir una profundidad absoluta que borre esa diferencia. Registrar si cada control afecta a la huella, la superficie superior, el anclaje o los soportes. Altura 0 conserva «OEM»; una altura distinta se etiqueta «OEM derivado».
2. **Prototipar y medir por separado.** Preparar primero unos pocos radios alrededor de 1 mm para fila 5/1u; comparar cota exterior, área útil del techo y contacto con la cama. Después preparar cambios pequeños de altura en la misma referencia usando el método de construcción elegido; medir altura real de malla, sección del anclaje, altura instalada esperada, techo restante y solidez del soporte. No combinar radio y altura diferentes del default en el primer ensayo. No presentar prototipos como opciones de producto todavía.
3. **Calibrar antes de prometer un rango.** Imprimir la referencia y los extremos que se pretendan ofrecer, con el mismo SVG y proceso comparable. Pedir feedback de inserción, retención, retirada, recorrido completo, roce con teclas vecinas/carcasa, acabado de la superficie y resistencia. Registrar hashes y observaciones no identificativas en `CALIBRATION.md`. Si falla un extremo, estrechar o descartar los valores. No marcar valores intermedios como físicamente validados por interpolación. La impresión actual sobre relieve de leyenda aporta evidencia de acabado, pero no valida radio ni altura nuevos.
4. **Implementar el contrato de opciones.** Añadir al descriptor de la variante solo los valores permitidos y su estado de validación. Mantener los parámetros fijos en un módulo de configuración/receta y validar también los límites en el worker. La UI muestra «Forma y altura» después de fila/ancho y antes del SVG, con valor numérico, Reset y explicación breve del efecto. Etiquetar «OEM derivado» al apartarse de la altura nominal. Deshabilitar exportación durante regeneración o si faltan recursos; colores y SVG siguen independientes.
5. **Verificar.** Comparar el default bit a bit con la referencia actual; comprobar malla cerrada, Body conectado, materiales sin solape, volumen conservado, leyenda al ras y material suficiente debajo, 3MF con dos partes y ausencia de G-code. Probar extremos, cambios rápidos, Reset, errores, Chromium/Firefox y carga bajo una subruta de Pages. Inspeccionar el laminado antes del gate de impresión.
6. **Cerrar el gate físico y documentar.** Registrar qué valores han sido impresos y cuáles son solo experimentales. Actualizar `docs/MVP.md`, `STATUS.md`, `CALIBRATION.md` y un ADR con la decisión real. No publicar compatibilidad general a partir de una sola muestra ni desplegar sin una acción separada.

## Primer ensayo geométrico, 2026-09-20

Se añadió una [receta aislada](keyv2-oem-customization-probe.scad) sobre fila 5/1u. Los STL generados se guardan solo en `_tmp/`; no son opciones de la web ni muestras validadas. La receta sin ajuste reproduce las 1850 posiciones únicas de vértices de la referencia impresa a la precisión textual del STL. OpenSCAD informa una malla manifold con 3696 caras en las cinco variantes. La comparación de las 120 posiciones únicas del área central (`|x|, |y| ≤ 3 mm`, `z ≤ 4 mm`) encontró coincidencia exacta a 0,00001 mm; esto no prueba que todo el anclaje ni su ajuste físico sean iguales.

Ejemplo reproducible desde la raíz del repositorio, con KeyV2 fijado en `_tmp/KeyV2` (OpenSCAD usa `OPENSCADPATH`, no `-I`):

```sh
mkdir -p _tmp/oem-template-comparison
OPENSCADPATH="$PWD/_tmp/KeyV2" /Applications/OpenSCAD.app/Contents/MacOS/openscad \
  -D 'corner_radius_mm=1.5' -D 'height_delta_mm=0' -D 'exterior=false' \
  -o _tmp/oem-template-comparison/customization-radius-1_5.stl \
  docs/plans/keyv2-oem-customization-probe.scad
```

| Radio (mm) | Cambio de profundidad (mm) | Altura máxima de malla (mm) | Huella X (mm) | Volumen (mm³) |
| ---------: | -------------------------: | --------------------------: | ------------: | ------------: |
|        1,0 |                          0 |                    10,33635 |      ±8,72602 |       1460,89 |
|        0,5 |                          0 |                    10,31463 |      ±8,72534 |       1456,26 |
|        1,5 |                          0 |                    10,35679 |      ±8,72670 |       1463,81 |
|        1,0 |                       −0,5 |                     9,83637 |      ±8,71245 |       1362,99 |
|        1,0 |                       +0,5 |                    10,83633 |      ±8,73846 |       1560,16 |

Así, un ajuste de radio también altera la altura extrema, y uno de profundidad altera ligeramente la huella. Los valores ±0,5 mm son **sondas**, no un rango seguro ni un contrato de interfaz. Aún faltan malla exterior, sección completa del anclaje, espesor del techo/leyenda, ensamblaje 3MF, laminado e impresión. El siguiente trabajo debe contrastar el método de altura que conserva la inserción y comprobar esas invariantes antes de pedir una prueba física.

## Decisiones abiertas

- Elegir los valores de prueba de radio y altura a partir de medición geométrica; no existe un rango OEM oficial que se pueda copiar.
- Si la experiencia deseada acepta una lista de valores discretos o requiere un intervalo continuo. Esta elección determina la arquitectura y el coste de la implementación.
- Qué filas/anchos, además del default fila 5/1u, deben recibir el ajuste después de verificarlo físicamente.
- Resultado de la impresión en curso sobre el relieve de la leyenda; puede cambiar la prioridad de trabajo, pero no altera por sí mismo las medidas físicas del perfil.
