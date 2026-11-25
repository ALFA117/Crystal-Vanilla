# Crystal Vanilla: notas de diseño

[← Back to README](../README.md)

## DESIGN_NOTES (rediseño pro, nov 2026)

- **Dirección:** herramienta de trabajo formal con la marca del cliente (chocolate + oro de vainilla del logo). Retícula bento en el resultado, bordes finos de 1 px y sombras casi planas (sin desplazamientos duros ni movimiento al pasar el cursor); sin partículas ni fondos animados.
- **Tipografía:** Marcellus (marca y títulos de página, eco de las capitales del logo) · Public Sans (texto y cifras grandes del resultado) · IBM Plex Mono (cantidades en la tabla y el campo).
- **Colores con significado fijo:** chocolate `#45261F` = acción principal y marca · oro `#D8A73E` = acento (filetes, íconos) · verde `#2E6A45` = exacto/correcto · terracota `#9C3D1C` = falta material o error · amarillo pálido = aviso informativo (resultado desactualizado, servidor sin conexión). Contraste AA verificado.
- **Recorrido:** antes: elegir modo → escribir → Calcular → bajar a ver 5 secciones de tarjetas. Ahora: elegir modo → escribir → Calcular (o Enter); en escritorio el resultado aparece al lado sin desplazarse y los materiales quedan en una sola tabla (en móvil baja solo al resultado).
- La lógica de cálculo (`src/utils/calculations.js`) y el PDF (`src/utils/pdfExport.js`) no cambiaron; jsPDF ahora se carga al pulsar «Descargar PDF».
