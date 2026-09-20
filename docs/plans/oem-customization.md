# Forma exterior y altura de teclas OEM

Fecha: 2026-09-20. Estado: controles de forma y altura implementados localmente; las combinaciones modificadas siguen siendo experimentales. El usuario ha priorizado **forma exterior y altura** y ha aceptado la denominación **«OEM derivado»** para alturas distintas de las originales de cada fila. Posteriormente indicó que no hace falta imprimir cada medida antes de ofrecerla. La web permite elegir medidas reales precalculadas en pasos de 0,25 mm, sin afirmar que constituyan un rango OEM oficial. La carga del SVG, el tamaño de su leyenda en mm y los colores siguen independientes.

## Objetivo y límite del perfil

Permitir ajustes concretos de la silueta y la altura sin presentar como un rango OEM oficial valores que KeyV2 fija por fila. Conservar **fila 5 · 1u** y su geometría impresa como valor inicial exacto. Cada control debe modificar realmente el 3MF y distinguir el preset con feedback físico de las demás combinaciones experimentales. Un intervalo admitido por OpenSCAD no equivale a un intervalo seguro para el teclado.

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

La web carga para cada fila/ancho una malla de tecla completa y otra de exterior, generadas fuera del navegador. Cambiar un número en React no altera esas mallas. Se evaluaron dos vías:

1. **Valores discretos precalculados**, elegidos para el editor actual: producir con la versión fijada de KeyV2/OpenSCAD cada variante de blank y exterior, con ID, parámetros y hash. Los deslizadores usan pasos discretos exactos, no interpolación de mallas. Cargar solo el recurso elegido. El catálogo cubre las ocho combinaciones de fila/ancho ya disponibles.
2. **Geometría paramétrica en el navegador**, diferida si el usuario necesita un intervalo continuo o muchas más combinaciones: estudiar una implementación independiente de React que conserve fielmente la forma y el anclaje de KeyV2 con Manifold. Requiere comparación geométrica contra las mallas fijadas, evaluación de tamaño/tiempo de carga y revisión de licencias.

No escalar la malla completa para simular radio o altura: también deformaría la cruz Cherry, las paredes, el plato y los soportes. El preset predeterminado reutiliza los recursos originales. Las demás combinaciones se generan con KeyV2, incluyendo el cálculo de anclaje y soportes dependiente de la profundidad; son OEM derivado cuando la altura difiere. No se afirma que conserven exactamente la inserción de la referencia física.

## Contrato implementado

- Radio de esquina: 0,50–1,50 mm; inicial 1 mm. Altura: −0,50–+0,50 mm respecto a la profundidad nominal de la fila; inicial 0. Ambos avanzan de 0,25 mm. Estos límites proceden de sondeos geométricos estrechos, no de una norma OEM ni de pruebas físicas de extremos.
- Las ocho combinaciones de fila y anchura actuales tienen recursos para cada par de medidas. El valor inicial de cada combinación usa exactamente sus recursos anteriores. La interfaz distingue «OEM derivado» cuando la altura no es cero y advierte que cualquier medida modificada es experimental.
- El worker valida los valores y carga el blank y exterior correspondientes. El SVG, su tamaño y los colores permanecen independientes. Mientras se genera un modelo nuevo, la exportación queda deshabilitada; Reset vuelve a las medidas originales.
- Las comprobaciones automáticas cubren hashes, sólidos, contención y encastre de leyenda; la prueba en navegador compara exportación modificada y restaurada. El ajuste físico y el acabado de una combinación modificada no se dan por validados sin feedback de impresión. No se despliega la web automáticamente.

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

Así, un ajuste de radio también altera la altura extrema, y uno de profundidad altera ligeramente la huella. Estos primeros valores fueron **sondas**, no un rango seguro. El usuario decidió después que la web ofreciera un conjunto discreto y acotado sin exigir una impresión por medida; la implementación conserva la construcción KeyV2 y el estado experimental para cada modificación.

### Variante de radio preparada para prueba física

Las dos sondas de radio tienen ahora su malla exterior correspondiente y un 3MF de prueba con el ejemplo público Spark a 8 mm. Una comprobación de Manifold confirma que cada blank queda dentro de su exterior y que la región central de inserción (`|x|, |y| ≤ 3 mm`, `0 ≤ z ≤ 4 mm`) no presenta diferencia volumétrica detectable frente a la referencia con tolerancia de 0,0001 mm³. Los tamaños de leyenda 3, 8 y 11 mm generan Body conectado y Legend sin solape apreciable. Los 3MF contienen las dos partes nombradas y no incluyen G-code. Esto verifica estructura digital, no ajuste completo ni acabado impreso.

|  Radio | 3MF de ensayo local (ignorado por Git)                            | SHA-256 del 3MF                                                    |
| -----: | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| 0,5 mm | `_tmp/oem-template-comparison/customization-radius-0_5-spark.3mf` | `76813332b5dc12eaf3beb8372ffc38e12abbf53eecd8f75a55277e0f56815c42` |
| 1,5 mm | `_tmp/oem-template-comparison/customization-radius-1_5-spark.3mf` | `2c65325d9f77dc33b978a5a59db073a2dbd41c5b9179840c024cc0bffa40bddb` |

Estos dos archivos ayudaron a comprobar la estructura digital antes de implementar el catálogo completo. Si se imprimen, conviene compararlos con la referencia de radio 1 mm e inspeccionar apoyos, leyenda, contorno e inserción. El usuario decidió que la ausencia de impresiones adicionales no bloquea la oferta experimental en la web.

## Decisiones abiertas

- Evaluar la utilidad del intervalo actual y si más adelante se necesita geometría continua en el navegador.
- Recoger feedback físico de combinaciones modificadas si los usuarios las imprimen; no extrapolar compatibilidad del preset original.
- La impresión con paredes de ancho adaptable mejoró el relieve y conservó el funcionamiento de una muestra, aunque la leyenda aún se nota ligeramente. Este resultado no valida un radio o una altura diferentes.
