-- ============================================
-- LIMPIAR Y RECREAR BASE DE DATOS PAE
-- ============================================
-- Ejecutar este código para limpiar todo y empezar de nuevo

-- 1. ELIMINAR TRIGGER SI EXISTE
DROP TRIGGER IF EXISTS update_survey_responses_updated_at ON survey_responses;

-- 2. ELIMINAR FUNCIÓN SI EXISTE
DROP FUNCTION IF EXISTS update_updated_at_column();

-- 3. ELIMINAR VISTAS SI EXISTEN
DROP VIEW IF EXISTS active_survey_responses;
DROP VIEW IF EXISTS survey_stats;

-- 4. ELIMINAR FUNCIÓN DE FILTROS SI EXISTE
DROP FUNCTION IF EXISTS get_filtered_responses(VARCHAR, VARCHAR, VARCHAR, VARCHAR, TIMESTAMP, TIMESTAMP);

-- 5. ELIMINAR TABLA SI EXISTE
DROP TABLE IF EXISTS survey_responses CASCADE;

-- 6. CREAR TABLA NUEVA
CREATE TABLE survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- 7. CREAR ÍNDICES
CREATE INDEX idx_survey_responses_type ON survey_responses(type);
CREATE INDEX idx_survey_responses_created_at ON survey_responses(created_at);
CREATE INDEX idx_survey_responses_deleted_at ON survey_responses(deleted_at);
CREATE INDEX idx_survey_responses_data_gin ON survey_responses USING GIN (data);

-- 8. CREAR FUNCIÓN PARA ACTUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. CREAR TRIGGER
CREATE TRIGGER update_survey_responses_updated_at 
    BEFORE UPDATE ON survey_responses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. HABILITAR ROW LEVEL SECURITY
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 11. CREAR POLÍTICAS
DROP POLICY IF EXISTS "Allow all operations for anonymous users" ON survey_responses;
CREATE POLICY "Allow all operations for anonymous users" ON survey_responses
    FOR ALL USING (true);

-- 12. INSERTAR DATOS DE PRUEBA
INSERT INTO survey_responses (type, data) VALUES 
('racion-servida', '{"institucion": "IE Test", "grado": "5", "sexo": "Hombre", "fecha_nacimiento": "2010-01-01", "manipuladoras_amables": "😁 Siempre", "alimentos_variados": "😊 Casi siempre"}'),
('racion-industrializada', '{"institucion": "IE Test", "grado": "3", "sexo": "Mujer", "fecha_nacimiento": "2012-05-15", "calidad_alimentos": "😊 Casi siempre", "variedad_menus": "😁 Siempre"}'),
('coordinadores', '{"institucion": "IE Test", "fecha_nacimiento": "1985-03-20", "calidad_alimentos": "4 Excelente", "variedad_menus": "3 Bueno"}');

-- 13. VERIFICAR CONFIGURACIÓN
SELECT '✅ Base de datos limpiada y recreada exitosamente' as status;
SELECT COUNT(*) as total_responses FROM survey_responses;
SELECT type, COUNT(*) as count FROM survey_responses GROUP BY type;
