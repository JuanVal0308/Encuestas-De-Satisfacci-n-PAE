# Configuración de Supabase para el Sistema de Encuestas PAE

## 🚀 Pasos para configurar Supabase

### 1. Crear la tabla en Supabase

Ve a tu panel de Supabase (https://supabase.com/dashboard) y ejecuta el siguiente SQL en el editor SQL:

```sql
-- Crear tabla para las respuestas de las encuestas
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'racion-servida', 'racion-industrializada', 'coordinadores'
    data JSONB NOT NULL, -- Todos los datos del formulario
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_survey_responses_type ON survey_responses(type);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_deleted_at ON survey_responses(deleted_at);

-- Crear índice GIN para búsquedas en el campo JSONB
CREATE INDEX IF NOT EXISTS idx_survey_responses_data_gin ON survey_responses USING GIN (data);

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_survey_responses_updated_at 
    BEFORE UPDATE ON survey_responses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Política para permitir operaciones anónimas
CREATE POLICY "Allow all operations for anonymous users" ON survey_responses
    FOR ALL USING (true);
```

### 2. Configurar las credenciales

Las credenciales ya están configuradas en `supabase-config.js`:

- **URL**: https://algrkzpmqvpmylszcrrk.supabase.co
- **API Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZ3JrenBtcXZwbXlsc3pjcnJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjIyMTIsImV4cCI6MjA3Mzc5ODIxMn0.RZv3EiuAWBhWor1w07-twotlgBvIU-mtedHMdzhqZBU

### 3. Verificar la configuración

1. Abre la consola del navegador (F12)
2. Recarga la página
3. Deberías ver el mensaje: "Supabase inicializado correctamente"
4. Si hay errores, verifica que la tabla se haya creado correctamente

## 🔧 Funcionalidades implementadas

### ✅ Guardado automático
- Las respuestas se guardan automáticamente en Supabase
- Fallback a localStorage si Supabase no está disponible

### ✅ Filtros avanzados
- Filtro por tipo de encuesta
- Filtro por institución
- Filtro por grado
- Filtro por sexo
- Filtro por rango de fechas

### ✅ Tiempo real
- Los cambios se reflejan automáticamente en todas las pestañas abiertas
- No necesitas recargar la página para ver nuevos datos

### ✅ Papelera
- Las respuestas eliminadas se marcan como eliminadas (soft delete)
- Puedes restaurar respuestas desde la papelera

## 🛠️ Solución de problemas

### Error: "Failed to fetch"
- Verifica que la URL de Supabase sea correcta
- Asegúrate de que la tabla `survey_responses` exista
- Revisa que las políticas RLS estén configuradas

### Error: "Invalid API key"
- Verifica que la API key sea correcta
- Asegúrate de que el proyecto esté activo en Supabase

### Los datos no se cargan
- Revisa la consola del navegador para errores
- Verifica que la tabla tenga datos
- Asegúrate de que las políticas RLS permitan lectura

## 📊 Ventajas de usar Supabase

1. **Persistencia**: Los datos se guardan en la nube
2. **Escalabilidad**: Maneja miles de respuestas sin problemas
3. **Tiempo real**: Cambios instantáneos entre usuarios
4. **Seguridad**: Row Level Security para proteger los datos
5. **Backup automático**: Los datos están respaldados automáticamente
6. **Consultas avanzadas**: Puedes hacer consultas SQL complejas
7. **API REST**: Acceso programático a los datos

## 🔄 Migración de datos existentes

Si ya tienes datos en localStorage, se migrarán automáticamente la primera vez que uses Supabase. Los datos se mantienen en localStorage como respaldo.
