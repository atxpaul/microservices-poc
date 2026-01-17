#!/bin/bash

set -e

echo "Installing ArgoCD..."

# Create namespace if it doesn't exist
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -

# Install ArgoCD
echo "Applying ArgoCD manifests..."
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
echo "Waiting for ArgoCD to be ready..."
kubectl wait --for=condition=ready pod --all -n argocd --timeout=300s

# Get initial password
echo ""
echo "ArgoCD installed successfully!"
echo ""
echo "Access information:"
echo "   Username: admin"
echo "   Password:"
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
echo ""
echo ""
echo "To access ArgoCD, run:"
echo "   kubectl port-forward svc/argocd-server -n argocd 8080:443"
echo ""
echo "   Then access: https://localhost:8080"
echo ""
