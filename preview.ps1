param([switch]$Stop)
$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$serverPath = Join-Path $projectRoot 'server.mjs'
$pidPath = Join-Path $projectRoot '.preview.pid'
$previewUrl = 'http://127.0.0.1:4173'
if ($Stop) {
    if (-not (Test-Path -LiteralPath $pidPath)) { Write-Host '이 실행 파일로 시작한 미리보기가 없습니다.'; exit 0 }
    $previewProcessId = [int](Get-Content -LiteralPath $pidPath)
    $previewProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $previewProcessId"
    if ($previewProcess -and $previewProcess.CommandLine -and $previewProcess.CommandLine.Contains($serverPath)) {
        Stop-Process -Id $previewProcessId
        Write-Host '제일종합학원 로컬 미리보기를 종료했습니다.'
    } else { Write-Host '해당 미리보기는 이미 종료되었거나 프로세스가 달라서 종료하지 않았습니다.' }
    exit 0
}
try {
    $health = Invoke-RestMethod -Uri "$previewUrl/health" -TimeoutSec 2
    if ($health.app -eq 'jeil-academy-concept') { Write-Host "미리보기가 실행 중입니다: $previewUrl"; exit 0 }
    throw '4173 포트에서 다른 서비스가 실행 중입니다. 다른 서비스를 자동 종료하지 않습니다.'
} catch {
    if ($_.Exception.Message -like '*다른 서비스*') { throw }
}
$nodePath = 'C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $nodePath)) {
    $nodeCommand = Get-Command node -ErrorAction SilentlyContinue
    if (-not $nodeCommand) { throw 'Node.js가 필요합니다. 이 컴퓨터의 Codex 런타임을 찾지 못했습니다.' }
    $nodePath = $nodeCommand.Source
}
$previewProcess = Start-Process -FilePath $nodePath -ArgumentList ('"' + $serverPath + '"') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot '.preview.log') -RedirectStandardError (Join-Path $projectRoot '.preview-error.log') -PassThru
Set-Content -LiteralPath $pidPath -Value $previewProcess.Id
for ($attempt = 0; $attempt -lt 15; $attempt++) {
    Start-Sleep -Milliseconds 200
    try {
        $health = Invoke-RestMethod -Uri "$previewUrl/health" -TimeoutSec 1
        if ($health.app -eq 'jeil-academy-concept') { Write-Host "미리보기를 시작했습니다: $previewUrl"; exit 0 }
    } catch {}
}
throw '미리보기 시작을 확인하지 못했습니다. .preview-error.log 파일을 확인해 주세요.'


