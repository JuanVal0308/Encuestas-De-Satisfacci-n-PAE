-- ============================================
-- CONFIGURACIÓN COMPLETA DE BASE DE DATOS PAE
-- ============================================
-- Ejecutar este código completo en el SQL Editor de Supabase

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

-- 10. INSERTAR DATOS DE PRUEBA
INSERT INTO survey_responses (type, data) VALUES 
('racion-servida', '{"institucion": "IE Alejandro Vélez Barrientos", "grado": "5", "sexo": "Hombre", "fecha_nacimiento": "2010-01-01", "manipuladoras_amables": "😁 Siempre", "alimentos_variados": "😊 Casi siempre", "alimentos_presentacion": "😁 Siempre"}'),
('racion-industrializada', '{"institucion": "IE Comercial de Envigado", "grado": "3", "sexo": "Mujer", "fecha_nacimiento": "2012-05-15", "calidad_alimentos": "😊 Casi siempre", "variedad_menus": "😁 Siempre", "presentacion_alimentos": "😁 Siempre"}'),
('coordinadores', '{"institucion": "IE La Paz", "fecha_nacimiento": "1985-03-20", "calidad_alimentos": "4 Excelente", "variedad_menus": "3 Bueno", "tamano_porciones": "4 Excelente", "aseo_organizacion": "3 Bueno"}');

-- 11. VERIFICAR CONFIGURACIÓN
SELECT '✅ Configuración completada exitosamente' as status;
SELECT COUNT(*) as total_responses FROM survey_responses;
SELECT type, COUNT(*) as count FROM survey_responses GROUP BY type;
