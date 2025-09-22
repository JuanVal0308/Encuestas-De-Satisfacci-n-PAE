-- Esquema de base de datos para Sistema de Encuestas PAE
-- Configuración para Supabase sin autenticación

-- Habilitar RLS (Row Level Security) pero permitir acceso público
-- Esto permite que cualquier persona pueda leer/escribir sin autenticación

-- Tabla para respuestas de encuestas
CREATE TABLE IF NOT EXISTS survey_responses (
    id SERIAL PRIMARY KEY,
    survey_type VARCHAR(50) NOT NULL,
    response_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Tabla para respuestas eliminadas (papelera)
CREATE TABLE IF NOT EXISTS deleted_responses (
    id SERIAL PRIMARY KEY,
    original_id INTEGER REFERENCES survey_responses(id),
    survey_type VARCHAR(50) NOT NULL,
    response_data JSONB NOT NULL,
    original_created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_by VARCHAR(50) DEFAULT 'user'
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_survey_responses_type ON survey_responses(survey_type);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_survey_responses_deleted ON survey_responses(is_deleted);
CREATE INDEX IF NOT EXISTS idx_deleted_responses_type ON deleted_responses(survey_type);
CREATE INDEX IF NOT EXISTS idx_deleted_responses_deleted_at ON deleted_responses(deleted_at);

-- Configurar RLS (Row Level Security) para permitir acceso público
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_responses ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acceso público (sin autenticación)
-- Política para survey_responses: permitir todo
CREATE POLICY "Allow public access to survey_responses" ON survey_responses
    FOR ALL USING (true) WITH CHECK (true);

-- Política para deleted_responses: permitir todo
CREATE POLICY "Allow public access to deleted_responses" ON deleted_responses
    FOR ALL USING (true) WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_survey_responses_updated_at 
    BEFORE UPDATE ON survey_responses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para obtener estadísticas generales
CREATE OR REPLACE FUNCTION get_survey_stats()
RETURNS TABLE (
    total_responses BIGINT,
    racion_servida_count BIGINT,
    racion_industrializada_count BIGINT,
    coordinadores_count BIGINT,
    deleted_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM survey_responses WHERE is_deleted = FALSE) as total_responses,
        (SELECT COUNT(*) FROM survey_responses WHERE survey_type = 'racion-servida' AND is_deleted = FALSE) as racion_servida_count,
        (SELECT COUNT(*) FROM survey_responses WHERE survey_type = 'racion-industrializada' AND is_deleted = FALSE) as racion_industrializada_count,
        (SELECT COUNT(*) FROM survey_responses WHERE survey_type = 'coordinadores' AND is_deleted = FALSE) as coordinadores_count,
        (SELECT COUNT(*) FROM deleted_responses) as deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener respuestas por tipo y fecha
CREATE OR REPLACE FUNCTION get_responses_by_type_and_date(
    p_survey_type VARCHAR DEFAULT NULL,
    p_start_date TIMESTAMP DEFAULT NULL,
    p_end_date TIMESTAMP DEFAULT NULL
)
RETURNS TABLE (
    id INTEGER,
    survey_type VARCHAR,
    response_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id,
        sr.survey_type,
        sr.response_data,
        sr.created_at
    FROM survey_responses sr
    WHERE sr.is_deleted = FALSE
    AND (p_survey_type IS NULL OR sr.survey_type = p_survey_type)
    AND (p_start_date IS NULL OR sr.created_at >= p_start_date)
    AND (p_end_date IS NULL OR sr.created_at <= p_end_date)
    ORDER BY sr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insertar datos de ejemplo (opcional)
-- INSERT INTO survey_responses (survey_type, response_data) VALUES 
-- ('racion-servida', '{"institucion": "Escuela Ejemplo", "grado": "5", "satisfaccion": "Muy satisfecho"}'::jsonb);

-- Comentarios sobre el esquema
COMMENT ON TABLE survey_responses IS 'Almacena todas las respuestas de las encuestas PAE';
COMMENT ON TABLE deleted_responses IS 'Almacena respuestas eliminadas (papelera)';
COMMENT ON FUNCTION get_survey_stats() IS 'Obtiene estadísticas generales del sistema';
COMMENT ON FUNCTION get_responses_by_type_and_date(VARCHAR, TIMESTAMP, TIMESTAMP) IS 'Obtiene respuestas filtradas por tipo y fecha';
