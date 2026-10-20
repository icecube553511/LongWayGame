# 《长征·万水千山》APK 构建脚本
# 依赖：Android SDK（build-tools 35 + android-35）、JDK 与 Python 3 标准库；不引入 Gradle 或第三方依赖。
# 正式包使用本机长期保存的 Martin 发布证书签名；证书与口令放在用户目录，不进入仓库。
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$TmpRoot = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot 'tmp'))
$BuildRoot = [System.IO.Path]::GetFullPath((Join-Path $TmpRoot 'apk-build'))
$DistRoot = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot 'dist'))
$OutputApk = [System.IO.Path]::GetFullPath((Join-Path $DistRoot 'LongWayGame.apk'))

function Assert-UnderRoot {
    param([string]$Candidate, [string]$Root)
    $full = [System.IO.Path]::GetFullPath($Candidate).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
    $rootFull = [System.IO.Path]::GetFullPath($Root).TrimEnd([System.IO.Path]::DirectorySeparatorChar)
    if ($full -ne $rootFull -and -not $full.StartsWith($rootFull + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "路径越界：$full 不在 $rootFull 内"
    }
    return $full
}

function Invoke-Native {
    param([string]$Exe, [string[]]$CommandArgs)
    & $Exe @CommandArgs
    if ($LASTEXITCODE -ne 0) {
        throw "命令失败（退出码 $LASTEXITCODE）：$Exe $($CommandArgs -join ' ')"
    }
}

$null = Assert-UnderRoot $BuildRoot $TmpRoot
$null = Assert-UnderRoot $OutputApk $DistRoot

$SdkRoot = if ($env:ANDROID_HOME) {
    $env:ANDROID_HOME
} elseif ($env:ANDROID_SDK_ROOT) {
    $env:ANDROID_SDK_ROOT
} else {
    Join-Path $env:LOCALAPPDATA 'Android\Sdk'
}
$BuildTools = Join-Path $SdkRoot 'build-tools\35.0.0'
$AndroidJar = Join-Path $SdkRoot 'platforms\android-35\android.jar'
$Aapt2 = Join-Path $BuildTools 'aapt2.exe'
$ZipAlign = Join-Path $BuildTools 'zipalign.exe'
$ApkSigner = Join-Path $BuildTools 'apksigner.bat'
$D8 = Join-Path $BuildTools 'd8.bat'
$Javac = if ($env:JAVA_HOME -and (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin\javac.exe'))) {
    Join-Path $env:JAVA_HOME 'bin\javac.exe'
} else {
    (Get-Command javac.exe -ErrorAction Stop).Source
}
$JarTool = Join-Path (Split-Path -Parent $Javac) 'jar.exe'
$Keytool = Join-Path (Split-Path -Parent $Javac) 'keytool.exe'
$SigningDir = Join-Path $env:USERPROFILE '.android\longwaygame-signing'
$Keystore = Join-Path $SigningDir 'martin-release.p12'
$SigningPasswordFile = Join-Path $SigningDir 'password.txt'
$SigningAlias = 'martin'
$SigningDname = 'CN=Martin, OU=LongWayGame, O=Martin, L=Shanghai, ST=Shanghai, C=CN'

foreach ($required in @($Aapt2, $ZipAlign, $ApkSigner, $D8, $Javac, $JarTool, $Keytool, $AndroidJar)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "缺少构建依赖：$required"
    }
}

$SigningPassword = $env:LONGWAY_SIGNING_PASSWORD
if (-not $SigningPassword -and (Test-Path -LiteralPath $SigningPasswordFile)) {
    $SigningPassword = (Get-Content -LiteralPath $SigningPasswordFile -Raw).Trim()
}
if (-not (Test-Path -LiteralPath $Keystore)) {
    New-Item -ItemType Directory -Force -Path $SigningDir | Out-Null
    if (-not $SigningPassword) {
        $randomBytes = New-Object byte[] 24
        $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
        try {
            $rng.GetBytes($randomBytes)
        } finally {
            $rng.Dispose()
        }
        $SigningPassword = -join ($randomBytes | ForEach-Object { $_.ToString('x2') })
        [System.IO.File]::WriteAllText($SigningPasswordFile, $SigningPassword, [System.Text.Encoding]::ASCII)
    }
    Invoke-Native $Keytool @(
        '-genkeypair',
        '-keystore', $Keystore,
        '-storetype', 'PKCS12',
        '-alias', $SigningAlias,
        '-keyalg', 'RSA',
        '-keysize', '4096',
        '-validity', '36500',
        '-dname', $SigningDname,
        '-storepass', $SigningPassword,
        '-keypass', $SigningPassword
    )
}
if (-not $SigningPassword) {
    throw "发布证书已存在，但缺少签名口令。请设置 LONGWAY_SIGNING_PASSWORD，或恢复 $SigningPasswordFile。"
}

$Manifest = Join-Path $ProjectRoot 'android\AndroidManifest.xml'
$ResDir = Join-Path $ProjectRoot 'android\res'
$JavaSourceRoot = Join-Path $ProjectRoot 'android\src'
foreach ($required in @($Manifest, $ResDir, $JavaSourceRoot)) {
    if (-not (Test-Path -LiteralPath $required)) {
        throw "缺少 Android 壳文件：$required"
    }
}

if (Test-Path -LiteralPath $BuildRoot) {
    Remove-Item -LiteralPath $BuildRoot -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $BuildRoot, $DistRoot | Out-Null

$AssetRoot = Join-Path $BuildRoot 'apk-assets'
$WwwRoot = Join-Path $AssetRoot 'www'
$GeneratedDir = Join-Path $BuildRoot 'generated'
$ClassesDir = Join-Path $BuildRoot 'classes'
$DexDir = Join-Path $BuildRoot 'dex'
New-Item -ItemType Directory -Force -Path $WwwRoot, $GeneratedDir, $ClassesDir, $DexDir | Out-Null

# 只复制游戏运行所需文件，排除 tmp、tools、docs 与构建产物。
$whiteList = @('index.html', 'css', 'src\data', 'src\story', 'src\engine', 'assets')
foreach ($relative in $whiteList) {
    $source = Join-Path $ProjectRoot $relative
    if (-not (Test-Path -LiteralPath $source)) {
        throw "缺少游戏文件：$source"
    }
    $destination = Join-Path $WwwRoot $relative
    $destinationParent = Split-Path -Parent $destination
    New-Item -ItemType Directory -Force -Path $destinationParent | Out-Null
    if ((Get-Item -LiteralPath $source).PSIsContainer) {
        New-Item -ItemType Directory -Force -Path $destination | Out-Null
        Copy-Item -Path (Join-Path $source '*') -Destination $destination -Recurse -Force
    } else {
        Copy-Item -LiteralPath $source -Destination $destination -Force
    }
}

$ResZip = Join-Path $BuildRoot 'resources.zip'
Invoke-Native $Aapt2 @('compile', '--dir', $ResDir, '-o', $ResZip)

$BaseApk = Join-Path $BuildRoot 'base-unsigned.apk'
Invoke-Native $Aapt2 @(
    'link',
    '-o', $BaseApk,
    '-I', $AndroidJar,
    '--manifest', $Manifest,
    '--java', $GeneratedDir,
    '--min-sdk-version', '23',
    '--target-sdk-version', '35',
    '--auto-add-overlay',
    $ResZip
)

$javaFiles = @(Get-ChildItem -LiteralPath $GeneratedDir, $JavaSourceRoot -Recurse -Filter '*.java' | ForEach-Object { $_.FullName })
if ($javaFiles.Count -eq 0) {
    throw '没有找到 Java 源文件'
}
$javacArgs = @(
    '-encoding', 'UTF-8',
    '-source', '8',
    '-target', '8',
    '-bootclasspath', $AndroidJar,
    '-Xlint:-options',
    '-d', $ClassesDir
) + $javaFiles
Invoke-Native $Javac $javacArgs

$ClassesJar = Join-Path $BuildRoot 'classes.jar'
Invoke-Native $JarTool @('cf', $ClassesJar, '-C', $ClassesDir, '.')
Invoke-Native $D8 @('--release', '--lib', $AndroidJar, '--min-api', '23', '--output', $DexDir, $ClassesJar)

$DexFile = Join-Path $DexDir 'classes.dex'
if (-not (Test-Path -LiteralPath $DexFile)) {
    throw 'D8 没有生成 classes.dex'
}

# aapt2 在 Windows 上会把 -A 目录写成反斜杠条目，而 Android 只认正斜杠路径；
# 另外 targetSdk >= 30 要求 resources.arsc 以“存储”方式写入。
# 因此重打包交给 tools/apk-pack.py，PowerShell 只负责调用与校验。
$Python = if ($env:PYTHON) { $env:PYTHON } else { (Get-Command python.exe -ErrorAction Stop).Source }
$PackScript = Join-Path $PSScriptRoot 'apk-pack.py'
if (-not (Test-Path -LiteralPath $PackScript)) {
    throw "缺少打包脚本：$PackScript"
}
$UnsignedApk = Join-Path $BuildRoot 'app-unsigned.apk'
if (Test-Path -LiteralPath $UnsignedApk) {
    Remove-Item -LiteralPath $UnsignedApk -Force
}
Invoke-Native $Python @($PackScript, $BaseApk, $WwwRoot, $DexFile, $UnsignedApk)

$AlignedApk = Join-Path $BuildRoot 'app-aligned.apk'
Invoke-Native $ZipAlign @('-p', '-f', '4', $UnsignedApk, $AlignedApk)

if (Test-Path -LiteralPath $OutputApk) {
    Remove-Item -LiteralPath $OutputApk -Force
}
Invoke-Native $ApkSigner @(
    'sign',
    '--ks', $Keystore,
    '--ks-key-alias', $SigningAlias,
    '--ks-pass', "pass:$SigningPassword",
    '--key-pass', "pass:$SigningPassword",
    '--out', $OutputApk,
    $AlignedApk
)

# 签名完成后只校验，不再运行 zipalign。
$certificateReport = & $ApkSigner 'verify' '--verbose' '--print-certs' $OutputApk
if ($LASTEXITCODE -ne 0) {
    throw 'apksigner verify 失败'
}
$certificateText = ($certificateReport -join "`n")
if ($certificateText -notmatch 'CN=Martin(?:,|\s|$)') {
    throw 'APK 签名证书不是 Martin，拒绝交付'
}

$permissions = & $Aapt2 dump permissions $OutputApk
if ($LASTEXITCODE -ne 0) {
    throw 'aapt2 dump permissions 失败'
}
$permissionsText = ($permissions -join "`n")
if ($permissionsText -match 'android\.permission\.INTERNET') {
    throw 'APK 不应申请 INTERNET 权限'
}

$badging = & $Aapt2 dump badging $OutputApk
if ($LASTEXITCODE -ne 0) {
    throw 'aapt2 dump badging 失败'
}

$zipCheck = [System.IO.Compression.ZipFile]::OpenRead($OutputApk)
try {
    $entryNames = @($zipCheck.Entries | ForEach-Object { $_.FullName })
} finally {
    $zipCheck.Dispose()
}
foreach ($requiredEntry in @('assets/www/index.html', 'classes.dex')) {
    if ($entryNames -notcontains $requiredEntry) {
        throw "APK 缺少 $requiredEntry"
    }
}

$hash = (Get-FileHash -LiteralPath $OutputApk -Algorithm SHA256).Hash
$size = (Get-Item -LiteralPath $OutputApk).Length

Write-Output ''
Write-Output '构建完成'
Write-Output "APK：$OutputApk"
Write-Output "大小：$size 字节"
Write-Output "SHA256：$hash"
Write-Output "签名：Martin（CN=Martin）"
Write-Output ''
Write-Output 'aapt2 dump badging：'
$badging | Write-Output
Write-Output ''
Write-Output '权限：'
if ($permissionsText.Trim().Length -eq 0) {
    Write-Output '（无）'
} else {
    $permissions | Write-Output
}
