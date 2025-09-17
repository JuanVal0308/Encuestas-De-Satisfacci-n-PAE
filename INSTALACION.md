# Guía de Instalación - Sistema de Encuestas PAE

## Opción 1: Uso Directo (Recomendado)

### Pasos:
1. **Descargar archivos**: Obtener todos los archivos del proyecto
2. **Organizar estructura**: Asegurar que la estructura de carpetas sea:
   ```
   proyecto/
   ├── index.html
   ├── styles.css
   ├── script.js
   ├── surveys/
   │   ├── racion-servida.html
   │   ├── racion-industrializada.html
   │   └── coordinadores.html
   └── README.md
   ```
3. **Abrir aplicación**: Hacer doble clic en `index.html` o abrir con navegador

## Opción 2: Servidor Local

### Con Python (Recomendado)
```bash
# Navegar a la carpeta del proyecto
cd ruta/del/proyecto

# Iniciar servidor (Python 3)
python -m http.server 8000

# O con Python 2
python -m SimpleHTTPServer 8000
```

### Con Node.js
```bash
# Instalar http-server globalmente
npm install -g http-server

# Navegar a la carpeta del proyecto
cd ruta/del/proyecto

# Iniciar servidor
http-server -p 8000
```

### Con PHP
```bash
# Navegar a la carpeta del proyecto
cd ruta/del/proyecto

# Iniciar servidor
php -S localhost:8000
```

## Opción 3: Servidor Web

### Apache/Nginx
1. Subir archivos al directorio web del servidor
2. Asegurar que el servidor soporte archivos estáticos
3. Acceder via URL del servidor

### GitHub Pages
1. Crear repositorio en GitHub
2. Subir archivos al repositorio
3. Activar GitHub Pages en configuración
4. Acceder via URL de GitHub Pages

## Verificación de Instalación

### ✅ Checklist de Verificación:
- [ ] Archivo `index.html` se abre correctamente
- [ ] Se ven los 3 tipos de encuestas en la sección "Encuestas"
- [ ] Los formularios se cargan al hacer clic
- [ ] Se pueden enviar respuestas
- [ ] Los resultados se muestran en la sección "Resultados"
- [ ] La exportación a Excel funciona
- [ ] No aparecen marcas de agua de JotForm

### 🔧 Solución de Problemas

#### Error: "No se puede cargar el formulario"
- **Causa**: Los archivos HTML de encuestas no se encuentran
- **Solución**: Verificar que la carpeta `surveys/` existe y contiene los 3 archivos

#### Error: "No se pueden cargar las librerías"
- **Causa**: Sin conexión a internet
- **Solución**: Descargar las librerías localmente:
  - Chart.js: https://cdn.jsdelivr.net/npm/chart.js
  - SheetJS: https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js

#### Los gráficos no se muestran
- **Causa**: Chart.js no se cargó correctamente
- **Solución**: Verificar conexión a internet o descargar Chart.js localmente

#### No se pueden exportar archivos Excel
- **Causa**: SheetJS no se cargó correctamente
- **Solución**: Verificar conexión a internet o descargar SheetJS localmente

## Configuración Avanzada

### Personalización de Colores
Editar `styles.css` y modificar las variables CSS:
```css
:root {
  --color-primary: #EA5B0C;
  --color-secondary: #6EB3A6;
  --color-accent: #F29100;
}
```

### Modificar Encuestas
1. Editar archivos en `surveys/`
2. Mantener estructura de formularios
3. Conservar nombres de campos
4. Probar funcionalidad

### Backup de Datos
Los datos se almacenan en LocalStorage del navegador. Para backup:
1. Abrir DevTools (F12)
2. Ir a Application > Local Storage
3. Copiar datos de `paesurvey_responses`

## Soporte

Para soporte técnico:
- Verificar que todos los archivos estén presentes
- Comprobar que el navegador soporte JavaScript
- Revisar la consola del navegador para errores
- Contactar al equipo de desarrollo

---

**¡Listo! El sistema está funcionando correctamente.**
