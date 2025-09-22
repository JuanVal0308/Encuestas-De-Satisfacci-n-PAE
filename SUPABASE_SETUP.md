# Configuración de Supabase para Sistema de Encuestas PAE

## Pasos para configurar Supabase

### 1. Crear proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Completa la información del proyecto:
   - **Name**: `encuestas-pae-envigado`
   - **Database Password**: (genera una contraseña segura)
   - **Region**: Selecciona la región más cercana (us-east-1 para Colombia)
5. Haz clic en "Create new project"

### 2. Configurar la base de datos

1. Ve a la sección **SQL Editor** en tu proyecto de Supabase
2. Copia y pega el contenido del archivo `database/schema.sql`
3. Ejecuta el script SQL
4. Verifica que las tablas se hayan creado correctamente

### 3. Obtener las credenciales

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - **Project URL** (algo como: `https://tu-proyecto.supabase.co`)
   - **anon public** key (la clave pública)

### 4. Configurar la aplicación

✅ **YA CONFIGURADO** - Las credenciales ya están configuradas en el archivo `js/config/supabase-config.js`:

```javascript
// Configuración de Supabase
const supabaseUrl = 'https://algrkzpmqvpmylszcrrk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ3JrenBtcXZwbXlsc3pjcnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjIyMTIsImV4cCI6MjA3Mzc5ODIxMn0.RZv3EiuAWBhWor1w07-twotlgBvIU-mtedHMdzhqZBU';
```

**Proyecto ID**: `algrkzpmqvpmylszcrrk`
**URL del Proyecto**: `https://algrkzpmqvpmylszcrrk.supabase.co`

### 5. Configurar políticas de seguridad (RLS)

El esquema SQL ya incluye las políticas necesarias para permitir acceso público sin autenticación. Las políticas permiten:

- **Lectura**: Cualquiera puede leer las encuestas
- **Escritura**: Cualquiera puede crear nuevas encuestas
- **Eliminación**: Cualquiera puede eliminar/restaurar encuestas

### 6. Verificar la configuración

1. Abre la aplicación en el navegador
2. Abre la consola del navegador (F12)
3. Deberías ver el mensaje: "Supabase conectado correctamente"
4. Si ves "Supabase no está disponible, usando localStorage", revisa la configuración

## Estructura de la base de datos

### Tabla `survey_responses`
- `id`: ID único de la respuesta
- `survey_type`: Tipo de encuesta (racion-servida, racion-industrializada, coordinadores)
- `response_data`: Datos de la encuesta en formato JSON
- `created_at`: Fecha de creación
- `updated_at`: Fecha de última actualización
- `is_deleted`: Si la respuesta está eliminada
- `deleted_at`: Fecha de eliminación

### Tabla `deleted_responses`
- `id`: ID único del registro
- `original_id`: ID de la respuesta original
- `survey_type`: Tipo de encuesta
- `response_data`: Datos de la encuesta
- `original_created_at`: Fecha original de creación
- `deleted_at`: Fecha de eliminación
- `deleted_by`: Quién eliminó la respuesta

## Funciones disponibles

### `get_survey_stats()`
Retorna estadísticas generales del sistema:
- Total de respuestas
- Respuestas por tipo de encuesta
- Respuestas eliminadas

### `get_responses_by_type_and_date(survey_type, start_date, end_date)`
Retorna respuestas filtradas por tipo y rango de fechas.

## Solución de problemas

### Error: "Supabase no está disponible"
1. Verifica que las credenciales estén correctas
2. Verifica que el proyecto de Supabase esté activo
3. Revisa la consola del navegador para errores específicos

### Error: "Row Level Security policy"
1. Verifica que las políticas RLS estén configuradas correctamente
2. Ejecuta nuevamente el script SQL del esquema

### Error de conexión
1. Verifica que la URL de Supabase sea correcta
2. Verifica que la clave anónima sea correcta
3. Verifica que el proyecto esté en la región correcta

## Características de seguridad

- **Sin autenticación**: La aplicación no requiere login
- **Acceso público**: Cualquiera puede ver y crear encuestas
- **RLS habilitado**: Las políticas controlan el acceso
- **Backup automático**: Los datos se guardan en localStorage como respaldo

## Monitoreo

Puedes monitorear el uso de la base de datos en:
- **Dashboard** de Supabase → **Database** → **Tables**
- **Dashboard** de Supabase → **API** → **Logs**
- **Dashboard** de Supabase → **Database** → **Logs**

## Límites de Supabase

- **Plan gratuito**: 500MB de base de datos, 2GB de ancho de banda
- **Respuestas**: Aproximadamente 50,000 respuestas de encuesta
- **Concurrent users**: Hasta 50 usuarios simultáneos

Para más información, consulta la [documentación de Supabase](https://supabase.com/docs).
