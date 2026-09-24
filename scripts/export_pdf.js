const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const projectDir = '/Users/gabo/Desktop/Proyectos/DieteticaApp';
const htmlPath = path.join(projectDir, '_temp_doc.html');
const outputPath = path.join(projectDir, 'DieteticaApp_SRS_Documentacion.pdf');

const imgInventario = 'mockups/mockup_inventario.jpg';
const imgFormProducto = 'mockups/mockup_formulario_producto.jpg';
const imgProveedores = 'mockups/mockup_proveedores.jpg';
const imgFormProveedor = 'mockups/mockup_formulario_proveedor.jpg';

const d1Mermaid = `flowchart LR
    DUE["Dueña / Administradora"]

    subgraph FRONTERA["Frontera del Software"]
        SIS(("0.0<br/>Sistema de Gestión<br/>de Inventario"))
    end

    DUE -->|"Datos de producto, proveedor,<br/>filtros y solicitudes CRUD"| SIS
    SIS -->|"Grilla de inventario, alertas de stock,<br/>directorio y confirmaciones"| DUE`;

const d2Mermaid = `flowchart TD
    DUE["Dueña / Administradora"]

    P1(["1.0<br/>Gestionar<br/>Productos"])
    P2(["2.0<br/>Gestionar<br/>Proveedores"])
    P3(["3.0<br/>Asociar<br/>Producto-Proveedor"])
    P4(["4.0<br/>Monitorear Stock<br/>y Consultas"])

    D1[("D1: PRODUCTOS")]
    D2[("D2: PROVEEDORES")]

    DUE -->|"Datos prod. / ID baja"| P1
    P1 -->|"Insertar / Actualizar / Borrar"| D1
    D1 -->|"Registro de producto"| P1
    P1 -->|"Confirmación"| DUE

    DUE -->|"Datos prov. / ID baja"| P2
    P2 -->|"Insertar / Actualizar / Borrar"| D2
    D2 -->|"Registro de proveedor"| P2
    P2 -->|"Confirmación"| DUE

    DUE -->|"ID prod + ID prov"| P3
    P3 -->|"Validar existencia"| D2
    P3 -->|"Asignar id_proveedor (FK)"| D1
    P3 -->|"Estado vínculo"| DUE

    DUE -->|"Término búsqueda / categoría"| P4
    D1 -->|"Lectura stock y precios"| P4
    D2 -->|"Lectura razón social"| P4
    P4 -->|"Grilla inventario con alertas"| DUE`;

const d3Mermaid = `erDiagram
    PROVEEDOR ||--o{ PRODUCTO : "suministra"

    PROVEEDOR {
        int id_proveedor PK
        string nombre
        string telefono
        string direccion
    }

    PRODUCTO {
        int id_producto PK
        string nombre
        string categoria
        float stock_actual
        string unidad_medida
        float precio_unitario
        int id_proveedor FK
    }`;

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Especificación de Requerimientos de Software (SRS) - DietéticaApp</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

  <style>
    @page {
      size: A4 portrait;
      margin: 18mm 16mm 18mm 16mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10.5pt;
      line-height: 1.55;
      color: #1e293b;
      background-color: #ffffff;
      margin: 0;
      padding: 0;
    }

    /* Page Breaks */
    .page-break {
      page-break-before: always;
      break-before: page;
    }

    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* PORTADA */
    .cover-page {
      min-height: 92vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      break-after: page;
      padding: 20px 0;
    }

    .cover-header {
      border-bottom: 3px solid #1b5e20;
      padding-bottom: 16px;
    }

    .institution-tag {
      font-size: 10.5pt;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #2e7d32;
      margin-bottom: 4px;
    }

    .career-tag {
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.8px;
      color: #64748b;
      text-transform: uppercase;
    }

    .cover-body {
      margin: 45px 0 25px 0;
    }

    .doc-badge {
      display: inline-block;
      background: #e8f5e9;
      color: #1b5e20;
      font-size: 8.5pt;
      font-weight: 700;
      padding: 5px 14px;
      border-radius: 9999px;
      border: 1px solid #c8e6c9;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 800;
      line-height: 1.15;
      color: #0f172a;
      margin: 0 0 14px 0;
      letter-spacing: -0.5px;
    }

    .cover-title span {
      color: #1b5e20;
    }

    .cover-subtitle {
      font-size: 14pt;
      font-weight: 500;
      color: #475569;
      margin: 0 0 24px 0;
    }

    .cover-accent-bar {
      width: 70px;
      height: 4px;
      background: linear-gradient(90deg, #1b5e20, #4caf50);
      border-radius: 2px;
      margin-bottom: 32px;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 22px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: #64748b;
      margin-bottom: 3px;
    }

    .meta-value {
      font-size: 10.5pt;
      font-weight: 600;
      color: #0f172a;
    }

    .meta-value.highlight {
      color: #1b5e20;
      font-weight: 700;
    }

    .meta-item.full-width {
      grid-column: 1 / -1;
      border-top: 1px dashed #cbd5e1;
      padding-top: 12px;
      margin-top: 4px;
    }

    .cover-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8.5pt;
      color: #64748b;
    }

    /* ÍNDICE */
    .toc-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 28px;
      margin-top: 10px;
    }

    .toc-item {
      display: flex;
      align-items: baseline;
      padding: 9px 0;
      border-bottom: 1px dotted #cbd5e1;
      font-size: 10pt;
    }

    .toc-item:last-child {
      border-bottom: none;
    }

    .toc-item.part-header {
      font-weight: 700;
      color: #1b5e20;
      margin-top: 8px;
      font-size: 10.5pt;
    }

    .toc-title {
      flex-shrink: 0;
    }

    .toc-dots {
      flex-grow: 1;
      border-bottom: 1px dotted #94a3b8;
      margin: 0 10px;
    }

    .toc-section {
      font-size: 8pt;
      font-weight: 700;
      color: #64748b;
      background: #e2e8f0;
      padding: 2px 7px;
      border-radius: 4px;
    }

    /* ENCABEZADOS DE SECCIÓN */
    .part-title {
      font-size: 15pt;
      font-weight: 800;
      color: #1b5e20;
      border-bottom: 2px solid #a5d6a7;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      letter-spacing: -0.3px;
    }

    .part-title .part-num {
      background: #1b5e20;
      color: #ffffff;
      font-size: 9.5pt;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 20px;
      margin-bottom: 10px;
      border-left: 4px solid #2e7d32;
      padding-left: 10px;
      letter-spacing: -0.2px;
    }

    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #334155;
      margin-top: 14px;
      margin-bottom: 8px;
    }

    p {
      margin: 0 0 10px 0;
      text-align: justify;
    }

    /* CALLOUT BOXES */
    .callout {
      background: #f1f8e9;
      border-left: 4px solid #43a047;
      border-radius: 0 8px 8px 0;
      padding: 12px 16px;
      margin: 12px 0;
      font-size: 9.5pt;
      color: #1b5e20;
    }

    .callout-title {
      font-weight: 700;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #1b5e20;
    }

    .callout-info {
      background: #f0fdf4;
      border-left: 4px solid #16a34a;
      color: #14532d;
    }

    /* METRIC CARDS (ROI) */
    .metric-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin: 14px 0;
    }

    .metric-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .metric-num {
      font-size: 17pt;
      font-weight: 800;
      color: #1b5e20;
      margin-bottom: 4px;
    }

    .metric-label {
      font-size: 8pt;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .metric-desc {
      font-size: 8pt;
      color: #64748b;
      line-height: 1.35;
    }

    /* TABLAS */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9pt;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }

    th {
      background: #f1f8e9;
      color: #1b5e20;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8pt;
      letter-spacing: 0.6px;
      padding: 8px 10px;
      border-bottom: 1px solid #c8e6c9;
      text-align: left;
    }

    td {
      padding: 7px 10px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
      vertical-align: middle;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    tr:last-child td {
      border-bottom: none;
    }

    /* BADGES */
    .badge {
      display: inline-block;
      font-size: 7.5pt;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }

    .badge-f {
      background: #dbeafe;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    .badge-t {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .badge-c {
      background: #f3e8ff;
      color: #6b21a8;
      border: 1px solid #e9d5ff;
    }

    .badge-rf {
      background: #e0f2fe;
      color: #0369a1;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }

    .badge-rn {
      background: #fef2f2;
      color: #b91c1c;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }

    .tag-pill {
      display: inline-block;
      background: #f1f5f9;
      color: #475569;
      font-size: 8pt;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 12px;
      margin: 2px;
    }

    /* DIAGRAMAS MERMAID */
    .diagram-wrapper {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 12px;
      margin: 14px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.03);
      text-align: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .diagram-title {
      font-size: 8.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .mermaid {
      display: block;
      text-align: center;
      margin: 0 auto;
    }

    .mermaid svg {
      display: inline-block !important;
      margin: 0 auto !important;
      max-width: 95% !important;
      max-height: 360px !important;
      height: auto !important;
    }

    /* MOCKUP CARDS */
    .mockup-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      margin: 12px 0 16px 0;
      box-shadow: 0 4px 8px -2px rgba(0,0,0,0.05);
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .mockup-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
    }

    .mockup-header-title {
      font-size: 10.5pt;
      font-weight: 700;
      color: #0f172a;
    }

    .mockup-header-cu {
      font-size: 7.5pt;
      font-weight: 600;
      color: #1b5e20;
      background: #e8f5e9;
      padding: 2px 7px;
      border-radius: 4px;
    }

    .mockup-img {
      max-width: 92%;
      max-height: 380px;
      height: auto;
      display: block;
      margin: 0 auto 10px auto;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }

    /* CASOS DE USO */
    .cu-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 16px 20px;
      margin: 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .cu-title {
      font-size: 11.5pt;
      font-weight: 800;
      color: #1b5e20;
      margin-bottom: 8px;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 6px;
    }

    .cu-item {
      margin-bottom: 6px;
      font-size: 9pt;
    }

    .cu-item strong {
      color: #0f172a;
    }

    ol.cu-steps {
      margin: 4px 0 8px 18px;
      padding: 0;
      font-size: 9pt;
    }

    ol.cu-steps li {
      margin-bottom: 3px;
    }

    ul.cu-alt {
      margin: 4px 0 8px 16px;
      padding: 0;
      font-size: 9pt;
      list-style-type: square;
    }

    ul.cu-alt li {
      margin-bottom: 3px;
    }

    /* CODE & PRE */
    code, pre {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
    }

    pre {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 12px;
      overflow-x: auto;
      line-height: 1.45;
      margin: 6px 0 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }

    code {
      background: #f1f5f9;
      padding: 1px 4px;
      border-radius: 3px;
      color: #0f172a;
      border: 1px solid #e2e8f0;
    }

    ul {
      margin: 4px 0 10px 18px;
      padding: 0;
    }

    li {
      margin-bottom: 3px;
      font-size: 9.5pt;
    }
  </style>
</head>
<body>

  <!-- ==================== PORTADA ==================== -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="institution-tag">Escuela Da Vinci · Primera Escuela de Arte Multimedial</div>
      <div class="career-tag">Analista de Sistemas / Diseño y Programación Web</div>
    </div>

    <div class="cover-body">
      <div class="doc-badge">Especificación Técnica Formal IEEE 830</div>
      <h1 class="cover-title">ESPECIFICACIÓN DE REQUERIMIENTOS<br><span>DE SOFTWARE (SRS)</span></h1>
      <div class="cover-subtitle">Sistema de Gestión de Inventario para Dietética de Barrio</div>
      <div class="cover-accent-bar"></div>

      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label">Materia</span>
          <span class="meta-value">Análisis y Metodología de Sistemas</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Ciclo Lectivo</span>
          <span class="meta-value">2026</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Cátedra Docente</span>
          <span class="meta-value">Prof. Diego Simonelli</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Instancia de Evaluación</span>
          <span class="meta-value highlight">Primer Parcial — Modelado Estructurado</span>
        </div>
        <div class="meta-item full-width">
          <span class="meta-label">Autores / Integrantes</span>
          <span class="meta-value highlight" style="font-size: 11.5pt;">Ricardo Gabriel Diaz &nbsp;·&nbsp; Nicolás Gerardo Benitez</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Versión</span>
          <span class="meta-value">1.0 (Septiembre 2026)</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Repositorio GitHub</span>
          <span class="meta-value" style="font-size: 9pt; font-family: monospace;">github.com/rgabrieldiaz/DieteticaApp</span>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <span>Sistema de Gestión de Inventario para Dietética</span>
      <span>Buenos Aires, Argentina — Septiembre 2026</span>
    </div>
  </div>

  <!-- ==================== ÍNDICE ==================== -->
  <div class="toc-container avoid-break" style="margin-top: 10px;">
    <h2 style="border-left-color: #1b5e20; margin-top: 0; color: #1b5e20;">Índice General de Contenidos</h2>
    <div class="toc-item part-header"><span>PARTE A — Propuesta Laboral y Análisis de Negocio</span><div class="toc-dots"></div><span class="toc-section">Pág. 3</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>A.1 Scoping y Declaración de Propósitos</span><div class="toc-dots"></div><span class="toc-section">Pág. 3</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>A.2 Benchmarking de Soluciones Similares</span><div class="toc-dots"></div><span class="toc-section">Pág. 3</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>A.3 Rentabilidad y Retorno de la Inversión (ROI)</span><div class="toc-dots"></div><span class="toc-section">Pág. 4</span></div>

    <div class="toc-item part-header"><span>PARTE B — Modelado Ambiental y Funcional</span><div class="toc-dots"></div><span class="toc-section">Pág. 5</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>B.1 Diagrama de Contexto (DFD Nivel 0)</span><div class="toc-dots"></div><span class="toc-section">Pág. 5</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>B.2 Lista de Acontecimientos Clasificada</span><div class="toc-dots"></div><span class="toc-section">Pág. 6</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>B.3 Diagrama de Flujo de Datos (DFD Nivel 1)</span><div class="toc-dots"></div><span class="toc-section">Pág. 7</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>B.4 Especificación Formal de Caso de Uso (CU-01)</span><div class="toc-dots"></div><span class="toc-section">Pág. 8</span></div>

    <div class="toc-item part-header"><span>PARTE C — Modelado de Datos y Estructura</span><div class="toc-dots"></div><span class="toc-section">Pág. 9</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>C.1 Diagrama Entidad-Relación (DER Lógico)</span><div class="toc-dots"></div><span class="toc-section">Pág. 9</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>C.2 Diccionario de Datos Estructurado</span><div class="toc-dots"></div><span class="toc-section">Pág. 10</span></div>

    <div class="toc-item part-header"><span>PARTE D — Diseño Visual y Prototipado</span><div class="toc-dots"></div><span class="toc-section">Pág. 11</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>D.1 Lineamientos UI/UX &nbsp;|&nbsp; D.2 Mockups de Pantallas</span><div class="toc-dots"></div><span class="toc-section">Pág. 11</span></div>

    <div class="toc-item part-header"><span>PARTE E — Balanceo de Modelos y Matriz de Trazabilidad</span><div class="toc-dots"></div><span class="toc-section">Pág. 15</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>E.1 Balanceo DFD vs. DER vs. Diccionario &nbsp;|&nbsp; E.2 Matriz de Trazabilidad</span><div class="toc-dots"></div><span class="toc-section">Pág. 15</span></div>

    <div class="toc-item part-header"><span>PARTE F — Reglas de Negocio y Restricciones Técnicas</span><div class="toc-dots"></div><span class="toc-section">Pág. 17</span></div>
    <div class="toc-item" style="padding-left: 15px;"><span>F.1 Reglas de Negocio (RN) &nbsp;|&nbsp; F.2 Restricciones Técnicas y Calidad</span><div class="toc-dots"></div><span class="toc-section">Pág. 17</span></div>
  </div>

  <!-- ==================== PARTE A ==================== -->
  <div class="page-break"></div>
  <div class="part-title"><span class="part-num">PARTE A</span> PROPUESTA LABORAL Y ANÁLISIS DE NEGOCIO</div>

  <h2>A.1 Scoping y Declaración de Propósitos</h2>

  <div class="callout callout-info">
    <div class="callout-title">🎯 Propósito del Sistema</div>
    Proveer una aplicación web de gestión de inventario liviana, intuitiva y centralizada para una dietética minorista de barrio, optimizando el control de existencias pesables/fraccionadas y la consulta de proveedores comerciales, reduciendo las horas administrativas de recuento físico y previniendo quiebres de stock.
  </div>

  <h3>Procesos Incluidos (In Scope)</h3>
  <ul>
    <li><strong>Gestión de Mercadería:</strong> Altas, modificaciones, bajas y listado general de productos categorizados.</li>
    <li><strong>Gestión de Proveedores:</strong> Registro, actualización, eliminación y consulta de distribuidores mayoristas.</li>
    <li><strong>Asociación Relacional:</strong> Asignación directa de cada producto a su proveedor habitual (1:N, opcional en el alta).</li>
    <li><strong>Búsqueda y Filtros:</strong> Filtrado en tiempo real por coincidencia de nombre y clasificación taxonómica.</li>
    <li><strong>Monitoreo de Existencias:</strong> Indicadores visuales de stock bajo (umbral ≤ 5 unidades/kg) y agotado (= 0).</li>
  </ul>

  <h3>Procesos Excluidos (Out of Scope) y Justificación Técnica</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 35%;">Proceso Excluido</th>
        <th>Justificación Técnica y Operativa</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Facturación fiscal (AFIP/ARCA)</strong></td>
        <td>Excede el alcance de control de stock interno; no requerido en esta fase.</td>
      </tr>
      <tr>
        <td><strong>Punto de venta (POS) y caja diaria</strong></td>
        <td>La prioridad del comercio es ordenar depósitos y góndolas antes de automatizar caja.</td>
      </tr>
      <tr>
        <td><strong>Gestión de cuentas corrientes</strong></td>
        <td>Las compras y ventas del local se efectúan al contado/contra entrega.</td>
      </tr>
      <tr>
        <td><strong>Autenticación multi-rol</strong></td>
        <td>Sistema monousuario operado exclusivamente por la dueña en la terminal del local.</td>
      </tr>
    </tbody>
  </table>

  <h3>Categorías de Mercadería Soportada</h3>
  <p>El sistema se encuentra adaptado al tipo de mercadería fraccionable y pesable que comercializa una dietética:</p>
  <div style="margin: 8px 0 16px 0;">
    <span class="tag-pill">🌾 Cereales (arroz, avena)</span>
    <span class="tag-pill">🌱 Legumbres (lentejas, garbanzos)</span>
    <span class="tag-pill">✨ Semillas (chía, sésamo)</span>
    <span class="tag-pill">🫒 Aceites (oliva, coco)</span>
    <span class="tag-pill">🍵 Infusiones (té verde, manzanilla)</span>
    <span class="tag-pill">🥜 Frutos Secos (nueces, almendras)</span>
  </div>

  <h2>A.2 Benchmarking de Soluciones Similares</h2>
  <table>
    <thead>
      <tr>
        <th>Criterio Comparativo</th>
        <th>Excel / Google Sheets</th>
        <th>Tango Gestión (ERP)</th>
        <th>Treinta / Kyte App</th>
        <th style="background: #e8f5e9; color: #1b5e20;">Sistema Propuesto</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Enfoque en dietéticas</strong></td>
        <td>Nulo (planilla genérica)</td>
        <td>Nulo (corporativo)</td>
        <td>Genérico (kiosco/ropa)</td>
        <td><strong style="color: #1b5e20;">Específico (categorías y unidades ad-hoc)</strong></td>
      </tr>
      <tr>
        <td><strong>Validación de datos</strong></td>
        <td>Nula (propensa a celdas corruptas)</td>
        <td>Alta (motor relacional estricto)</td>
        <td>Media (orientado a venta rápida)</td>
        <td><strong style="color: #1b5e20;">Alta (validación en backend y frontend)</strong></td>
      </tr>
      <tr>
        <td><strong>Vínculo producto-proveedor</strong></td>
        <td>Manual por texto</td>
        <td>Módulo complejo sobredimensionado</td>
        <td>Limitado / de pago</td>
        <td><strong style="color: #1b5e20;">Directo, relacional y configurable (1 a N)</strong></td>
      </tr>
      <tr>
        <td><strong>Curva de aprendizaje</strong></td>
        <td>Media</td>
        <td>Muy alta (requiere semanas de curso)</td>
        <td>Baja</td>
        <td><strong style="color: #1b5e20;">Mínima (interfaz limpia para no técnicos)</strong></td>
      </tr>
      <tr>
        <td><strong>Manejo fraccionado (kg, gr)</strong></td>
        <td>Requiere fórmulas manuales</td>
        <td>Configuración compleja de artículos</td>
        <td>Inflexible para decimales</td>
        <td><strong style="color: #1b5e20;">Nativo (soporta decimales y selectores)</strong></td>
      </tr>
      <tr>
        <td><strong>Costo de adopción</strong></td>
        <td>"Gratis" (demanda horas manuales)</td>
        <td>Licencia corporativa muy onerosa</td>
        <td>Suscripción mensual recurrente</td>
        <td><strong style="color: #1b5e20;">Costo único accesible de implementación</strong></td>
      </tr>
    </tbody>
  </table>

  <div class="callout">
    <strong>Conclusión del Benchmarking:</strong> Excel carece de integridad relacional; Tango ERP introduce módulos innecesarios (sueldos, asientos contables) inmanejables para una microempresa; las aplicaciones móviles no ofrecen la ergonomía necesaria para carga de escritorio con balanza comercial. Nuestro sistema cubre con precisión este nicho operativo.
  </div>

  <h2>A.3 Rentabilidad y Retorno de la Inversión (ROI)</h2>
  <div class="metric-grid avoid-break">
    <div class="metric-card">
      <div class="metric-num">3.5 hs/sem</div>
      <div class="metric-label">Ahorro Operativo</div>
      <div class="metric-desc">≈ 14 horas mensuales recuperadas para atención comercial al erradicar recuentos manuales.</div>
    </div>
    <div class="metric-card">
      <div class="metric-num">$45.000</div>
      <div class="metric-label">Prevención de Pérdidas</div>
      <div class="metric-desc">Estimación mensual recuperada al evitar quiebres de stock en artículos de alto margen (frutos secos).</div>
    </div>
    <div class="metric-card">
      <div class="metric-num">45 Días</div>
      <div class="metric-label">Plazo de Amortización</div>
      <div class="metric-desc">La inversión inicial del desarrollo se amortiza operativamente en mes y medio de uso continuo.</div>
    </div>
  </div>

  <!-- ==================== PARTE B ==================== -->
  <div class="page-break"></div>
  <div class="part-title"><span class="part-num">PARTE B</span> MODELADO AMBIENTAL Y FUNCIONAL</div>

  <h2>B.1 Diagrama de Contexto (DFD Nivel 0)</h2>
  <p>La Dueña / Administradora es el <strong>único terminador interactivo directo</strong> de la aplicación. Los proveedores son entidades informativas registradas por la dueña, no usuarios de la consola web.</p>

  <div class="diagram-wrapper">
    <div class="diagram-title">Diagrama de Contexto — Frontera del Sistema y Terminador Único</div>
    <div class="mermaid">${d1Mermaid}</div>
  </div>

  <h3>Terminador Externo</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Terminador</th>
        <th style="width: 25%;">Rol</th>
        <th>Intercambio de Información</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Dueña / Administradora</strong></td>
        <td>Operadora monousuario del local</td>
        <td>
          <strong>Entrada:</strong> <code>Datos_Producto_Entrada</code>, <code>Datos_Proveedor_Entrada</code>, <code>Criterio_Busqueda</code>, <code>Comandos_CRUD</code><br>
          <strong>Salida:</strong> <code>Grilla_Inventario</code>, <code>Directorio_Proveedores</code>, <code>Alerta_Stock</code>, <code>Mensaje_Respuesta</code>
        </td>
      </tr>
    </tbody>
  </table>

  <h2>B.2 Lista de Acontecimientos Clasificada</h2>
  <p>Clasificación estándar: <strong>(F) Flujo</strong>: Entrada externa con persistencia. <strong>(T) Temporal</strong>: Reloj o control periódico. <strong>(C) Control</strong>: Señal, baja o consulta sin carga masiva.</p>

  <table>
    <thead>
      <tr>
        <th style="width: 6%;">#</th>
        <th style="width: 10%;">Tipo</th>
        <th style="width: 38%;">Acontecimiento Externo</th>
        <th>Respuesta Obligatoria del Software</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1</strong></td>
        <td><span class="badge badge-f">Flujo</span></td>
        <td>La dueña registra un nuevo producto</td>
        <td>Valida campos requeridos/unicidad y persiste en <code>D1_PRODUCTOS</code>.</td>
      </tr>
      <tr>
        <td><strong>2</strong></td>
        <td><span class="badge badge-f">Flujo</span></td>
        <td>La dueña actualiza datos de un producto</td>
        <td>Sobrescribe los atributos modificados en <code>D1_PRODUCTOS</code>.</td>
      </tr>
      <tr>
        <td><strong>3</strong></td>
        <td><span class="badge badge-f">Flujo</span></td>
        <td>La dueña registra un nuevo proveedor</td>
        <td>Valida datos de contacto y persiste en <code>D2_PROVEEDORES</code>.</td>
      </tr>
      <tr>
        <td><strong>4</strong></td>
        <td><span class="badge badge-f">Flujo</span></td>
        <td>La dueña actualiza datos de un proveedor</td>
        <td>Sobrescribe los datos de contacto en <code>D2_PROVEEDORES</code>.</td>
      </tr>
      <tr>
        <td><strong>5</strong></td>
        <td><span class="badge badge-c">Control</span></td>
        <td>La dueña solicita eliminar un producto</td>
        <td>Pide confirmación y elimina físicamente el registro en <code>D1_PRODUCTOS</code>.</td>
      </tr>
      <tr>
        <td><strong>6</strong></td>
        <td><span class="badge badge-c">Control</span></td>
        <td>La dueña solicita eliminar un proveedor</td>
        <td>Verifica que no posea productos asociados y ejecuta la baja en <code>D2_PROVEEDORES</code>.</td>
      </tr>
      <tr>
        <td><strong>7</strong></td>
        <td><span class="badge badge-c">Control</span></td>
        <td>La dueña consulta el inventario general</td>
        <td>Recupera registros de <code>D1</code> y renderiza la grilla principal.</td>
      </tr>
      <tr>
        <td><strong>8</strong></td>
        <td><span class="badge badge-c">Control</span></td>
        <td>La dueña filtra por nombre o categoría</td>
        <td>Ejecuta consulta con filtros y refresca la vista de productos.</td>
      </tr>
      <tr>
        <td><strong>9</strong></td>
        <td><span class="badge badge-c">Control</span></td>
        <td>La dueña asocia producto a proveedor</td>
        <td>Actualiza la clave foránea <code>id_proveedor</code> en <code>D1_PRODUCTOS</code>.</td>
      </tr>
      <tr>
        <td><strong>10</strong></td>
        <td><span class="badge badge-t">Temporal</span></td>
        <td>Verificación horaria de existencias</td>
        <td>Evalúa si <code>stock_actual ≤ 5</code> y activa indicador de reposición preventiva.</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== DFD NIVEL 1 ==================== -->
  <div class="page-break"></div>
  <h2>B.3 Diagrama de Flujo de Datos (DFD Nivel 1)</h2>
  <div class="diagram-wrapper">
    <div class="diagram-title">Descomposición Funcional — DFD Nivel 1</div>
    <div class="mermaid">${d2Mermaid}</div>
  </div>

  <h3>Especificación Sintética de Procesos</h3>
  <ul>
    <li><strong>1.0 Gestionar Productos:</strong> CRUD integral sobre el almacén <code>D1: PRODUCTOS</code>. Valida campos obligatorios, formato numérico y no negatividad.</li>
    <li><strong>2.0 Gestionar Proveedores:</strong> CRUD sobre <code>D2: PROVEEDORES</code>. Controla que no se eliminen distribuidores que tengan artículos activos vinculados.</li>
    <li><strong>3.0 Asociar Producto-Proveedor:</strong> Enlaza registros persistiendo la clave foránea <code>id_proveedor</code> en <code>D1</code> previa validación de existencia en <code>D2</code>.</li>
    <li><strong>4.0 Monitorear Stock y Consultas:</strong> Cruza datos de <code>D1</code> y <code>D2</code>, evalúa umbrales críticos (≤ 5) y entrega la grilla enriquecida con alertas.</li>
  </ul>

  <h2>B.4 Especificación Formal de Caso de Uso</h2>
  <div class="cu-card">
    <div class="cu-title">CU-01 — Registrar Nuevo Producto</div>
    <div class="cu-item"><strong>Actor Principal:</strong> Dueña / Administradora.</div>
    <div class="cu-item"><strong>Precondición:</strong> Aplicación web iniciada y pantalla principal de Inventario visible.</div>
    
    <div class="cu-item" style="margin-top: 10px;"><strong>Flujo Principal:</strong></div>
    <ol class="cu-steps">
      <li>La dueña presiona el botón <code>+ Agregar Producto</code>.</li>
      <li>El sistema despliega el formulario modal de alta y carga en el selector "Proveedor" los registros activos de <code>D2</code>.</li>
      <li>La dueña completa: Nombre, Categoría (dropdown), Stock actual (≥ 0), Unidad de medida (dropdown), Precio unitario (> 0) y Proveedor (opcional).</li>
      <li>La dueña presiona <code>Guardar</code>.</li>
      <li>El sistema valida: campos obligatorios no vacíos, stock y precio numéricos no negativos y unicidad de nombre en la categoría.</li>
      <li>El sistema genera un nuevo identificador <code>@id_producto</code> autoincremental y persiste el registro en <code>D1: PRODUCTOS</code>.</li>
      <li>El modal se cierra, la grilla se actualiza y se emite la notificación: <em>"Producto registrado con éxito"</em>.</li>
    </ol>

    <div class="cu-item" style="margin-top: 10px;"><strong>Flujos Alternativos:</strong></div>
    <ul class="cu-alt">
      <li><strong>FA-1 (Campo obligatorio faltante o numérico inválido):</strong> El sistema remarca el campo en rojo, emite mensaje descriptivo del error y conserva los datos en el modal. Retorna al paso 3.</li>
      <li><strong>FA-2 (Nombre duplicado en igual categoría):</strong> El sistema alerta la colisión y consulta si desea editar el existente en vez de crear uno nuevo.</li>
      <li><strong>FA-3 (Sin proveedores registrados):</strong> El selector muestra <code>(Sin proveedor asignado)</code>. La dueña puede guardar el producto sin proveedor y asociarlo posteriormente.</li>
    </ul>

    <div class="cu-item" style="margin-top: 10px;"><strong>Postcondición:</strong> Registro persistido físicamente en <code>D1</code> y visible de forma inmediata en el inventario.</div>
  </div>

  <!-- ==================== PARTE C ==================== -->
  <div class="page-break"></div>
  <div class="part-title"><span class="part-num">PARTE C</span> MODELADO DE DATOS Y ESTRUCTURA</div>

  <h2>C.1 Diagrama Entidad-Relación (DER Lógico)</h2>
  <div class="diagram-wrapper">
    <div class="diagram-title">Modelo Lógico Relacional — Cardinalidad 1:N</div>
    <div class="mermaid">${d3Mermaid}</div>
  </div>

  <div class="callout">
    <strong>Semántica del Modelo:</strong> Cardinalidad <strong>1:N</strong>. Un proveedor abastece de 0 a N productos. Un producto es suministrado por 0 o 1 proveedor formal (la clave foránea <code>id_proveedor</code> admite valores nulos para permitir mercadería sin distribuidor fijo asignado).
  </div>

  <h2>C.2 Diccionario de Datos Estructurado</h2>
  <p>Notación Oficial de Cátedra (Yourdon / DeMarco): <code>=</code> (está compuesto de) | <code>+</code> (concatenación) | <code>( )</code> (opcional) | <code>{ }</code> (repetición) | <code>[ ]</code> (selección disyuntiva) | <code>@</code> (clave primaria) | <code>* *</code> (comentario).</p>

  <h3>1. Almacenes de Persistencia</h3>
  <pre><code>D1_PRODUCTOS   = { Registro_Producto }
D2_PROVEEDORES = { Registro_Proveedor }</code></pre>

  <h3>2. Registros y Entidades</h3>
  <pre><code>Registro_Producto  = @id_producto + nombre + categoria + stock_actual + unidad_medida + precio_unitario + (id_proveedor)
Registro_Proveedor = @id_proveedor + nombre + telefono + (direccion)</code></pre>

  <h3>3. Flujos de Datos</h3>
  <pre><code>Datos_Producto_Entrada  = nombre + categoria + stock_actual + unidad_medida + precio_unitario + (id_proveedor)
Datos_Proveedor_Entrada = nombre + telefono + (direccion)
Criterio_Busqueda       = (termino_busqueda) + (categoria_filtro)
Alerta_Stock            = @id_producto + nombre + stock_actual + unidad_medida + estado_alerta</code></pre>

  <h3>4. Dominio de Campos Primitivos</h3>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Campo Primitivo</th>
        <th style="width: 12%;">Tipo Físico</th>
        <th style="width: 35%;">Dominio y Valores Válidos</th>
        <th>Restricción / Significado</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><code>@id_producto</code></td>
        <td>Entero</td>
        <td>> 0 autoincremental</td>
        <td>Clave primaria (PK) única de producto.</td>
      </tr>
      <tr>
        <td><code>nombre</code></td>
        <td>Texto(100)</td>
        <td>Cadena alfanumérica no vacía</td>
        <td>Denominación comercial del producto.</td>
      </tr>
      <tr>
        <td><code>categoria</code></td>
        <td>Texto</td>
        <td><code>[Cereales | Legumbres | Semillas | Aceites | Infusiones | Frutos Secos]</code></td>
        <td>Clasificación taxonómica de la tienda.</td>
      </tr>
      <tr>
        <td><code>stock_actual</code></td>
        <td>Decimal</td>
        <td>≥ 0.00 (hasta 2 decimales)</td>
        <td>Existencia física disponible. Admite fracciones.</td>
      </tr>
      <tr>
        <td><code>unidad_medida</code></td>
        <td>Texto</td>
        <td><code>[kg | gramos | litros | unidades | paquetes]</code></td>
        <td>Escala física de comercialización.</td>
      </tr>
      <tr>
        <td><code>precio_unitario</code></td>
        <td>Decimal</td>
        <td>> 0.00 en pesos argentinos (ARS)</td>
        <td>Precio de venta final por unidad de medida.</td>
      </tr>
      <tr>
        <td><code>id_proveedor</code> (FK)</td>
        <td>Entero</td>
        <td>ID existente en D2 o NULL</td>
        <td>Clave foránea referencial al proveedor asignado.</td>
      </tr>
      <tr>
        <td><code>@id_proveedor</code></td>
        <td>Entero</td>
        <td>> 0 autoincremental</td>
        <td>Clave primaria (PK) única de proveedor.</td>
      </tr>
      <tr>
        <td><code>telefono</code></td>
        <td>Texto(25)</td>
        <td>Cadena numérica y símbolos <code>()-+</code></td>
        <td>Teléfono directo o WhatsApp del distribuidor.</td>
      </tr>
      <tr>
        <td><code>direccion</code></td>
        <td>Texto(200)</td>
        <td>Texto libre (opcional)</td>
        <td>Domicilio del depósito o local mayorista.</td>
      </tr>
      <tr>
        <td><code>estado_alerta</code></td>
        <td>Texto</td>
        <td><code>[NORMAL | STOCK_BAJO | AGOTADO]</code></td>
        <td>Flag dinámico: AGOTADO (stock = 0), STOCK_BAJO (stock ≤ 5).</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== PARTE D ==================== -->
  <div class="page-break"></div>
  <div class="part-title"><span class="part-num">PARTE D</span> DISEÑO VISUAL Y PROTOTIPADO</div>

  <h2>D.1 Lineamientos UI/UX</h2>
  <ul>
    <li><strong>Consistencia Operativa:</strong> Barra superior fija con dos pestañas de navegación (<em>Inventario</em> y <em>Proveedores</em>).</li>
    <li><strong>Acciones Uniformes:</strong> Ícono de lápiz para edición con precarga y papelera para borrado con confirmación destructiva.</li>
    <li><strong>Formularios Modales:</strong> Carga rápida centrada sobre telón oscuro (backdrop) para evitar desvíos de foco.</li>
  </ul>

  <h2>D.2 Mockups de Pantallas</h2>

  <!-- MOCKUP 1 -->
  <div class="mockup-container">
    <div class="mockup-header">
      <span class="mockup-header-title">Pantalla 1 — Inventario (Listado General, Filtros y Alertas)</span>
      <span class="mockup-header-cu">CU-03 · CU-04 · CU-05 · CU-06</span>
    </div>
    <img src="${imgInventario}" class="mockup-img" alt="Pantalla Inventario">
    <table>
      <thead>
        <tr>
          <th style="width: 30%;">Componente</th>
          <th>Función y Comportamiento</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Buscador Reactivo</strong></td>
          <td>Input de texto con filtrado en tiempo real por coincidencia parcial de nombre.</td>
        </tr>
        <tr>
          <td><strong>Dropdown de Categoría</strong></td>
          <td>Selector para filtrar la grilla por familias taxonómicas (Cereales, Frutos Secos, etc.).</td>
        </tr>
        <tr>
          <td><strong>Botón "+ Agregar Producto"</strong></td>
          <td>Abre el modal de alta rápida de producto sin recargar la página.</td>
        </tr>
        <tr>
          <td><strong>Grilla con Alertas</strong></td>
          <td>Renderizado de existencias, unidad, precio y badges visuales para stock bajo (≤ 5) y agotado.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- MOCKUP 2 -->
  <div class="page-break"></div>
  <div class="mockup-container">
    <div class="mockup-header">
      <span class="mockup-header-title">Pantalla 2 — Modal Formulario de Producto (Alta y Edición)</span>
      <span class="mockup-header-cu">CU-01 · CU-02 · CU-10</span>
    </div>
    <img src="${imgFormProducto}" class="mockup-img" alt="Modal Formulario Producto">
    <table>
      <thead>
        <tr>
          <th style="width: 30%;">Campo / Control</th>
          <th>Validación y Regla Asociada</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Nombre del producto</strong></td>
          <td>Obligatorio. Alfanumérico hasta 100 caracteres. Validación de unicidad en la categoría (RN-01).</td>
        </tr>
        <tr>
          <td><strong>Categoría y Unidad</strong></td>
          <td>Obligatorios. Selectores desplegables con valores fijos predeterminados.</td>
        </tr>
        <tr>
          <td><strong>Stock actual y Precio</strong></td>
          <td>Obligatorios. Validación numérica: Stock ≥ 0.00 (RN-02) y Precio unitario > 0.00 (RN-03).</td>
        </tr>
        <tr>
          <td><strong>Proveedor Asignado</strong></td>
          <td>Opcional (RN-05). Selector precargado con los distribuidores registrados en D2.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- MOCKUP 3 -->
  <div class="page-break"></div>
  <div class="mockup-container">
    <div class="mockup-header">
      <span class="mockup-header-title">Pantalla 3 — Directorio de Proveedores</span>
      <span class="mockup-header-cu">CU-07 · CU-08 · CU-09</span>
    </div>
    <img src="${imgProveedores}" class="mockup-img" alt="Pantalla Proveedores">
    <table>
      <thead>
        <tr>
          <th style="width: 30%;">Componente</th>
          <th>Función y Control de Integridad</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Directorio de Contacto</strong></td>
          <td>Listado de razón social, teléfono/WhatsApp de pedidos y dirección de depósitos mayoristas.</td>
        </tr>
        <tr>
          <td><strong>Columna "Productos asociados"</strong></td>
          <td>Cálculo dinámico de artículos vinculados. Impide borrado accidental si el contador es > 0 (RN-04).</td>
        </tr>
        <tr>
          <td><strong>Botón "+ Agregar Proveedor"</strong></td>
          <td>Abre el modal de alta de distribuidor comercial.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- MOCKUP 4 -->
  <div class="avoid-break">
    <div class="mockup-container">
      <div class="mockup-header">
        <span class="mockup-header-title">Pantalla 4 — Modal Formulario de Proveedor (Alta y Edición)</span>
        <span class="mockup-header-cu">CU-07 · CU-08</span>
      </div>
      <img src="${imgFormProveedor}" class="mockup-img" alt="Modal Formulario Proveedor">
      <table>
        <thead>
          <tr>
            <th style="width: 30%;">Campo</th>
            <th>Tipo de Control y Requerimiento</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Nombre de distribuidor</strong></td>
            <td>Obligatorio. Razón social o nombre de fantasía comercial del proveedor.</td>
          </tr>
          <tr>
            <td><strong>Teléfono</strong></td>
            <td>Obligatorio. Línea de llamadas o número de WhatsApp directo para reposiciones.</td>
          </tr>
          <tr>
            <td><strong>Dirección</strong></td>
            <td>Opcional. Domicilio físico del depósito o local de retiro.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ==================== PARTE E ==================== -->
  <div class="page-break"></div>
  <div class="part-title"><span class="part-num">PARTE E</span> BALANCEO DE MODELOS Y MATRIZ DE TRAZABILIDAD</div>

  <h2>E.1 Matriz de Balanceo Estricto: DFD vs. DER vs. Diccionario de Datos</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Almacén (DFD N1)</th>
        <th style="width: 20%;">Entidad (DER)</th>
        <th style="width: 30%;">Registro (Diccionario)</th>
        <th>Verificación de Coherencia</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>D1: PRODUCTOS</strong></td>
        <td><code>PRODUCTO</code></td>
        <td><code>D1_PRODUCTOS = { Registro_Producto }</code></td>
        <td><strong style="color: #1b5e20;">✓ Balanceado:</strong> Coinciden @id_producto (PK), nombre, categoria, stock_actual, unidad_medida, precio_unitario y id_proveedor (FK).</td>
      </tr>
      <tr>
        <td><strong>D2: PROVEEDORES</strong></td>
        <td><code>PROVEEDOR</code></td>
        <td><code>D2_PROVEEDORES = { Registro_Proveedor }</code></td>
        <td><strong style="color: #1b5e20;">✓ Balanceado:</strong> Coinciden @id_proveedor (PK), nombre, telefono y direccion.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout callout-info">
    <strong>Regla de Balances Estricta:</strong> Ningún almacén de datos del DFD carece de entidad en el DER; ningún flujo de escritura/lectura contiene campos ausentes en el Diccionario de Datos.
  </div>

  <h2>E.2 Matriz de Trazabilidad Integral de Requerimientos</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 12%; white-space: nowrap;">ID Req.</th>
        <th style="width: 24%;">Acontecimiento Disparador</th>
        <th style="width: 8%;">Tipo</th>
        <th style="width: 14%;">Proceso DFD</th>
        <th style="width: 14%;">Almacén / Entidad</th>
        <th style="width: 14%;">Caso de Uso</th>
        <th>Pantalla Asociada</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge badge-rf">RF-01</span></td>
        <td>#1: Dueña ingresa nuevo producto</td>
        <td><span class="badge badge-f">F</span></td>
        <td><strong>1.0</strong> Gestionar Prod.</td>
        <td>D1 / PRODUCTO</td>
        <td>CU-01 Alta Producto</td>
        <td>Pantalla 2 (Modal Producto)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-02</span></td>
        <td>#2: Dueña edita un producto</td>
        <td><span class="badge badge-f">F</span></td>
        <td><strong>1.0</strong> Gestionar Prod.</td>
        <td>D1 / PRODUCTO</td>
        <td>CU-02 Modif. Producto</td>
        <td>Pantalla 2 (Modal Producto)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-03</span></td>
        <td>#5: Dueña elimina un producto</td>
        <td><span class="badge badge-c">C</span></td>
        <td><strong>1.0</strong> Gestionar Prod.</td>
        <td>D1 / PRODUCTO</td>
        <td>CU-03 Baja Producto</td>
        <td>Pantalla 1 (Ícono papelera)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-04</span></td>
        <td>#7: Dueña visualiza inventario</td>
        <td><span class="badge badge-c">C</span></td>
        <td><strong>4.0</strong> Monitorear Stock</td>
        <td>D1 + D2</td>
        <td>CU-04 Consultar Stock</td>
        <td>Pantalla 1 (Grilla inventario)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-05</span></td>
        <td>#8: Dueña filtra por nombre/cat.</td>
        <td><span class="badge badge-c">C</span></td>
        <td><strong>4.0</strong> Monitorear Stock</td>
        <td>D1 / PRODUCTO</td>
        <td>CU-05 Filtrar Catálogo</td>
        <td>Pantalla 1 (Buscador/dropdown)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-06</span></td>
        <td>#10: Control horario de stock</td>
        <td><span class="badge badge-t">T</span></td>
        <td><strong>4.0</strong> Monitorear Stock</td>
        <td>D1 / PRODUCTO</td>
        <td>CU-06 Alerta Reposición</td>
        <td>Pantalla 1 (Indicador crítico)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-07</span></td>
        <td>#3: Dueña ingresa nuevo proveedor</td>
        <td><span class="badge badge-f">F</span></td>
        <td><strong>2.0</strong> Gestionar Prov.</td>
        <td>D2 / PROVEEDOR</td>
        <td>CU-07 Alta Proveedor</td>
        <td>Pantalla 4 (Modal Proveedor)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-08</span></td>
        <td>#4: Dueña edita un proveedor</td>
        <td><span class="badge badge-f">F</span></td>
        <td><strong>2.0</strong> Gestionar Prov.</td>
        <td>D2 / PROVEEDOR</td>
        <td>CU-08 Modif. Proveedor</td>
        <td>Pantalla 4 (Modal Proveedor)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-09</span></td>
        <td>#6: Dueña elimina un proveedor</td>
        <td><span class="badge badge-c">C</span></td>
        <td><strong>2.0</strong> Gestionar Prov.</td>
        <td>D2 / PROVEEDOR</td>
        <td>CU-09 Baja Proveedor</td>
        <td>Pantalla 3 (Ícono papelera)</td>
      </tr>
      <tr>
        <td><span class="badge badge-rf">RF-10</span></td>
        <td>#9: Dueña vincula producto a prov.</td>
        <td><span class="badge badge-c">C</span></td>
        <td><strong>3.0</strong> Asociar Prod-Prov</td>
        <td>D1 + D2</td>
        <td>CU-10 Vincular Prod-Prov</td>
        <td>Pantalla 2 (Dropdown Proveedor)</td>
      </tr>
    </tbody>
  </table>

  <!-- ==================== PARTE F ==================== -->
  <div class="page-break"></div>
  <div class="part-title"><span class="part-num">PARTE F</span> REGLAS DE NEGOCIO Y RESTRICCIONES TÉCNICAS</div>

  <h2>F.1 Reglas de Negocio (RN)</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 14%;">Código</th>
        <th style="width: 28%;">Nombre de la Regla</th>
        <th>Definición y Validación Operativa</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="badge badge-rn">RN-01</span></td>
        <td><strong>Unicidad por Categoría</strong></td>
        <td>No se permiten dos productos con igual nombre comercial en la misma categoría taxonómica.</td>
      </tr>
      <tr>
        <td><span class="badge badge-rn">RN-02</span></td>
        <td><strong>Existencias No Negativas</strong></td>
        <td>El atributo <code>stock_actual</code> debe ser un número real ≥ 0.00 en todo momento.</td>
      </tr>
      <tr>
        <td><span class="badge badge-rn">RN-03</span></td>
        <td><strong>Precios Positivos</strong></td>
        <td>El precio de venta unitario debe ser estrictamente > 0.00 en moneda de curso legal (ARS).</td>
      </tr>
      <tr>
        <td><span class="badge badge-rn">RN-04</span></td>
        <td><strong>Protección de Integridad</strong></td>
        <td>No se puede borrar físicamente un proveedor si posee productos vinculados en el almacén <code>D1</code>.</td>
      </tr>
      <tr>
        <td><span class="badge badge-rn">RN-05</span></td>
        <td><strong>Opcionalidad de Vínculo</strong></td>
        <td>Un producto puede crearse con <code>id_proveedor = NULL</code> sin obligar a asignarle proveedor al alta.</td>
      </tr>
      <tr>
        <td><span class="badge badge-rn">RN-06</span></td>
        <td><strong>Umbrales de Reposición</strong></td>
        <td>Si <code>stock_actual ≤ 5.00</code> se activa la alerta <code>STOCK_BAJO</code>; si es <code>= 0.00</code> pasa a <code>AGOTADO</code>.</td>
      </tr>
    </tbody>
  </table>

  <h2>F.2 Restricciones Técnicas y Calidad</h2>
  <div class="metric-grid avoid-break">
    <div class="metric-card">
      <div class="metric-num">< 25 s</div>
      <div class="metric-label">Ergonomía UX</div>
      <div class="metric-desc">Flujo completo de alta ejecutable en menos de 25 segundos sin recargar pantalla completa.</div>
    </div>
    <div class="metric-card">
      <div class="metric-num">< 100 ms</div>
      <div class="metric-label">Rendimiento Reactivo</div>
      <div class="metric-desc">Búsqueda predictiva con tiempo de respuesta imperceptible para el catálogo local.</div>
    </div>
    <div class="metric-card">
      <div class="metric-num">Flask Factory</div>
      <div class="metric-label">Preparación Backend</div>
      <div class="metric-desc">Arquitectura modular con <code>create_app</code>, Blueprints y ORM para la fase 2 de desarrollo.</div>
    </div>
  </div>

  <div class="avoid-break" style="margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <div style="font-weight: 700; color: #1b5e20; font-size: 10pt;">SISTEMA DE GESTIÓN DE INVENTARIO PARA DIETÉTICA</div>
      <div style="font-size: 8.5pt; color: #64748b;">Escuela Da Vinci — Análisis y Metodología de Sistemas (2026)</div>
    </div>
    <div style="text-align: right; font-size: 8.5pt; color: #64748b;">
      <div>Autores: <strong>Ricardo Gabriel Diaz &nbsp;·&nbsp; Nicolás Gerardo Benitez</strong></div>
      <div>Instancia: <strong>Primer Parcial</strong></div>
    </div>
  </div>

  <script>
    mermaid.initialize({
      startOnLoad: true,
      theme: 'base',
      themeVariables: {
        fontFamily: 'Plus Jakarta Sans, sans-serif',
        primaryColor: '#e8f5e9',
        primaryTextColor: '#1b5e20',
        primaryBorderColor: '#81c784',
        lineColor: '#2e7d32',
        secondaryColor: '#f1f8e9',
        tertiaryColor: '#ffffff',
        clusterBkg: '#f8fafc',
        clusterBorder: '#cbd5e1',
        edgeLabelBackground: '#ffffff',
        attributeBackgroundColorOdd: '#ffffff',
        attributeBackgroundColorEven: '#f8fafc',
        fontSize: '12px'
      },
      flowchart: {
        htmlLabels: true,
        curve: 'basis'
      }
    });
  </script>
</body>
</html>`;

(async () => {
  console.log('Escribiendo archivo HTML temporal en:', htmlPath);
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');

  console.log('Iniciando navegador Chrome headless...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files',
      '--disable-gpu',
      '--user-data-dir=/tmp/chrome_pdf_profile_' + Date.now()
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

  console.log('Navegando a archivo local...');
  await page.goto('file://' + htmlPath, { waitUntil: 'domcontentloaded' });

  console.log('Esperando que Mermaid renderice los diagramas...');
  await page.waitForFunction(() => document.querySelectorAll('.mermaid svg').length >= 3, { timeout: 15000 });

  // Wait 1.5 seconds for fonts and SVG rendering to settle
  await new Promise(r => setTimeout(r, 1500));

  const wrappers = await page.$$('.diagram-wrapper');
  if (wrappers[0]) await wrappers[0].screenshot({ path: '/tmp/verified_d1.png' });
  if (wrappers[1]) await wrappers[1].screenshot({ path: '/tmp/verified_d2.png' });
  if (wrappers[2]) await wrappers[2].screenshot({ path: '/tmp/verified_d3.png' });
  console.log('Diagram screenshots saved to /tmp/verified_d*.png');

  console.log('Generando archivo PDF en:', outputPath);
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; font-size: 7.5pt; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 0 16mm 3px 16mm; box-sizing: border-box;">
        <span>Escuela Da Vinci · Análisis y Metodología de Sistemas</span>
        <span>DietéticaApp — Especificación SRS (IEEE 830)</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; font-size: 7.5pt; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding: 3px 16mm 0 16mm; box-sizing: border-box;">
        <span>Ricardo Gabriel Diaz &nbsp;·&nbsp; Nicolás Gerardo Benitez</span>
        <span>Página <span class="pageNumber"></span> de <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '16mm',
      bottom: '16mm',
      left: '14mm',
      right: '14mm'
    }
  });

  console.log('¡PDF generado exitosamente!');
  await browser.close();

  // Clean up temp file
  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }
})();
