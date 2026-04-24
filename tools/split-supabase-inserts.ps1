param(
  [Parameter(Mandatory = $true)]
  [string]$InputFile,

  [Parameter(Mandatory = $false)]
  [string]$OutputDir = (Join-Path (Split-Path -Parent $InputFile) "split_sql"),

  [Parameter(Mandatory = $false)]
  [int]$StatementsPerFile = 300,

  [Parameter(Mandatory = $false)]
  [switch]$OnlyInserts,

  [Parameter(Mandatory = $false)]
  [switch]$OrderForForeignKeys
  ,
  [Parameter(Mandatory = $false)]
  [switch]$FixJsonBackslashQuotes
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function New-CleanDir([string]$Path) {
  if (Test-Path $Path) {
    Remove-Item -Recurse -Force $Path
  }
  New-Item -ItemType Directory -Path $Path | Out-Null
}

function Write-PartFile([string]$Prefix, [int]$Index, [string[]]$Statements) {
  if ($Statements.Count -eq 0) { return }

  $fileName = "{0}_{1:D4}.sql" -f $Prefix, $Index
  $outPath = Join-Path $OutputDir $fileName

  $content = New-Object System.Collections.Generic.List[string]
  $content.Add("BEGIN;")
  $content.AddRange($Statements)
  if ($Statements[-1].TrimEnd() -notmatch ";\s*$") {
    $content[$content.Count - 1] = $content[$content.Count - 1] + ";"
  }
  $content.Add("COMMIT;")
  $content.Add("")

  [System.IO.File]::WriteAllText($outPath, ($content -join "`r`n"), [System.Text.Encoding]::UTF8)
}

if (-not (Test-Path $InputFile)) {
  throw "No existe el archivo: $InputFile"
}

New-CleanDir $OutputDir

$sqlText = Get-Content -LiteralPath $InputFile -Raw -Encoding UTF8

# Normaliza saltos de línea para facilitar el parseo
$sqlText = $sqlText -replace "`r`n", "`n"
$sqlText = $sqlText -replace "`r", "`n"

# Elimina wrappers típicos (BEGIN/COMMIT) para re-emitirlos por parte
$sqlText = [Regex]::Replace($sqlText, '^\s*BEGIN\s*;\s*', '', 'IgnoreCase')
$sqlText = [Regex]::Replace($sqlText, '\s*COMMIT\s*;\s*$', '', 'IgnoreCase')

# Estrategia simple y robusta para dumps con INSERTs:
# - Divide por ';' al final de sentencia (line-based). Esto asume que los valores no contienen ';' sin escapar,
#   que es lo habitual en dumps de INSERT.
$rawStatements = $sqlText -split ";\s*`n"

$allStatements = New-Object System.Collections.Generic.List[string]
foreach ($s in $rawStatements) {
  $stmt = $s.Trim()
  if ($stmt.Length -eq 0) { continue }

  if ($OnlyInserts) {
    if ($stmt -notmatch '^(INSERT|WITH)\s+' ) { continue }
  }

  # Arreglo común en exports: dentro de un string JSON aparece \\"texto\\" (dos backslash),
  # lo cual rompe JSON (termina el string). Lo normal en JSON es \"texto\".
  if ($FixJsonBackslashQuotes) {
    $stmt = $stmt -replace '\\\\\"', '\"'
  }

  # Re-anexa ';' para salida consistente
  $allStatements.Add($stmt + ";")
}

if ($allStatements.Count -eq 0) {
  throw "No se encontraron sentencias SQL para dividir. Revisa si el archivo está vacío o usa -OnlyInserts:$false."
}

function Write-Batches([string]$Prefix, [System.Collections.Generic.List[string]]$Statements) {
  if ($Statements.Count -eq 0) { return 0 }
  $idx = 1
  $buf = New-Object System.Collections.Generic.List[string]
  foreach ($stmt in $Statements) {
    $buf.Add($stmt)
    if ($buf.Count -ge $StatementsPerFile) {
      Write-PartFile -Prefix $Prefix -Index $idx -Statements $buf.ToArray()
      $buf.Clear()
      $idx++
    }
  }
  Write-PartFile -Prefix $Prefix -Index $idx -Statements $buf.ToArray()
  return ($idx)
}

if ($OrderForForeignKeys) {
  # Ordena para evitar FK: primero survey_responses, luego deleted_responses
  $survey = New-Object System.Collections.Generic.List[string]
  $deleted = New-Object System.Collections.Generic.List[string]
  $misc = New-Object System.Collections.Generic.List[string]

  foreach ($stmt in $allStatements) {
    if ($stmt -match '^\s*INSERT\s+INTO\s+public\.survey_responses\b' -or $stmt -match '^\s*WITH\b[\s\S]*\bINSERT\s+INTO\s+public\.survey_responses\b') {
      $survey.Add($stmt)
    } elseif ($stmt -match '^\s*INSERT\s+INTO\s+public\.deleted_responses\b' -or $stmt -match '^\s*WITH\b[\s\S]*\bINSERT\s+INTO\s+public\.deleted_responses\b') {
      $deleted.Add($stmt)
    } else {
      $misc.Add($stmt)
    }
  }

  $partsMisc = Write-Batches -Prefix "0_misc" -Statements $misc
  $partsSurvey = Write-Batches -Prefix "1_survey_responses" -Statements $survey
  $partsDeleted = Write-Batches -Prefix "2_deleted_responses" -Statements $deleted

  $totalParts = (Get-ChildItem -LiteralPath $OutputDir -Filter "*.sql").Count
  Write-Host "OK: generado(s) $totalParts archivo(s) en: $OutputDir"
  if ($partsMisc -gt 0) { Write-Host "Orden: 0_misc_*.sql (si existen) -> 1_survey_responses_*.sql -> 2_deleted_responses_*.sql" }
  else { Write-Host "Orden: 1_survey_responses_*.sql -> 2_deleted_responses_*.sql" }
} else {
  $parts = Write-Batches -Prefix "part" -Statements $allStatements
  $totalParts = (Get-ChildItem -LiteralPath $OutputDir -Filter "*.sql").Count
  Write-Host "OK: generado(s) $totalParts archivo(s) en: $OutputDir"
  Write-Host "Ejecuta en orden: part_0001.sql, part_0002.sql, ..."
}

