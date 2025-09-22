# 🚀 Instrucciones para Ejecutar el SQL en Supabase

## Pasos para configurar la base de datos

### 1. Acceder al SQL Editor de Supabase

1. Ve a tu proyecto de Supabase: [https://supabase.com/dashboard/project/algrkzpmqvpmylszcrrk](https://supabase.com/dashboard/project/algrkzpmqvpmylszcrrk)
2. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
3. Haz clic en **"New query"** para crear una nueva consulta

### 2. Ejecutar el Esquema SQL

1. **Copia todo el contenido** del archivo `database/schema.sql`
2. **Pega el contenido** en el editor SQL de Supabase
3. **Haz clic en "Run"** para ejecutar el script

### 3. Verificar que se ejecutó correctamente

Deberías ver mensajes como:
- ✅ "CREATE TABLE"
- ✅ "CREATE INDEX" 
- ✅ "CREATE POLICY"
- ✅ "CREATE FUNCTION"

### 4. Verificar las tablas creadas

1. Ve a **"Table Editor"** en el menú lateral
2. Deberías ver las siguientes tablas:
   - `survey_responses` - Para las encuestas activas
   - `deleted_responses` - Para la papelera

### 5. Probar la aplicación

1. Abre la aplicación en el navegador
2. Abre la consola del navegador (F12)
3. Deberías ver: **"Supabase conectado correctamente"**
4. Si ves: **"Supabase no está disponible, usando localStorage"** - revisa la configuración

## 🔧 Solución de problemas

### Error: "relation does not exist"
- **Causa**: Las tablas no se crearon correctamente
- **Solución**: Ejecuta nuevamente el script SQL completo

### Error: "permission denied"
- **Causa**: Las políticas RLS no están configuradas
- **Solución**: Verifica que el script SQL se ejecutó completamente

### Error: "Supabase no está disponible"
- **Causa**: Problema de conexión o credenciales
- **Solución**: 
  1. Verifica que la URL y API Key sean correctas
  2. Verifica que el proyecto esté activo
  3. Revisa la consola del navegador para errores específicos

## 📊 Verificar que funciona

### 1. Crear una encuesta de prueba
- Ve a la sección "Encuestas"
- Completa cualquier encuesta
- Debería guardarse en Supabase

### 2. Verificar en Supabase
- Ve a **"Table Editor"** → `survey_responses`
- Deberías ver la nueva encuesta creada

### 3. Probar desde otro dispositivo
- Abre la aplicación en otro dispositivo/navegador
- Deberías ver la encuesta creada anteriormente

## 🎯 Configuración Completa

Una vez ejecutado el SQL, tu aplicación tendrá:

✅ **Base de datos configurada** con todas las tablas necesarias
✅ **Políticas de seguridad** para acceso público
✅ **Funciones SQL** para estadísticas y filtros
✅ **Índices optimizados** para mejor rendimiento
✅ **Sincronización automática** entre dispositivos

## 📱 Próximos pasos

1. **Ejecuta el SQL** en Supabase
2. **Prueba la aplicación** creando una encuesta
3. **Verifica la sincronización** desde otro dispositivo
4. **Comparte el link** para que otros puedan acceder

¡Tu sistema de encuestas PAE estará listo para usar! 🎉
