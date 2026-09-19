# Personalización mecánica dentro del perfil OEM

Fecha: 2026-09-20. Estado: plan propuesto; los nuevos controles no están implementados ni calibrados. Este plan parte del catálogo ya existente de fila OEM + ancho en `u`. La carga del SVG, el tamaño de su leyenda en mm y los dos colores siguen siendo independientes.

## Objetivo y límite del perfil

Permitir ajustes concretos de una tecla OEM sin presentar como editables los parámetros que definen el perfil. Conservar **fila 5 · 1u** y su geometría impresa como valor inicial exacto. Cada control debe modificar realmente el 3MF, tener un intervalo o conjunto de valores justificado y mostrar si esa variante ha pasado pruebas físicas. Un intervalo admitido por OpenSCAD no equivale a un intervalo seguro para el teclado.

En el KeyV2 fijado en el proyecto, `oem_row(row, column)` asigna el ancho/alto nominal de la base (18,05 mm antes de aplicar unidades), las diferencias de ancho/alto de la tapa (5,8/4 mm), plato cilíndrico de 1 mm, desplazamiento de tapa de 1,75 mm e inserción del anclaje de 1,2 mm. También fija la profundidad y la inclinación según la fila. Estos valores **definen la silueta OEM** y no se ofrecerán como deslizadores. La fila y el ancho ya se eligen mediante el catálogo; la profundidad de leyenda de 0,5 mm se conserva como contrato Body/Legend, no como compensación especulativa del relieve impreso.

KeyV2 deja otros valores fuera de `oem_row`: grosor de pared (`$wall_thickness`, valor fuente 3 mm de grosor total, aproximadamente 1,5 mm por lado), grosor de tapa (`$keytop_thickness`, 1 mm), radio de esquina (`$corner_radius`, 1 mm), y tolerancias del anclaje Cherry (`$stem_slop`, `$stem_inner_slop`). La receta actual fija además `cherry(0.35)`, `$stem_inner_slop=0.2`, recorrido de anclaje de 4 mm, soporte estructural `flared` y ayudas de impresión del anclaje desactivadas. Que una variable no sea sobrescrita por `oem_row` solo significa que **es técnicamente configurable en KeyV2**; no autoriza por sí mismo un rango público ni garantiza resistencia, encaje o impresión.

## Controles candidatos y orden de decisión

| Grupo         | Candidato                                                                                                               | Efecto y dependencia                                                                                         | Decisión inicial                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Ya disponible | Fila OEM, ancho en `u`, SVG, tamaño de leyenda y colores                                                                | Selección de malla y encastre de leyenda existentes                                                          | Mantener sin cambios                                                 |
| Ajuste físico | Tolerancia **interior** de la cruz Cherry                                                                               | Cambia inserción/retención; puede afectar al hueco, nervios y soporte                                        | Primer candidato si el usuario prioriza el encaje; sin rango todavía |
| Resistencia   | Grosor total de pared y grosor de tapa                                                                                  | Cambian cavidad y material restante bajo la leyenda; deben comprobarse juntos con la geometría exterior fija | Candidatos posteriores, inicialmente uno cada vez                    |
| Forma         | Radio de esquina u otros desplazamientos no fijados por `oem_row`                                                       | Cambian silueta, holguras y superficie de apoyo                                                              | No incluir en la primera entrega sin una necesidad concreta          |
| Fijo          | Plato, profundidad/inclinación de fila, desplazamiento de tapa, base OEM, inserción del anclaje, profundidad de leyenda | Definen el perfil o conservan la referencia impresa y el contrato de exportación                             | Solo lectura; sin controles                                          |

La prioridad del **primer** ajuste adicional está pendiente de la respuesta del usuario: encaje, grosor de pared/techo o forma exterior. El plan no decide por adelantado sus mínimos, máximos ni pasos. Tampoco atribuye al perfil OEM un rango que KeyV2 no documenta. El ensayo de impresión con paredes de ancho adaptable que investiga el relieve de la leyenda sigue siendo independiente; registrar su resultado antes de atribuir el defecto a la malla o cambiar la profundidad de encastre.

## Restricción de implementación

La web carga para cada fila/ancho una malla de tecla completa y otra de exterior, generadas fuera del navegador. Cambiar un número en React no altera esas mallas. Hay dos vías legítimas:

1. **Valores discretos precalculados**, preferidos para un único ajuste estrecho: producir con la versión fijada de KeyV2/OpenSCAD cada variante de blank y exterior, con ID, parámetros, hash y estado físico. Exponer botones/opciones discretas, no un deslizador continuo engañoso. Cargar solo el recurso elegido. El número de recursos crece como producto de fila × ancho × valores; acotar primero el control a fila 5/1u y ampliar el catálogo solo cuando aporte valor.
2. **Geometría paramétrica en el navegador**, solo si el usuario necesita un intervalo continuo o muchas combinaciones: estudiar una implementación independiente de React que conserve fielmente la forma y el anclaje de KeyV2 con Manifold, o una tecnología compatible con la arquitectura browser-only. Requiere un ADR nuevo, comparación geométrica contra las mallas fijadas, evaluación de tamaño/tiempo de carga y revisión de licencias. No sustituir la referencia impresa por una aproximación sin nuevas pruebas físicas.

No escalar la malla completa para simular paredes, techo o encaje: también cambiaría dimensiones que deben permanecer fijas. El preset predeterminado debe generar exactamente el mismo Body/Legend y 3MF que ahora; guardar un fingerprint antes de modificar el generador.

## Secuencia de trabajo para el primer control

1. **Definir el ajuste en lenguaje de usuario.** Seleccionar una sola magnitud, su dirección («más firme»/«más holgado» o «más grueso»/«más fino»), las unidades, el valor actual y qué parámetros KeyV2 modifica. Anotar qué filas/anchos son elegibles y qué queda fijo.
2. **Calibrar candidatos antes de prometer un rango.** Preparar pocos valores alrededor de la referencia sin reemplazarla. Comprobar en la malla paredes/techo mínimos, hueco de anclaje, unión del soporte, posición de la leyenda y holguras. Imprimir la referencia y los extremos que se pretendan ofrecer; pedir feedback de inserción, retención, retirada, recorrido, roce y calidad superficial. Registrar hashes y observaciones no identificativas en `CALIBRATION.md`. Si falla un extremo, estrechar o descartar el rango. No marcar valores intermedios como físicamente validados por interpolación.
3. **Implementar el contrato de opciones.** Añadir al descriptor de la variante solo los valores permitidos y su estado de validación. Mantener los parámetros fijos en un módulo de configuración/receta y validar también los límites en el worker. La UI muestra el ajuste en una sección avanzada, valor numérico, Reset y una explicación breve del efecto. Deshabilitar exportación durante regeneración o si faltan recursos; colores y SVG siguen independientes.
4. **Verificar.** Comparar el default bit a bit con la referencia actual; comprobar malla cerrada, Body conectado, materiales sin solape, volumen conservado, leyenda al ras y material suficiente debajo, 3MF con dos partes y ausencia de G-code. Probar extremos, cambios rápidos, Reset, errores, Chromium/Firefox y carga bajo una subruta de Pages. Inspeccionar el laminado antes del gate de impresión.
5. **Cerrar el gate físico y documentar.** Registrar qué valores han sido impresos y cuáles son solo experimentales. Actualizar `docs/MVP.md`, `STATUS.md`, `CALIBRATION.md` y un ADR con la decisión real. No publicar compatibilidad general a partir de una sola muestra ni desplegar sin una acción separada.

## Decisiones abiertas

- Qué ajuste OEM interesa primero y qué problema concreto quiere resolver.
- Si la experiencia deseada acepta una lista de valores discretos o requiere un intervalo continuo. Esta elección determina la arquitectura y el coste de la implementación.
- Qué filas/anchos, además del default fila 5/1u, deben recibir el ajuste después de verificarlo físicamente.
- Resultado de la impresión en curso sobre el relieve de la leyenda; puede cambiar la prioridad de trabajo, pero no altera por sí mismo las medidas físicas del perfil.
