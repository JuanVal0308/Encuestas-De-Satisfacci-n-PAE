# ⚡ Inicio Rápido - Sistema PAE con Supabase

## 🚀 Configuración en 3 Pasos

### 1️⃣ Ejecutar SQL en Supabase
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Copia y pega el contenido de `setup-database.sql`
5. Haz clic en "Run"

### 2️⃣ Probar la Conexión
1. Abre `test-supabase.html` en tu navegador
2. Haz clic en "Probar Conexión"
3. Deberías ver: "✅ Conexión exitosa!"

### 3️⃣ Usar la Aplicación
1. Abre `index.html`
2. Ve a "Encuestas"
3. Completa una encuesta
4. Los datos se guardan automáticamente en Supabase

## 🔧 Archivos Importantes

- `setup-database.sql` - Código SQL para crear la base de datos
- `test-supabase.html` - Página para probar la conexión
- `index.html` - Aplicación principal
- `supabase-config.js` - Configuración de Supabase

## ✅ Verificación

Después de ejecutar el SQL, deberías ver:
- ✅ "Configuración completada exitosamente"
- ✅ "total_responses: 3"
- ✅ Conexión exitosa en test-supabase.html

## 🆘 Si algo falla

1. **Error de conexión**: Verifica que el SQL se ejecutó correctamente
2. **Datos no aparecen**: Revisa las políticas RLS en Supabase
3. **Error de permisos**: Ejecuta el SQL nuevamente

¡Listo! Tu sistema está configurado. 🎉
