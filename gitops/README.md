# GitOps Setup with ArgoCD

This directory contains the GitOps configuration for the microservices project using ArgoCD.

## Structure

```
gitops/
├── apps/                    # ArgoCD Application manifests
│   ├── root-application.yaml    # App of Apps - manages all applications
│   ├── api-gateway/
│   │   └── application.yaml
│   ├── auth-service/
│   │   └── application.yaml
│   └── catalog-service/
│       └── application.yaml
└── base/                    # Base Kubernetes manifests
    ├── api-gateway/
    ├── auth-service/
    └── catalog-service/
```

## Prerequisites

1. **Kubernetes cluster** (Minikube, GKE, EKS, AKS, etc.)
2. **kubectl** configured and connected to the cluster
3. **ArgoCD CLI** installed (optional but recommended)
4. **Git repository** configured and accessible

## ArgoCD Installation

### Option 1: Using the installation script

```bash
# On Windows (PowerShell)
.\gitops\scripts\install-argocd.ps1

# On Linux/Mac
./gitops/scripts/install-argocd.sh
```

### Option 2: Manual installation

```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod --all -n argocd --timeout=300s

# Get the initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

## Accessing ArgoCD

### Port Forward (for local development)

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then access: `https://localhost:8080`

-   **Username**: `admin`
-   **Password**: (obtained from the secret above)

### Expose ArgoCD with Ingress (production)

See `gitops/argocd/ingress.yaml` for Ingress configuration.

## Repository Configuration

1. **Update repository URLs** in the Application files:

    Edit the following files and replace `YOUR_USERNAME` with your GitHub username/organization:

    - `gitops/apps/root-application.yaml`
    - `gitops/apps/api-gateway/application.yaml`
    - `gitops/apps/auth-service/application.yaml`
    - `gitops/apps/catalog-service/application.yaml`

2. **Commit and push** the changes:

    ```bash
    git add gitops/
    git commit -m "Add GitOps configuration with ArgoCD"
    git push origin main
    ```

## Deploy Applications with GitOps

### Option 1: App of Apps Pattern (Recommended)

This pattern deploys all applications automatically:

```bash
kubectl apply -f gitops/apps/root-application.yaml
```

ArgoCD will detect and automatically deploy all applications defined in `gitops/apps/`.

### Option 2: Individual Applications

If you prefer to deploy applications individually:

```bash
# API Gateway
kubectl apply -f gitops/apps/api-gateway/application.yaml

# Auth Service
kubectl apply -f gitops/apps/auth-service/application.yaml

# Catalog Service
kubectl apply -f gitops/apps/catalog-service/application.yaml
```

## Automatic Synchronization

Applications are configured with `syncPolicy.automated` which:

-   **Prune**: Removes resources that are no longer in Git
-   **SelfHeal**: Automatically corrects manual changes in the cluster
-   **AllowEmpty**: Allows empty applications

Any changes in the Git repository will be automatically synchronized with the cluster.

## Manual Synchronization

If you need to synchronize manually:

```bash
# Using ArgoCD CLI
argocd app sync api-gateway
argocd app sync auth-service
argocd app sync catalog-service

# Or from the ArgoCD UI
# Go to the application and click "Sync"
```

## Monitoring and Status

### View application status

```bash
# List all applications
argocd app list

# View application details
argocd app get api-gateway

# View resource tree
argocd app tree api-gateway
```

### From the UI

Access the ArgoCD UI and you will see the status of all applications in real-time.

## Updating Docker Images

To update Docker images:

1. Build and push the new image:

    ```bash
    docker build -t atxpaul/api-gateway:v1.0.1 ./api-gateway/
    docker push atxpaul/api-gateway:v1.0.1
    ```

2. Update the tag in the deployment:

    Edit `gitops/base/api-gateway/deployment.yaml` and change:

    ```yaml
    image: atxpaul/api-gateway:latest
    ```

    to:

    ```yaml
    image: atxpaul/api-gateway:v1.0.1
    ```

3. Commit and push:

    ```bash
    git add gitops/base/api-gateway/deployment.yaml
    git commit -m "Update api-gateway to v1.0.1"
    git push origin main
    ```

4. ArgoCD will automatically synchronize the change.

## Multiple Environments (Optional)

To manage multiple environments (dev, staging, prod), you can:

1. Create Kustomize overlays for each environment:

    ```
    gitops/
    ├── base/
    └── overlays/
        ├── dev/
        ├── staging/
        └── prod/
    ```

2. Update the Application manifests to point to different overlays.

See [Kustomize documentation](https://kustomize.io/) for more details.

## Troubleshooting

### Application does not sync

1. Verify that the Git repository is accessible from ArgoCD
2. Check ArgoCD logs:

    ```bash
    kubectl logs -n argocd -l app.kubernetes.io/name=argocd-application-controller
    ```

3. Verify the Application configuration:

    ```bash
    kubectl get application api-gateway -n argocd -o yaml
    ```

### Permission errors

Make sure ArgoCD has permissions to create resources in the target namespace.

### Resources are not deleted

Verify that `prune: true` is configured in `syncPolicy.automated`.

## Additional Resources

-   [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
-   [Kustomize Documentation](https://kustomize.io/)
-   [GitOps Best Practices](https://www.gitops.tech/)
