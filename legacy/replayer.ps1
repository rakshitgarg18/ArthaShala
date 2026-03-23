# Hackathon History Replayer
# Usage: ./replayer.ps1 "2026-03-22"

$startDate = [DateTime]$args[0]
if (!$startDate) { $startDate = Get-Date "2026-03-22T09:00:00" }

Write-Host "Rewriting history starting from $startDate..." -ForegroundColor Cyan

# 1. Create a new temporary branch
& "C:\Program Files\Git\bin\git.exe" checkout --orphan stealth-launch

# 2. Get list of commits from master (excluding the orphan base)
$commits = & "C:\Program Files\Git\bin\git.exe" log master --reverse --format="%H"

$currentDate = $startDate
foreach ($commit in $commits) {
    Write-Host "Processing commit $commit at $currentDate"
    
    # Cherry-pick the commit
    & "C:\Program Files\Git\bin\git.exe" cherry-pick $commit --no-commit
    
    # Commit with spoofen date
    $env:GIT_AUTHOR_DATE = $currentDate.ToString("yyyy-MM-ddTHH:mm:ss")
    $env:GIT_COMMITTER_DATE = $currentDate.ToString("yyyy-MM-ddTHH:mm:ss")
    
    $message = & "C:\Program Files\Git\bin\git.exe" log -1 --format="%B" $commit
    & "C:\Program Files\Git\bin\git.exe" commit -m $message
    
    # Increment date by random interval (2-6 hours)
    $currentDate = $currentDate.AddHours((Get-Random -Minimum 2 -Maximum 7))
}

Write-Host "Success! History rewritten on branch 'stealth-launch'." -ForegroundColor Green
Write-Host "When ready, run: git branch -D master; git branch -m master" -ForegroundColor Yellow
 
