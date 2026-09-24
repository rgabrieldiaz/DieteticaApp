# DieteticaApp — Sistema de Gestión de Inventario

> **Aplicación web de gestión de inventario centralizada y liviana para una dietética minorista de barrio.**  
> Diseñada para optimizar el control de existencias pesables/fraccionadas y la consulta de proveedores comerciales, reduciendo tiempos administrativos y previniendo quiebres de stock.

---

## 📌 Información Académica

* **Institución:** Escuela Da Vinci — Primera Escuela de Arte Multimedial
* **Carrera:** Analista de Sistemas / Diseño y Programación Web
* **Materia:** Análisis y Metodología de Sistemas (Ciclo Lectivo 2026)
* **Cátedra:** Prof. Diego Simonelli
* **Integrantes:** 
  * Ricardo Gabriel Diaz
  * Nicolás Gerardo Benitez
* **Instancia de Evaluación:** Primer Parcial — Integración de Modelado Estructurado
* **Versión:** 1.0 (Septiembre 2026) — Formato bajo lineamientos estándar IEEE 830

---

## 📚 Documentación del Sistema

Toda la documentación técnica, diagramas y prototipos de diseño se encuentran organizados dentro de la carpeta [`docs/`](docs/):

| Documento | Formato | Descripción |
|---|---|---|
| **[Especificación de Requerimientos (SRS)](docs/SRS.md)** | Markdown (`.md`) | Requerimientos funcionales, DFD Nivel 0 y 1, DER, Diccionario de Datos, Casos de Uso, Matriz de Trazabilidad y Reglas de Negocio. |
| **[Documento Formal IEEE 830 (PDF)](docs/DieteticaApp_SRS_Documentacion.pdf)** | PDF (`.pdf`) | Documento completo exportado a PDF con diagramas Mermaid vectoriales renderizados, tablas formateadas y mockups en alta resolución. |
| **[Prototipos y Mockups UI](docs/mockups/)** | JPG | Diseños visuales de la interfaz de usuario (Inventario, Proveedores y Formularios Modales). |

---

## 🎯 Alcance del Sistema (Scoping)

### Procesos Incluidos (In Scope)
* **Gestión de Mercadería:** Altas, modificaciones, bajas y listado general de productos categorizados.
* **Gestión de Proveedores:** Registro, actualización, eliminación y consulta de distribuidores mayoristas.
* **Asociación Relacional:** Asignación directa de cada producto a su proveedor habitual ($1:N$, opcional en el alta).
* **Búsqueda y Filtros:** Filtrado en tiempo real por coincidencia de nombre y clasificación taxonómica.
* **Monitoreo de Existencias:** Indicadores visuales de stock bajo (umbral $\le 5$ unidades/kg) y agotado ($= 0$).

### Categorías de Mercadería Soportada
* 🌾 **Cereales** (arroz, avena, quinoa)
* 🌱 **Legumbres** (lentejas, garbanzos, porotos)
* ✨ **Semillas** (chía, sésamo, girasol)
* 🫒 **Aceites** (oliva, coco)
* 🍵 **Infusiones** (té verde, manzanilla, cedrón)
* 🥜 **Frutos Secos** (nueces, almendras, castañas)

---

## 📂 Estructura del Repositorio

El repositorio se encuentra estructurado para separar claramente la fase de análisis/documentación de la futura fase de implementación de software:

```text
DieteticaApp/
├── docs/                                  # Carpeta de documentación técnica
│   ├── DieteticaApp_SRS_Documentacion.pdf # Especificación formal completa en PDF
│   ├── SRS.md                             # Especificación bajo norma IEEE 830
│   └── mockups/                           # Prototipos visuales de la interfaz
│       ├── mockup_inventario.jpg
│       ├── mockup_formulario_producto.jpg
│       ├── mockup_proveedores.jpg
│       └── mockup_formulario_proveedor.jpg
├── scripts/                               # Scripts auxiliares y herramientas de desarrollo
│   └── export_pdf.js                      # Generador automatizado de PDF con Puppeteer y Mermaid
├── .gitignore                             # Reglas de exclusión para Git (macOS, Python, IDEs)
└── README.md                              # Portada y presentación general del proyecto
```

---

## 🛠️ Stack Tecnológico Planificado (Fase de Desarrollo)

Para la segunda parte de la materia (implementación de la aplicación web):

* **Backend:** Python con arquitectura Application Factory (`create_app`) y Blueprints modulares en Flask.
* **Persistencia:** Base de datos relacional (SQLite para entorno local / PostgreSQL) con mapeo ORM.
* **Frontend:** Interfaz web liviana y reactiva con carga modal (backdrop) y búsqueda predictiva sin recargas de página completa.

---

## ⚙️ Generación del Documento PDF

Para regenerar el documento PDF a partir de la documentación y los diagramas Mermaid, se provee el script de compilación en `scripts/`:

```bash
node scripts/export_pdf.js
```
*(Requiere Google Chrome instalado y el paquete `puppeteer-core`).*
