# ArgoCD installation script for PowerShell

Write-Host "Installing ArgoCD..." -ForegroundColor Cyan

# Create namespace if it doesn't exist
Write-Host "Creating argocd namespace..." -ForegroundColor Yellow
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# Install ArgoCD
Write-Host "Applying ArgoCD manifests..." -ForegroundColor Yellow
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
Write-Host "Waiting for ArgoCD to be ready (this may take several minutes)..." -ForegroundColor Yellow
kubectl wait --for=condition=ready pod --all -n argocd --timeout=300s

# Get initial password
Write-Host ""
Write-Host "ArgoCD installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Access information:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password:" -ForegroundColor White
$password = kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"
[System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($password))
Write-Host ""
Write-Host "To access ArgoCD, run:" -ForegroundColor Cyan
Write-Host "   kubectl port-forward svc/argocd-server -n argocd 8080:443" -ForegroundColor White
Write-Host ""
Write-Host "   Then access: https://localhost:8080" -ForegroundColor White
Write-Host ""
