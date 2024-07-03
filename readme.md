# Node.js Microservices PoC with Minikube

This is a simple Proof of Concept (PoC) of a set of microservices (MS) implemented in Node.js and deployed on Minikube as the Kubernetes (k8s) environment.

## Overview

This project is growing and more microservices might be added in the future. Currently, the project includes the following microservices:

### Microservices

-   **api-gateway**:
    -   **Description**: Responsible for handling all incoming requests into the Kubernetes cluster.
    -   **Interface**: Requests are accepted via REST.
-   **auth-service**:
    -   **Description**: Responsible for validating logins and creating users.
    -   **Interface**: Requests are received via gRPC.

## Getting Started

To run this project locally, you will need the following prerequisites:

### Prerequisites

-   **MongoDB**: Ensure MongoDB is installed and running locally.
-   **Minikube**: Ensure Minikube is installed and running.
-   **Hosts File Update**: Update your `/etc/hosts` file to include `test.com` as follows:
    ```
    127.0.0.1 test.com
    ```

### Steps to Run Locally

1. **Start Minikube**:

    ```sh
    minikube start
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

## Future Enhancements

-   Additional microservices may be added to enhance the functionality of this PoC.

## Contributing

Feel free to contribute by opening issues or submitting pull requests.

---

Enjoy experimenting with microservices in Node.js and Kubernetes!
