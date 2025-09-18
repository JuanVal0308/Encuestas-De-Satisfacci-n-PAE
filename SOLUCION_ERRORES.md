# 🔧 Solución de Errores - Sistema PAE

## 🚨 Problemas Identificados

1. **Error en Supabase**: Trigger ya existe
2. **Error en JavaScript**: `Cannot read properties of undefined (reading 'createClient')`

## 📋 Solución Paso a Paso

### PASO 1: Limpiar Base de Datos en Supabase

1. **Ve a Supabase**: https://supabase.com/dashboard
2. **Selecciona tu proyecto**
3. **Ve a "SQL Editor"**
4. **Copia y pega el contenido de**: `limpiar-y-recrear.sql`
5. **Haz clic en "Run"**
6. **Deberías ver**: "✅ Base de datos limpiada y recreada exitosamente"

### PASO 2: Verificar que la Base de Datos Funciona

1. **Ve a "Table Editor"** en Supabase
2. **Busca la tabla**: `survey_responses`
3. **Deberías ver**: 3 filas de datos de prueba
4. **Verifica las columnas**: id, type, data, created_at, updated_at, deleted_at

### PASO 3: Probar la Conexión

1. **Abre**: `test-supabase.html` en tu navegador
2. **Abre la consola** (F12)
3. **Deberías ver**: "✅ Supabase inicializado correctamente"
4. **Haz clic en**: "Probar Conexión"
5. **Deberías ver**: "✅ Conexión exitosa! Respuestas encontradas: 3"

### PASO 4: Usar la Aplicación Principal

1. **Abre**: `index.html`
2. **Ve a**: "Encuestas"
3. **Completa una encuesta**
4. **Los datos se guardan automáticamente en Supabase**

## 🔍 Verificación de Errores

### Si ves "Supabase no está inicializado":
- Verifica que el CDN de Supabase se cargue correctamente
- Revisa la consola para errores de red
- Asegúrate de que estés usando un servidor web (no abrir archivos directamente)

### Si ves "Error de conexión":
- Verifica que ejecutaste el SQL de limpieza
- Revisa que la tabla `survey_responses` exista
- Verifica las políticas RLS en Supabase

### Si los datos no se cargan:
- Revisa la consola del navegador
- Verifica que las credenciales sean correctas
- Asegúrate de que las políticas RLS permitan lectura

## 🚀 Comandos para Servidor Local

Si estás abriendo archivos directamente, necesitas un servidor web:

```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server

# Opción 3: Live Server (VS Code)
# Instala la extensión "Live Server" y haz clic derecho en index.html
```

## ✅ Verificación Final

Después de completar todos los pasos:

1. ✅ SQL ejecutado sin errores
2. ✅ Tabla `survey_responses` creada con 3 datos de prueba
3. ✅ `test-supabase.html` muestra "✅ Conexión exitosa!"
4. ✅ `index.html` funciona correctamente
5. ✅ Los datos se guardan en Supabase

## 🆘 Si Aún Hay Problemas

1. **Revisa la consola del navegador** para errores específicos
2. **Verifica la conexión a internet**
3. **Asegúrate de usar un servidor web** (no abrir archivos directamente)
4. **Revisa que las credenciales de Supabase sean correctas**

¡Con estos pasos tu sistema debería funcionar perfectamente! 🎉
