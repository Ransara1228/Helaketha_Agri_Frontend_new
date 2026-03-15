$ErrorActionPreference = "Stop"

$projectRoot = "C:\xampp\htdocs\Helaketha_Agri_Frontend_New"
$destinationDir = Join-Path $projectRoot "docs\screenshots"

if (-not (Test-Path $destinationDir)) {
    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
}

$fileMap = @(
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_image-324c8b9d-e564-4e2e-96b0-da4795826664.png"
        Dest   = "01-project-overview.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_image-671f8a63-fa2a-41c0-a457-44ad3040f029.png"
        Dest   = "02-tech-stack.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_094741-75cfc483-2f95-438c-bda3-0bbf432814ae.png"
        Dest   = "03-keycloak-login.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_095011-ce423dec-4d79-465b-86c7-67a27b300f0c.png"
        Dest   = "04-admin-service-bookings.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_095127-82234e4b-8da6-4b0c-833d-1e6496f6f8e5.png"
        Dest   = "05-farmer-booking-table.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_094836-720fbcb6-f81a-42dd-9097-b855190c2ab3.png"
        Dest   = "06-admin-home-dashboard.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_095522-93324312-53bf-49d4-bd34-b98989323311.png"
        Dest   = "07-fertilizer-provider-dashboard.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_094915-65ac8c9e-66f5-4824-80ef-02965283708c.png"
        Dest   = "08-farmers-management.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_095051-fe01ff58-5b8c-4faf-a465-e444ade52a55.png"
        Dest   = "09-farmer-dashboard.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_095238-da323844-5c8d-421c-aeb9-cb6e575147ae.png"
        Dest   = "10-tractor-provider-dashboard.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_095347-85e06396-508e-4a3d-a0f4-585b42e8211f.png"
        Dest   = "11-harvester-provider-dashboard.png"
    },
    @{
        Source = "C:\Users\user\.cursor\projects\c-xampp-htdocs-Helaketha-Agri-Frontend-New\assets\c__Users_user_AppData_Roaming_Cursor_User_workspaceStorage_1d55b6472e73f8c064d193c496197e71_images_Screenshot_2026-03-15_094533-1da3a220-aa76-47f1-b769-71ff29820119.png"
        Dest   = "12-landing-page.png"
    }
)

$copiedCount = 0
$missing = @()

foreach ($item in $fileMap) {
    $sourcePath = $item.Source
    $destPath = Join-Path $destinationDir $item.Dest

    if (Test-Path $sourcePath) {
        Copy-Item -Path $sourcePath -Destination $destPath -Force
        Write-Host "Copied: $($item.Dest)"
        $copiedCount++
    } else {
        Write-Warning "Missing source file: $sourcePath"
        $missing += $sourcePath
    }
}

Write-Host ""
Write-Host "Done. Copied $copiedCount of $($fileMap.Count) files to $destinationDir"

if ($missing.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing files:" -ForegroundColor Yellow
    $missing | ForEach-Object { Write-Host "- $_" }
}
