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

-- Política para permitir lectura y escritura a usuarios autenticados
-- (Por ahora permitimos todo, pero puedes restringir según tus necesidades)
CREATE POLICY "Allow all operations for authenticated users" ON survey_responses
    FOR ALL USING (true);

-- Política para permitir operaciones anónimas (si no tienes autenticación)
CREATE POLICY "Allow all operations for anonymous users" ON survey_responses
    FOR ALL USING (true);

-- Crear vista para respuestas activas (no eliminadas)
CREATE OR REPLACE VIEW active_survey_responses AS
SELECT * FROM survey_responses 
WHERE deleted_at IS NULL;

-- Crear vista para estadísticas
CREATE OR REPLACE VIEW survey_stats AS
SELECT 
    type,
    COUNT(*) as total_responses,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as last_week,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as last_month
FROM survey_responses 
WHERE deleted_at IS NULL
GROUP BY type;

-- Función para obtener respuestas filtradas
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
