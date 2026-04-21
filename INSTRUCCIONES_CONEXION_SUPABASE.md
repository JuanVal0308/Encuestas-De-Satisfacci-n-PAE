# 🚀 Instrucciones para Conectar tu Proyecto a Supabase

## 📋 Resumen del Estado Actual

Tu proyecto ya tiene una configuración bastante completa de Supabase. Aquí te explico qué tienes y qué necesitas hacer:

### ✅ Lo que ya tienes configurado:
- **Credenciales de Supabase**: URL y API Key configuradas
- **Archivos de configuración**: `supabase-config.js` y `supabase-service-v2.js`
- **Scripts SQL**: `setup-database.sql` listo para ejecutar
- **Páginas de prueba**: `test-supabase.html` y `verificar-supabase.html`
- **Aplicación principal**: `index.html` y `index-v2.html`

### 🔧 Lo que necesitas hacer:

## PASO 1: Ejecutar el SQL en Supabase

### 1.1 Acceder a Supabase
1. Ve a: https://supabase.com/dashboard
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto (o crea uno nuevo si no tienes)

### 1.2 Ejecutar el Script SQL
1. En el panel de Supabase, ve a **"SQL Editor"** (en el menú lateral izquierdo)
2. Haz clic en **"New query"**
3. Copia todo el contenido del archivo `setup-database.sql`
4. Pégalo en el editor SQL
5. Haz clic en **"Run"** (botón verde)
6. Deberías ver el mensaje: "✅ Configuración completada exitosamente"

### 1.3 Verificar la Configuración
1. Ve a **"Table Editor"** en el menú lateral
2. Busca la tabla `survey_responses`
3. Deberías ver las columnas: `id`, `type`, `data`, `created_at`, `updated_at`, `deleted_at`
4. Deberías ver 3 filas de datos de prueba

## PASO 2: Probar la Conexión

### 2.1 Usar el Verificador Automático
1. Abre el archivo `configurar-supabase.html` en tu navegador
2. Sigue los pasos automáticos:
   - Haz clic en "Verificar Credenciales"
   - Haz clic en "Configurar Base de Datos"
   - Haz clic en "Probar Integración"
   - Haz clic en "Verificar Aplicación"

### 2.2 Usar el Verificador Manual
1. Abre el archivo `verificar-supabase.html` en tu navegador
2. Haz clic en "Probar Conexión Básica"
3. Haz clic en "Verificar Tablas"
4. Haz clic en "Probar Inserción de Datos"
5. Haz clic en "Probar Obtención de Datos"

### 2.3 Usar el Test Original
1. Abre el archivo `test-supabase.html` en tu navegador
2. Haz clic en "Probar Conexión"
3. Deberías ver: "✅ Conexión exitosa! Respuestas encontradas: 3"

## PASO 3: Usar la Aplicación

### 3.1 Aplicación Principal (Versión 1)
1. Abre `index.html` en tu navegador
2. Ve a la sección "Encuestas"
3. Completa una encuesta de prueba
4. Los datos se guardan en Supabase automáticamente

### 3.2 Aplicación Mejorada (Versión 2)
1. Abre `index-v2.html` en tu navegador
2. Esta versión tiene mejor integración con Supabase
3. Incluye funcionalidades avanzadas como filtros y estadísticas

## PASO 4: Verificar que Todo Funciona

### 4.1 Verificar en Supabase
1. Ve a tu panel de Supabase
2. Ve a "Table Editor"
3. Selecciona la tabla `survey_responses`
4. Deberías ver las respuestas que guardaste desde la aplicación

### 4.2 Verificar en la Aplicación
1. Abre la aplicación principal
2. Ve a la sección "Resultados"
3. Deberías ver los datos guardados en Supabase
4. Los gráficos y estadísticas deberían funcionar

## 🚨 Solución de Problemas Comunes

### Error: "relation does not exist"
**Causa**: La tabla no se creó correctamente
**Solución**: 
1. Ve a Supabase → SQL Editor
2. Ejecuta este SQL:
```sql
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

### Error: "permission denied"
**Causa**: Las políticas RLS no están configuradas
**Solución**:
1. Ve a Supabase → SQL Editor
2. Ejecuta este SQL:
```sql
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for anonymous users" ON survey_responses
    FOR ALL USING (true);
```

### Error: "Failed to fetch"
**Causa**: URL o API key incorrectos
**Solución**:
1. Verifica las credenciales en `supabase-config.js`
2. Asegúrate de que la URL y API key sean correctas
3. Verifica que tu proyecto de Supabase esté activo

### Los datos no aparecen en la aplicación
**Causa**: Problema con la integración
**Solución**:
1. Abre la consola del navegador (F12)
2. Busca errores de JavaScript
3. Verifica que Supabase esté cargando correctamente
4. Usa `test-supabase.html` para probar la conexión

## 📊 Estructura de la Base de Datos

Tu base de datos tendrá esta estructura:

```sql
survey_responses
├── id (UUID, Primary Key)
├── type (VARCHAR) - Tipo de encuesta
├── data (JSONB) - Datos de la respuesta
├── created_at (TIMESTAMP) - Fecha de creación
├── updated_at (TIMESTAMP) - Fecha de actualización
└── deleted_at (TIMESTAMP) - Fecha de eliminación (soft delete)
```

## 🎯 Próximos Pasos

Una vez que todo esté funcionando:

1. **Probar con datos reales**: Completa encuestas reales
2. **Verificar persistencia**: Los datos se guardan en la nube
3. **Configurar dominio**: Si planeas usar en producción
4. **Backup**: Los datos se respaldan automáticamente en Supabase

## 📞 Soporte

Si tienes problemas:

1. **Revisa la consola del navegador** para errores
2. **Usa los archivos de prueba** para diagnosticar
3. **Verifica las credenciales** en Supabase
4. **Ejecuta el SQL** si hay problemas de permisos

## ✅ Lista de Verificación Final

- [ ] SQL ejecutado en Supabase
- [ ] Tabla `survey_responses` creada
- [ ] Políticas RLS configuradas
- [ ] Conexión probada con `test-supabase.html`
- [ ] Aplicación principal funcionando
- [ ] Datos guardándose en Supabase
- [ ] Resultados mostrándose correctamente

¡Una vez completados todos los pasos, tu sistema de encuestas PAE estará completamente integrado con Supabase! 🚀
