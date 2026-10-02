-- =====================================================================
-- OPCIONAL — Normalizar nombres de instituciones en respuestas antiguas
-- Fecha: 2026-10-02 · Rama: correcciones-encuestas-sep2026
--
-- ⚠️  ESTE SCRIPT NO SE HA EJECUTADO. Revíselo y sáquele respaldo a la tabla
--     survey_responses antes de correrlo en el SQL Editor de Supabase.
--
-- No es necesario para que la aplicación funcione: script.js ya unifica estos
-- nombres al mostrar filtros, tablas y gráficos (INSTITUTION_ALIASES). Sirve solo
-- si se quiere que la base de datos y los Excel exportados queden con el nombre
-- corregido.
--
-- Es idempotente: si se ejecuta dos veces, la segunda no cambia nada.
-- No modifica el esquema ni borra filas.
-- =====================================================================

-- 1) Vista previa: cuántas respuestas cambiarían
SELECT response_data->>'institucion' AS institucion_actual, COUNT(*) AS respuestas
FROM survey_responses
WHERE survey_type IN ('racion-servida', 'racion-industrializada', 'coordinadores')
  AND response_data->>'institucion' IN (
      'IE La Paz (Sede El Triangón)',
      'IE La Paz (Sede John F. Kennedyz)',
      'IE El Salado (Sede Primaria)'
  )
GROUP BY 1
ORDER BY 1;

-- 2) Actualización (descomente para ejecutar)
-- BEGIN;
--
-- UPDATE survey_responses
-- SET response_data = jsonb_set(
--         response_data,
--         '{institucion}',
--         to_jsonb(CASE response_data->>'institucion'
--             WHEN 'IE La Paz (Sede El Triangón)'      THEN 'IE La Paz (Sede El Trianón)'
--             WHEN 'IE La Paz (Sede John F. Kennedyz)' THEN 'IE La Paz (Sede John F. Kennedy)'
--             WHEN 'IE El Salado (Sede Primaria)'      THEN 'IE El Salado (Sede Primaria La Morena)'
--         END)
--     )
-- WHERE survey_type IN ('racion-servida', 'racion-industrializada', 'coordinadores')
--   AND response_data->>'institucion' IN (
--       'IE La Paz (Sede El Triangón)',
--       'IE La Paz (Sede John F. Kennedyz)',
--       'IE El Salado (Sede Primaria)'
--   );
--
-- -- Pendiente de confirmar con el cliente: la sede La Morena figuraba como
-- -- "IE San Vicente de Paúl(Sede La Morena)". Si se confirma que es la misma sede
-- -- de IE El Salado, descomente también esto:
-- -- UPDATE survey_responses
-- -- SET response_data = jsonb_set(response_data, '{institucion}', to_jsonb('IE El Salado (Sede Primaria La Morena)'::text))
-- -- WHERE survey_type IN ('racion-servida', 'racion-industrializada', 'coordinadores')
-- --   AND response_data->>'institucion' = 'IE San Vicente de Paúl(Sede La Morena)';
--
-- COMMIT;
