# Sistema de Encuestas PAE - Versión 2

## 🚀 Nueva Arquitectura de Base de Datos

Esta versión 2 del sistema implementa una arquitectura de base de datos más robusta y escalable, separando las encuestas, preguntas, opciones, sesiones y respuestas en tablas independientes.

## 📊 Estructura de Base de Datos

### Tablas Principales

1. **`surveys`** - Encuestas (cabecera)
   - `id` - UUID único
   - `slug` - Identificador único de la encuesta
   - `title` - Título de la encuesta
   - `description` - Descripción opcional
   - `is_active` - Estado activo/inactivo
   - `created_at` - Fecha de creación

2. **`questions`** - Preguntas de las encuestas
   - `id` - UUID único
   - `survey_id` - Referencia a la encuesta
   - `text` - Texto de la pregunta
   - `type` - Tipo: 'single', 'multi', 'open', 'rating'
   - `ord` - Orden de la pregunta

3. **`choices`** - Opciones para preguntas de selección
   - `id` - UUID único
   - `question_id` - Referencia a la pregunta
   - `text` - Texto de la opción
   - `ord` - Orden de la opción

4. **`answer_sessions`** - Sesiones de respuesta
   - `id` - UUID único
   - `survey_id` - Referencia a la encuesta
   - `client_token` - Token único del cliente
   - `meta` - Metadatos adicionales (JSON)
   - `created_at` - Fecha de la sesión

5. **`answers`** - Respuestas individuales
   - `id` - UUID único
   - `session_id` - Referencia a la sesión
   - `question_id` - Referencia a la pregunta
   - `choice_id` - Opción seleccionada (para single/multi)
   - `value_text` - Valor de texto (para open)
   - `value_num` - Valor numérico (para rating)
   - `client_token` - Token del cliente

## 🔧 Instalación y Configuración

### 1. Configurar Base de Datos

```sql
-- Ejecutar en Supabase SQL Editor
-- 1. Crear nueva estructura
\i nueva-estructura-database.sql

-- 2. Migrar datos existentes (opcional)
\i migrate-to-v2.sql
```

### 2. Archivos de la Aplicación

- **`index-v2.html`** - Interfaz principal de la nueva versión
- **`script-v2.js`** - Lógica de la aplicación V2
- **`supabase-service-v2.js`** - Servicio de Supabase para V2
- **`nueva-estructura-database.sql`** - Esquema de base de datos
- **`migrate-to-v2.sql`** - Script de migración

### 3. Configuración de Supabase

```javascript
// En supabase-service-v2.js
const SUPABASE_URL = 'https://algrkzpmqvpmylszcrrk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 🎯 Características Principales

### 1. Encuestas Dinámicas
- Crear encuestas desde la interfaz
- Diferentes tipos de preguntas:
  - **Rating** (1-5 estrellas)
  - **Opción única** (radio buttons)
  - **Opción múltiple** (checkboxes)
  - **Texto abierto** (textarea)

### 2. Gestión de Sesiones
- Cada respuesta crea una sesión única
- Token de cliente para seguridad
- Metadatos de la sesión (user agent, timestamp)

### 3. Análisis Avanzado
- Estadísticas por pregunta
- Gráficos de distribución
- Análisis de texto
- Exportación de datos

### 4. Seguridad
- Row Level Security (RLS) habilitado
- Políticas de acceso configuradas
- Tokens únicos por sesión

## 📱 Uso de la Aplicación

### 1. Responder Encuesta
```javascript
// Cargar encuesta
await surveySystem.loadSurvey('racion-servida');

// Enviar respuestas
await surveySystem.submitSurvey();
```

### 2. Ver Análisis
```javascript
// Generar análisis
await surveySystem.showAnalysis();

// Obtener estadísticas
const stats = await supabaseService.getSurveyStats(surveyId);
```

### 3. Crear Nueva Encuesta
```javascript
// Crear encuesta
const survey = await supabaseService.createSurvey({
    slug: 'nueva-encuesta',
    title: 'Mi Nueva Encuesta',
    description: 'Descripción de la encuesta'
});

// Agregar preguntas
await supabaseService.addQuestion(survey.id, {
    text: '¿Cómo calificarías el servicio?',
    type: 'rating',
    ord: 1
});
```

## 🔄 Migración desde V1

### Datos Existentes
Si tienes datos en la estructura anterior, ejecuta:

```sql
-- 1. Crear nueva estructura
\i nueva-estructura-database.sql

-- 2. Migrar datos
\i migrate-to-v2.sql
```

### Archivos de V1
Los archivos de la versión anterior se mantienen:
- `index.html` - V1 (estructura anterior)
- `script.js` - V1
- `supabase-config.js` - V1

### Archivos de V2
- `index-v2.html` - V2 (nueva estructura)
- `script-v2.js` - V2
- `supabase-service-v2.js` - V2

## 🚀 Ventajas de la V2

### 1. Escalabilidad
- Estructura normalizada
- Fácil agregar nuevos tipos de preguntas
- Soporte para encuestas complejas

### 2. Flexibilidad
- Encuestas dinámicas
- Preguntas reutilizables
- Opciones configurables

### 3. Análisis Mejorado
- Estadísticas detalladas
- Filtros avanzados
- Reportes personalizados

### 4. Seguridad
- RLS configurado
- Tokens únicos
- Validación de datos

## 📊 Ejemplos de Uso

### Crear Encuesta de Satisfacción
```sql
-- Insertar encuesta
INSERT INTO public.surveys (slug, title, description)
VALUES ('satisfaccion-2025', 'Satisfacción PAE 2025', 'Encuesta anual de satisfacción');

-- Obtener ID
WITH survey AS (SELECT id FROM public.surveys WHERE slug = 'satisfaccion-2025')
INSERT INTO public.questions (survey_id, text, type, ord)
SELECT id, '¿Cómo calificarías el servicio?', 'rating', 1 FROM survey;
```

### Analizar Respuestas
```javascript
// Obtener estadísticas
const stats = await supabaseService.getSurveyStats(surveyId);

// Obtener respuestas
const responses = await supabaseService.getSurveyResponses(surveyId);

// Generar reporte
const report = generateReport(stats, responses);
```

## 🔧 Desarrollo

### Estructura del Proyecto
```
Encuestas-De-Satisfacci-n-PAE/
├── index-v2.html              # Interfaz V2
├── script-v2.js               # Lógica V2
├── supabase-service-v2.js     # Servicio V2
├── nueva-estructura-database.sql
├── migrate-to-v2.sql
├── README-V2.md
└── [archivos V1...]
```

### Próximos Pasos
1. ✅ Estructura de base de datos
2. ✅ Servicio de Supabase
3. ✅ Interfaz de usuario
4. 🔄 Migración de datos
5. 🔄 Pruebas de integración
6. 🔄 Documentación completa

## 📞 Soporte

Para soporte técnico o preguntas sobre la V2:
- Revisar documentación
- Verificar configuración de Supabase
- Comprobar políticas RLS
- Validar estructura de datos

---

**Versión 2.0** - Sistema de Encuestas PAE
*Arquitectura mejorada para mayor escalabilidad y flexibilidad*
