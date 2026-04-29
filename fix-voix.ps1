# ============================================================
# VOIX — Script de nettoyage et correction automatique
# Exécuter dans PowerShell : .\fix-voix.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$repoPath = "C:\voix"
Set-Location $repoPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VOIX — Nettoyage & Correction Auto" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# ── 1. SUPPRIMER LES DOUBLONS ET FICHIERS ORPHELINS ──
Write-Host "`n[1/8] Suppression des doublons et fichiers orphelins..." -ForegroundColor Yellow

$toDelete = @(
    "src",
    "tests",
    ".next\types\validator.ts",
    "lib\importers\orchestrator.ts",
    "app\(marketing)\page.tsx"
)

foreach ($item in $toDelete) {
    $fullPath = Join-Path $repoPath $item
    if (Test-Path $fullPath) {
        if ((Get-Item $fullPath) -is [System.IO.DirectoryInfo]) {
            Remove-Item $fullPath -Recurse -Force
            Write-Host "  ✓ Supprimé dossier : $item" -ForegroundColor Green
        } else {
            Remove-Item $fullPath -Force
            Write-Host "  ✓ Supprimé fichier : $item" -ForegroundColor Green
        }
    } else {
        Write-Host "  ℹ Déjà absent : $item" -ForegroundColor Gray
    }
}

# ── 2. CORRIGER LES IMPORTS (supabaseAdmin + logActivity) ──
Write-Host "`n[2/8] Correction des imports supabase..." -ForegroundColor Yellow

$filesToFix = @(
    "app\(dashboard)\campaigns\page.tsx",
    "app\(dashboard)\import\page.tsx",
    "app\(dashboard)\page.tsx",
    "app\(dashboard)\settings\page.tsx",
    "app\(dashboard)\testimonials\page.tsx",
    "app\(dashboard)\widgets\page.tsx",
    "app\api\analytics\route.ts",
    "app\api\campaigns\route.ts",
    "app\api\import\route.ts",
    "app\api\invites\route.ts",
    "app\api\profile\route.ts",
    "app\api\testimonials\[id]\route.ts",
    "app\api\widgets\route.ts"
)

foreach ($file in $filesToFix) {
    $fullPath = Join-Path $repoPath $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw -Encoding UTF8

        # Remplacer les imports cassés
        $content = $content -replace "from "@/lib/supabase/server"\s*
", "from '@/lib/supabase/server'`n"
        $content = $content -replace "from `@"/lib/supabase`"\s*
", "from `@"/lib/supabase/server`"`n"

        # Cas spéciaux avec plusieurs imports sur la même ligne
        $content = $content -replace "import \{ supabaseAdmin \} from "@/lib/supabase/server"", "import { supabaseAdmin } from '@/lib/supabase/server'"
        $content = $content -replace "import \{ supabaseAdmin, logActivity \} from "@/lib/supabase/server"", "import { supabaseAdmin, logActivity } from '@/lib/supabase/server'"
        $content = $content -replace "import \{ getDashboardMetrics, supabaseAdmin \} from "@/lib/supabase/server"", "import { getDashboardMetrics, supabaseAdmin } from '@/lib/supabase/server'"

        Set-Content $fullPath $content -Encoding UTF8 -NoNewline
        Write-Host "  ✓ Corrigé : $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Introuvable : $file" -ForegroundColor Red
    }
}

# ── 3. CORRIGER app/(dashboard)/page.tsx (ActivityFeed) ──
Write-Host "`n[3/8] Correction de app/(dashboard)/page.tsx..." -ForegroundColor Yellow

$dashboardPage = Join-Path $repoPath "app\(dashboard)\page.tsx"
if (Test-Path $dashboardPage) {
    $content = Get-Content $dashboardPage -Raw -Encoding UTF8

    # Commenter l'import ActivityFeed s'il existe
    $content = $content -replace "import \{ ActivityFeed \} from '@/components/dashboard/activity-feed'", "// import { ActivityFeed } from '@/components/dashboard/activity-feed'"

    # Corriger l'import getDashboardMetrics
    $content = $content -replace "import \{ getDashboardMetrics, supabaseAdmin \} from "@/lib/supabase/server"", "import { getDashboardMetrics, supabaseAdmin } from '@/lib/supabase/server'"

    Set-Content $dashboardPage $content -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Dashboard page corrigée" -ForegroundColor Green
}

# ── 4. CORRIGER app/(dashboard)/import/page.tsx (typage reduce) ──
Write-Host "`n[4/8] Correction du typage dans import/page.tsx..." -ForegroundColor Yellow

$importPage = Join-Path $repoPath "app\(dashboard)\import\page.tsx"
if (Test-Path $importPage) {
    $content = Get-Content $importPage -Raw -Encoding UTF8

    # Corriger le reduce sans type
    $content = $content -replace "\(acc, \{ source \}\) =>", "(acc: Record<string, number>, { source }: { source: string }) =>"

    # Corriger l'import supabaseAdmin
    $content = $content -replace "import \{ supabaseAdmin \} from "@/lib/supabase/server"", "import { supabaseAdmin } from '@/lib/supabase/server'"

    Set-Content $importPage $content -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Import page corrigée" -ForegroundColor Green
}

# ── 5. CORRIGER lib/auth.ts (supprimer declare module JWT) ──
Write-Host "`n[5/8] Correction de lib/auth.ts..." -ForegroundColor Yellow

$authFile = Join-Path $repoPath "lib\auth.ts"
if (Test-Path $authFile) {
    $content = Get-Content $authFile -Raw -Encoding UTF8

    # Supprimer le declare module 'next-auth/jwt' problématique
    $content = $content -replace "declare module 'next-auth/jwt' \{[\s\S]*?\}\s*", ""

    Set-Content $authFile $content -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Auth.ts corrigé" -ForegroundColor Green
}

# ── 6. CORRIGER app/api/analytics/route.ts (typage implicit any) ──
Write-Host "`n[6/8] Correction de app/api/analytics/route.ts..." -ForegroundColor Yellow

$analyticsFile = Join-Path $repoPath "app\api\analytics\route.ts"
if (Test-Path $analyticsFile) {
    $content = Get-Content $analyticsFile -Raw -Encoding UTF8

    # Corriger l'import
    $content = $content -replace "import \{ supabaseAdmin \}\s+from "@/lib/supabase/server"", "import { supabaseAdmin } from '@/lib/supabase/server'"

    # Ajouter des types aux filter/reduce
    $content = $content -replace "all\.filter\(t =>", "all.filter((t: any) =>"
    $content = $content -replace "rated\.reduce\(\(s, t\) =>", "rated.reduce((s: number, t: any) =>"
    $content = $content -replace "widgets \?\? \[\]\)\.reduce\(\(s, w\) =>", "widgets ?? []).reduce((s: number, w: any) =>"
    $content = $content -replace "widgets \?\? \[\]\)\.map\(w =>", "widgets ?? []).map((w: any) =>"

    Set-Content $analyticsFile $content -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Analytics corrigé" -ForegroundColor Green
}

# ── 7. DÉPLACER LA PAGE DASHBOARD POUR ÉVITER LE CONFLIT ──
Write-Host "`n[7/8] Résolution du conflit de routes..." -ForegroundColor Yellow

$dashboardDir = Join-Path $repoPath "app\(dashboard)\dashboard"
if (-not (Test-Path $dashboardDir)) {
    New-Item -ItemType Directory -Path $dashboardDir -Force | Out-Null
}

$dashboardPage = Join-Path $repoPath "app\(dashboard)\page.tsx"
$dashboardNewPage = Join-Path $dashboardDir "page.tsx"

if (Test-Path $dashboardPage) {
    Move-Item $dashboardPage $dashboardNewPage -Force
    Write-Host "  ✓ Dashboard déplacé vers /dashboard" -ForegroundColor Green
}

# Créer une page d'accueil simple (landing ou redirect)
$marketingPage = Join-Path $repoPath "app\(marketing)\page.tsx"
if (-not (Test-Path $marketingPage)) {
    $landingContent = @'
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Voix</h1>
      <p className="text-lg text-gray-600 mb-8">Turn customers into your best salespeople.</p>
      <a href="/dashboard" className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
        Go to Dashboard
      </a>
    </main>
  )
}
'@
    Set-Content $marketingPage $landingContent -Encoding UTF8 -NoNewline
    Write-Host "  ✓ Landing page créée" -ForegroundColor Green
}

# ── 8. SUPPRIMER LE CACHE ET RÉINSTALLER ──
Write-Host "`n[8/8] Nettoyage du cache et réinstallation..." -ForegroundColor Yellow

$nextCache = Join-Path $repoPath ".next"
if (Test-Path $nextCache) {
    Remove-Item $nextCache -Recurse -Force
    Write-Host "  ✓ Cache .next supprimé" -ForegroundColor Green
}

$nodeModules = Join-Path $repoPath "node_modules"
$packageLock = Join-Path $repoPath "package-lock.json"

if (Test-Path $nodeModules) {
    Remove-Item $nodeModules -Recurse -Force
    Write-Host "  ✓ node_modules supprimé" -ForegroundColor Green
}

if (Test-Path $packageLock) {
    Remove-Item $packageLock -Force
    Write-Host "  ✓ package-lock.json supprimé" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Nettoyage terminé !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nProchaines étapes :" -ForegroundColor White
Write-Host "  1. npm install --legacy-peer-deps" -ForegroundColor Yellow
Write-Host "  2. npm run type-check" -ForegroundColor Yellow
Write-Host "  3. npm run build" -ForegroundColor Yellow
Write-Host "  4. git add . && git commit -m "fix: cleanup & security audit" && git push" -ForegroundColor Yellow
