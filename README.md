# Sistema de Encuestas PAE - Envigado

## Descripción
Sistema web completo para la gestión de encuestas de satisfacción del Programa de Alimentación Escolar (PAE) de Envigado. La aplicación permite realizar encuestas, visualizar resultados y exportar datos a Excel.

## Características

### 🎯 Funcionalidades Principales
- **Encuestas disponibles**:
  - 🍽️ Ración Servida (para estudiantes)
  - 👨‍💼 Coordinadores PAE (para personal educativo)
  - 🏘️ Comedores Comunitarios: primero se elige el complemento (almuerzo – ración servida, o ración industrializada – RI) y solo se muestran sus preguntas
  - 🧓 Centros Vida: desayuno, refrigerio (RPS) o almuerzo, con preguntas según la modalidad
  - 📦 Paquetes de Alimentos: entrega en bodega o sitio de distribución
  - 🍪 Ración Industrializada: ya no se diligencia por separado (ahora está dentro de Comedores Comunitarios); sus respuestas anteriores siguen en Resultados y Exportación como "histórico"

- **Gestión de Datos**:
  - Almacenamiento local en el navegador
  - Visualización de resultados con gráficos
  - Exportación a Excel
  - Estadísticas generales

### 🎨 Diseño
- Interfaz moderna y responsive
- Colores institucionales de Envigado
- Sin marcas de agua de JotForm
- Experiencia de usuario optimizada

## Estructura del Proyecto

```
├── index.html              # Página principal
├── styles.css              # Estilos CSS
├── script.js               # Lógica de la aplicación
├── surveys/                # Formularios de encuestas
│   ├── racion-servida.html
│   ├── coordinadores.html
│   ├── comedores-comunitarios.html
│   ├── centros-vida.html
│   └── paquetes-alimentos.html
└── README.md               # Este archivo
```

## Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexión a internet (para cargar librerías externas)

### Instalación
1. Descargar todos los archivos del proyecto
2. Colocar en una carpeta del servidor web
3. Abrir `index.html` en el navegador

### Uso
1. **Realizar Encuestas**: 
   - Ir a la sección "Encuestas"
   - Seleccionar el tipo de encuesta
   - Completar el formulario
   - Enviar

2. **Ver Resultados**:
   - Ir a la sección "Resultados"
   - Seleccionar el tipo de encuesta
   - Visualizar gráficos y estadísticas

3. **Administración**:
   - Ver estadísticas generales
   - Exportar todos los datos a Excel

## Tecnologías Utilizadas

- **HTML5**: Estructura de la aplicación
- **CSS3**: Estilos y diseño responsive
- **JavaScript ES6+**: Lógica de la aplicación
- **Chart.js**: Gráficos y visualizaciones
- **SheetJS**: Exportación a Excel
- **LocalStorage**: Almacenamiento de datos

## Características Técnicas

### Almacenamiento
- Los datos se guardan en el LocalStorage del navegador
- Cada respuesta incluye: ID, tipo, fecha y datos del formulario
- Los datos persisten entre sesiones

### Exportación
- Formato Excel (.xlsx)
- Incluye todas las respuestas con metadatos
- Filtrado por tipo de encuesta

### Responsive Design
- Adaptable a dispositivos móviles y tablets
- Navegación optimizada para pantallas pequeñas
- Formularios accesibles en todos los dispositivos

## Personalización

### Colores Institucionales
```css
--color-primary: #EA5B0C;    /* Naranja institucional */
--color-secondary: #6EB3A6;  /* Verde institucional */
--color-accent: #F29100;     /* Naranja claro */
```

### Modificar Encuestas
1. Editar archivos HTML en la carpeta `surveys/`
2. Mantener la estructura de formularios
3. Conservar los nombres de los campos

## Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

## Licencia

Sistema desarrollado para la Alcaldía de Envigado - Programa de Alimentación Escolar (PAE).

---

**Desarrollado con ❤️ para la comunidad educativa de Envigado**
