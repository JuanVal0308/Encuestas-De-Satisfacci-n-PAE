# 🚀 Configuración Completa de Supabase - Sistema PAE

## 📋 Paso a Paso para Configurar Supabase

### PASO 1: Crear la Base de Datos en Supabase

1. **Ve a tu panel de Supabase**: https://supabase.com/dashboard
2. **Selecciona tu proyecto**: `algrkzpmqvpmylszcrrk`
3. **Ve a la sección "SQL Editor"** (en el menú lateral izquierdo)
4. **Copia y pega el código del archivo**: `setup-database.sql`

```sql
-- ============================================
-- CONFIGURACIÓN COMPLETA DE BASE DE DATOS PAE
-- ============================================

-- 1. CREAR TABLA PRINCIPAL
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- 2. CREAR ÍNDICES PARA RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_survey_responses_type ON survey_responses(type);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_deleted_at ON survey_responses(deleted_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_data_gin ON survey_responses USING GIN (data);

-- 3. FUNCIÓN PARA ACTUALIZAR TIMESTAMP AUTOMÁTICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. TRIGGER PARA ACTUALIZAR updated_at
CREATE TRIGGER update_survey_responses_updated_at 
    BEFORE UPDATE ON survey_responses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. HABILITAR ROW LEVEL SECURITY
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 6. POLÍTICAS DE SEGURIDAD (Permitir todas las operaciones)
CREATE POLICY "Allow all operations for anonymous users" ON survey_responses
    FOR ALL USING (true);

-- 7. CREAR VISTA PARA RESPUESTAS ACTIVAS
CREATE OR REPLACE VIEW active_survey_responses AS
SELECT * FROM survey_responses 
WHERE deleted_at IS NULL;

-- 8. CREAR VISTA PARA ESTADÍSTICAS
CREATE OR REPLACE VIEW survey_stats AS
SELECT 
    type,
    COUNT(*) as total_responses,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as last_month
FROM survey_responses 
WHERE deleted_at IS NULL
GROUP BY type;

-- 9. FUNCIÓN PARA FILTROS AVANZADOS
CREATE OR REPLACE FUNCTION get_filtered_responses(
    p_survey_type VARCHAR DEFAULT NULL,
    p_institution VARCHAR DEFAULT NULL,
    p_grade VARCHAR DEFAULT NULL,
    p_sex VARCHAR DEFAULT NULL,
    p_date_from TIMESTAMP DEFAULT NULL,
    p_date_to TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    type VARCHAR,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        sr.type,
        sr.data,
        sr.created_at
    FROM survey_responses sr
    WHERE sr.deleted_at IS NULL
        AND (p_survey_type IS NULL OR sr.type = p_survey_type)
        AND (p_institution IS NULL OR sr.data->>'institucion' = p_institution)
        AND (p_grade IS NULL OR sr.data->>'grado' = p_grade)
        AND (p_sex IS NULL OR sr.data->>'sexo' = p_sex)
        AND (p_date_from IS NULL OR sr.created_at >= p_date_from)
        AND (p_date_to IS NULL OR sr.created_at <= p_date_to)
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 10. INSERTAR DATOS DE PRUEBA (OPCIONAL)
INSERT INTO survey_responses (type, data) VALUES 
('racion-servida', '{"institucion": "IE Test", "grado": "5", "sexo": "Hombre", "manipuladoras_amables": "😁 Siempre"}'),
('racion-industrializada', '{"institucion": "IE Test", "grado": "3", "sexo": "Mujer", "calidad_alimentos": "😊 Casi siempre"}'),
('coordinadores', '{"institucion": "IE Test", "calidad_alimentos": "4 Excelente", "variedad_menus": "3 Bueno"}');

-- 11. VERIFICAR QUE TODO FUNCIONA
SELECT 'Configuración completada exitosamente' as status;
SELECT COUNT(*) as total_responses FROM survey_responses;
```

### PASO 2: Ejecutar el SQL

1. **Pega el código completo** en el editor SQL
2. **Haz clic en "Run"** (botón verde)
3. **Verifica que aparezca**: "Configuración completada exitosamente"
4. **Deberías ver**: "total_responses: 3" (los datos de prueba)

### PASO 3: Verificar la Configuración

1. **Ve a "Table Editor"** en el menú lateral
2. **Busca la tabla**: `survey_responses`
3. **Deberías ver**: 3 filas de datos de prueba
4. **Verifica las columnas**: id, type, data, created_at, updated_at, deleted_at

### PASO 4: Probar la Conexión

1. **Abre**: `test-supabase.html` en tu navegador
2. **Haz clic en**: "Probar Conexión"
3. **Deberías ver**: "✅ Conexión exitosa! Respuestas encontradas: 3"

## 🔧 Configuración de Credenciales

Las credenciales ya están configuradas en `supabase-config.js`:

```javascript
const supabaseUrl = 'https://algrkzpmqvpmylszcrrk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

## 🧪 Pruebas Recomendadas

### Prueba 1: Conexión Básica
- Abre `test-supabase.html`
- Haz clic en "Probar Conexión"
- Debería mostrar: "✅ Conexión exitosa!"

### Prueba 2: Guardar Datos
- Haz clic en "Probar Guardar Respuesta"
- Debería mostrar: "✅ Respuesta guardada exitosamente!"

### Prueba 3: Obtener Datos
- Haz clic en "Probar Obtener Respuestas"
- Debería mostrar el número total de respuestas

### Prueba 4: Aplicación Principal
- Abre `index.html`
- Ve a la sección "Encuestas"
- Completa una encuesta de prueba
- Verifica que se guarde correctamente

## 🚨 Solución de Problemas

### Error: "relation does not exist"
- **Causa**: La tabla no se creó correctamente
- **Solución**: Ejecuta el SQL completo nuevamente

### Error: "permission denied"
- **Causa**: Las políticas RLS no están configuradas
- **Solución**: Ejecuta la parte de políticas del SQL

### Error: "Failed to fetch"
- **Causa**: URL o API key incorrectos
- **Solución**: Verifica las credenciales en `supabase-config.js`

### Los datos no aparecen
- **Causa**: Problema con las políticas RLS
- **Solución**: Ejecuta este SQL adicional:

```sql
-- Permitir todas las operaciones
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON survey_responses;
CREATE POLICY "Allow all operations for anonymous users" ON survey_responses
    FOR ALL USING (true);
```

## ✅ Verificación Final

Después de completar todos los pasos, deberías tener:

1. ✅ Tabla `survey_responses` creada
2. ✅ 3 datos de prueba insertados
3. ✅ Políticas RLS configuradas
4. ✅ Conexión funcionando en `test-supabase.html`
5. ✅ Aplicación principal funcionando con Supabase

## 🎯 Próximos Pasos

1. **Probar la aplicación**: Completa encuestas reales
2. **Verificar datos**: Revisa que se guarden en Supabase
3. **Configurar dominio**: Si planeas usar en producción
4. **Backup**: Los datos se respaldan automáticamente en Supabase

¡Listo! Tu sistema de encuestas PAE ahora está completamente integrado con Supabase. 🚀
