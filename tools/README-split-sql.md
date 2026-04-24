## Partir un backup `.sql` en scripts pequeños (Supabase)

Este repo incluye `tools/split-supabase-inserts.ps1` para dividir un `.sql` grande en varios archivos `0001.sql`, `0002.sql`, etc. (cada uno con `BEGIN; ... COMMIT;`).

### Uso (PowerShell)

Desde la raíz del repo:

```powershell
pwsh -File .\tools\split-supabase-inserts.ps1 -InputFile "C:\ruta\backup.sql" -StatementsPerFile 300
```

Salida:
- Se crea una carpeta `split_sql` al lado del archivo original (o usa `-OutputDir`).
- Dentro verás `0001.sql`, `0002.sql`, ...

### Opciones útiles

- Cambiar carpeta de salida:

```powershell
pwsh -File .\tools\split-supabase-inserts.ps1 -InputFile "C:\ruta\backup.sql" -OutputDir "C:\ruta\partes" -StatementsPerFile 300
```

- Quedarte solo con INSERTs (y sentencias `WITH ... INSERT`):

```powershell
pwsh -File .\tools\split-supabase-inserts.ps1 -InputFile "C:\ruta\backup.sql" -StatementsPerFile 300 -OnlyInserts
```

### Cómo ejecutarlos en Supabase

En el SQL Editor, ejecútalos **en orden**: `0001.sql`, luego `0002.sql`, etc.

Si algún bloque falla, dime el error exacto y el número de archivo (por ejemplo `0007.sql`) y lo ajusto.

