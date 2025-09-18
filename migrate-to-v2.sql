-- ============================================
-- MIGRACIÓN DE DATOS EXISTENTES A V2
-- ============================================

-- Este script migra los datos de la estructura anterior a la nueva estructura V2
-- Ejecutar DESPUÉS de crear la nueva estructura con nueva-estructura-database.sql

-- 1. Crear encuestas basadas en los tipos existentes
INSERT INTO public.surveys (slug, title, description, is_active)
VALUES 
    ('racion-servida', 'Encuesta de Ración Servida', 'Encuesta para evaluar la ración servida en el PAE', true),
    ('racion-industrializada', 'Encuesta de Ración Industrializada', 'Encuesta para evaluar la ración industrializada del PAE', true),
    ('coordinadores', 'Encuesta de Coordinadores', 'Encuesta para evaluar el desempeño de coordinadores del PAE', true);

-- 2. Crear preguntas para cada encuesta
-- Ración Servida
WITH survey_servida AS (
    SELECT id FROM public.surveys WHERE slug = 'racion-servida'
)
INSERT INTO public.questions (survey_id, text, type, ord)
SELECT 
    id,
    '¿Cuál es tu nombre completo?',
    'open',
    1
FROM survey_servida
UNION ALL
SELECT 
    id,
    '¿Cuál es tu fecha de nacimiento?',
    'open',
    2
FROM survey_servida
UNION ALL
SELECT 
    id,
    '¿Cuál es tu curso?',
    'open',
    3
FROM survey_servida
UNION ALL
SELECT 
    id,
    '¿Cuál es tu institución educativa?',
    'open',
    4
FROM survey_servida
UNION ALL
SELECT 
    id,
    'Sexo',
    'single',
    5
FROM survey_servida
UNION ALL
SELECT 
    id,
    '¿Cómo calificarías la calidad de la comida?',
    'rating',
    6
FROM survey_servida
UNION ALL
SELECT 
    id,
    '¿La cantidad de comida fue suficiente?',
    'single',
    7
FROM survey_servida
UNION ALL
SELECT 
    id,
    '¿La comida estaba caliente?',
    'single',
    8
FROM survey_servida
UNION ALL
SELECT 
    id,
    '¿Cómo calificarías el servicio en general?',
    'rating',
    9
FROM survey_servida
UNION ALL
SELECT 
    id,
    '¿Tienes alguna sugerencia o comentario?',
    'open',
    10
FROM survey_servida;

-- Ración Industrializada
WITH survey_industrializada AS (
    SELECT id FROM public.surveys WHERE slug = 'racion-industrializada'
)
INSERT INTO public.questions (survey_id, text, type, ord)
SELECT 
    id,
    '¿Cuál es tu nombre completo?',
    'open',
    1
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    '¿Cuál es tu fecha de nacimiento?',
    'open',
    2
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    '¿Cuál es tu curso?',
    'open',
    3
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    '¿Cuál es tu institución educativa?',
    'open',
    4
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    'Sexo',
    'single',
    5
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    '¿Cómo calificarías la calidad del producto?',
    'rating',
    6
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    '¿La cantidad fue suficiente?',
    'single',
    7
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    '¿El producto estaba en buen estado?',
    'single',
    8
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    '¿Cómo calificarías el servicio en general?',
    'rating',
    9
FROM survey_industrializada
UNION ALL
SELECT 
    id,
    '¿Tienes alguna sugerencia o comentario?',
    'open',
    10
FROM survey_industrializada;

-- Coordinadores
WITH survey_coordinadores AS (
    SELECT id FROM public.surveys WHERE slug = 'coordinadores'
)
INSERT INTO public.questions (survey_id, text, type, ord)
SELECT 
    id,
    '¿Cuál es tu nombre completo?',
    'open',
    1
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    '¿Cuál es tu fecha de nacimiento?',
    'open',
    2
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    '¿Cuál es tu curso?',
    'open',
    3
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    '¿Cuál es tu institución educativa?',
    'open',
    4
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    'Sexo',
    'single',
    5
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    '¿Cómo calificarías el desempeño del coordinador?',
    'rating',
    6
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    '¿El coordinador fue puntual?',
    'single',
    7
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    '¿El coordinador fue amable?',
    'single',
    8
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    '¿Cómo calificarías el servicio en general?',
    'rating',
    9
FROM survey_coordinadores
UNION ALL
SELECT 
    id,
    '¿Tienes alguna sugerencia o comentario?',
    'open',
    10
FROM survey_coordinadores;

-- 3. Crear opciones para las preguntas de opción única
-- Opciones para "Sexo"
WITH sexo_questions AS (
    SELECT q.id 
    FROM public.questions q
    JOIN public.surveys s ON s.id = q.survey_id
    WHERE q.text = 'Sexo'
)
INSERT INTO public.choices (question_id, text, ord)
SELECT 
    id,
    'Hombre',
    1
FROM sexo_questions
UNION ALL
SELECT 
    id,
    'Mujer',
    2
FROM sexo_questions;

-- Opciones para "¿La cantidad de comida fue suficiente?" (Ración Servida)
WITH cantidad_servida AS (
    SELECT q.id 
    FROM public.questions q
    JOIN public.surveys s ON s.id = q.survey_id
    WHERE q.text = '¿La cantidad de comida fue suficiente?' 
    AND s.slug = 'racion-servida'
)
INSERT INTO public.choices (question_id, text, ord)
SELECT 
    id,
    'Sí',
    1
FROM cantidad_servida
UNION ALL
SELECT 
    id,
    'No',
    2
FROM cantidad_servida;

-- Opciones para "¿La comida estaba caliente?" (Ración Servida)
WITH temperatura_servida AS (
    SELECT q.id 
    FROM public.questions q
    JOIN public.surveys s ON s.id = q.survey_id
    WHERE q.text = '¿La comida estaba caliente?' 
    AND s.slug = 'racion-servida'
)
INSERT INTO public.choices (question_id, text, ord)
SELECT 
    id,
    'Sí',
    1
FROM temperatura_servida
UNION ALL
SELECT 
    id,
    'No',
    2
FROM temperatura_servida;

-- Opciones para "¿La cantidad fue suficiente?" (Ración Industrializada)
WITH cantidad_industrializada AS (
    SELECT q.id 
    FROM public.questions q
    JOIN public.surveys s ON s.id = q.survey_id
    WHERE q.text = '¿La cantidad fue suficiente?' 
    AND s.slug = 'racion-industrializada'
)
INSERT INTO public.choices (question_id, text, ord)
SELECT 
    id,
    'Sí',
    1
FROM cantidad_industrializada
UNION ALL
SELECT 
    id,
    'No',
    2
FROM cantidad_industrializada;

-- Opciones para "¿El producto estaba en buen estado?" (Ración Industrializada)
WITH estado_industrializada AS (
    SELECT q.id 
    FROM public.questions q
    JOIN public.surveys s ON s.id = q.survey_id
    WHERE q.text = '¿El producto estaba en buen estado?' 
    AND s.slug = 'racion-industrializada'
)
INSERT INTO public.choices (question_id, text, ord)
SELECT 
    id,
    'Sí',
    1
FROM estado_industrializada
UNION ALL
SELECT 
    id,
    'No',
    2
FROM estado_industrializada;

-- Opciones para "¿El coordinador fue puntual?" (Coordinadores)
WITH puntualidad_coordinadores AS (
    SELECT q.id 
    FROM public.questions q
    JOIN public.surveys s ON s.id = q.survey_id
    WHERE q.text = '¿El coordinador fue puntual?' 
    AND s.slug = 'coordinadores'
)
INSERT INTO public.choices (question_id, text, ord)
SELECT 
    id,
    'Sí',
    1
FROM puntualidad_coordinadores
UNION ALL
SELECT 
    id,
    'No',
    2
FROM puntualidad_coordinadores;

-- Opciones para "¿El coordinador fue amable?" (Coordinadores)
WITH amabilidad_coordinadores AS (
    SELECT q.id 
    FROM public.questions q
    JOIN public.surveys s ON s.id = q.survey_id
    WHERE q.text = '¿El coordinador fue amable?' 
    AND s.slug = 'coordinadores'
)
INSERT INTO public.choices (question_id, text, ord)
SELECT 
    id,
    'Sí',
    1
FROM amabilidad_coordinadores
UNION ALL
SELECT 
    id,
    'No',
    2
FROM amabilidad_coordinadores;

-- 4. Migrar datos existentes (si los hay)
-- NOTA: Esto es opcional y solo se ejecuta si existen datos en la tabla anterior
-- Descomenta las siguientes líneas si quieres migrar datos existentes:

/*
-- Migrar respuestas existentes a la nueva estructura
INSERT INTO public.answer_sessions (survey_id, client_token, meta, created_at)
SELECT 
    CASE 
        WHEN data->>'type' = 'racion-servida' THEN (SELECT id FROM public.surveys WHERE slug = 'racion-servida')
        WHEN data->>'type' = 'racion-industrializada' THEN (SELECT id FROM public.surveys WHERE slug = 'racion-industrializada')
        WHEN data->>'type' = 'coordinadores' THEN (SELECT id FROM public.surveys WHERE slug = 'coordinadores')
    END as survey_id,
    gen_random_uuid() as client_token,
    jsonb_build_object('migrated', true, 'original_id', id) as meta,
    created_at
FROM public.survey_responses
WHERE deleted_at IS NULL;

-- Migrar respuestas individuales
INSERT INTO public.answers (session_id, question_id, choice_id, value_text, value_num, client_token)
SELECT 
    s.id as session_id,
    q.id as question_id,
    c.id as choice_id,
    CASE 
        WHEN q.type = 'open' THEN data->>'nombre'
        WHEN q.type = 'open' AND q.text LIKE '%fecha%' THEN data->>'fecha_nacimiento'
        WHEN q.type = 'open' AND q.text LIKE '%curso%' THEN data->>'curso'
        WHEN q.type = 'open' AND q.text LIKE '%institución%' THEN data->>'institucion'
        WHEN q.type = 'open' AND q.text LIKE '%sugerencia%' THEN data->>'sugerencias'
    END as value_text,
    CASE 
        WHEN q.type = 'rating' AND q.text LIKE '%calidad%' THEN (data->>'calidad')::numeric
        WHEN q.type = 'rating' AND q.text LIKE '%servicio%' THEN (data->>'servicio')::numeric
    END as value_num,
    s.client_token
FROM public.answer_sessions s
JOIN public.surveys sur ON sur.id = s.survey_id
JOIN public.questions q ON q.survey_id = sur.id
LEFT JOIN public.choices c ON c.question_id = q.id
JOIN public.survey_responses sr ON sr.id = (s.meta->>'original_id')::uuid
WHERE s.meta->>'migrated' = 'true'
AND (
    (q.type = 'single' AND c.text = data->>'sexo')
    OR (q.type = 'rating')
    OR (q.type = 'open')
);
*/

-- Verificar que la migración fue exitosa
SELECT 
    s.title as encuesta,
    COUNT(q.id) as preguntas,
    COUNT(c.id) as opciones
FROM public.surveys s
LEFT JOIN public.questions q ON q.survey_id = s.id
LEFT JOIN public.choices c ON c.question_id = q.id
WHERE s.is_active = true
GROUP BY s.id, s.title
ORDER BY s.title;
