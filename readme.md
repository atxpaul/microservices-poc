# Bun&Node.js Microservices PoC with Minikube

This is a simple Proof of Concept (PoC) of a set of microservices (MS) implemented in Node.js and Bun, and deployed on Minikube as the Kubernetes (k8s) environment.

## Overview

This project is growing and more microservices might be added in the future. Currently, the project includes the following microservices:

### Microservices

-   **api-gateway**:
    -   **Description**: Responsible for handling all incoming requests into the Kubernetes cluster.
    -   **Interface**: Requests are accepted via REST.
    -   **Language**: Node.js
-   **auth-service**:
    -   **Description**: Responsible for validating logins and creating users.
    -   **Interface**: Requests are received via gRPC.
    -   **Language**: Node.js
-   **catalog-service**:
    -   **Description**: Manages product catalog information.
    -   **Interface**: Requests are received via REST.
    -   **Language**: Bun

## Getting Started

To run this project locally, you will need the following prerequisites:

### Prerequisites

-   **PostgreSQL**: Ensure PostgreSQL is installed and running locally.
-   **MongoDB**: Ensure MongoDB is installed and running locally.
-   **Minikube**: Ensure Minikube is installed and running.
-   **Hosts File Update**: Update your `/etc/hosts` file to include `test.com` as follows:
    ```
    127.0.0.1 test.com
    ```

### Steps to Run Locally

1. **Start Minikube**:

    ```sh
    minikube start --nodes=3 --driver=docker
    ```

2. **Apply Kubernetes Manifests**:

    - Navigate to each microservice folder and apply the Kubernetes manifests:

    ```sh
    kubectl apply -f <name_of_the_file>
    ```

3. **Enable Minikube Tunnel**:

    ```sh
    minikube tunnel
    ```

4. **Enable Ingress**:

    ```sh
    minikube addons enable ingress
    ```

## Testing the Microservices

### Auth Service

-   **Register User**:

    ```sh
    curl --location 'http://test.com/register' \
    --header 'Content-Type: application/json' \
    --data '{"username":"user", "password":"pass"}'
    ```

-   **Login User**:
    ```sh
    curl --location 'http://test.com/login' \
    --header 'Content-Type: application/json' \
    --data '{"username":"user", "password":"pass"}'
    ```

### Catalog Service

-   **Get Catalog Item**:

    ```sh
    curl --location 'http://test.com/catalog?catalogId=1' \
    --header 'authorization: token' \
    --data ''
    ```

-   **Get All Catalog Items**:

    ```sh
    curl --location 'http://test.com/catalog' \
    --header 'authorization: token' \
    --data ''
    ```

-   **Add Catalog Item**:
    ```sh
    curl --location 'http://test.com/catalog' \
    --header 'authorization: token' \
    --header 'Content-Type: application/json' \
    --data '{"name":"testProduct", "description":"This is a test"}'
    ```

## Future Enhancements

-   Additional microservices may be added to enhance the functionality of this PoC.

## Contributing

Feel free to contribute by opening issues or submitting pull requests.

---

Enjoy experimenting with microservices in Node.js, Bun and Kubernetes!
