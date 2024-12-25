import express from 'express';
import bodyParser from 'body-parser';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

const AUTH_PROTO_PATH = 'auth.proto';
const packageDefinition = protoLoader.loadSync(AUTH_PROTO_PATH, {});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;
const authClient = new authProto.AuthService(
    'auth-service.default.svc.cluster.local:4000',
    grpc.credentials.createInsecure()
);
const CATALOG_PROTO_PATH = 'catalog.proto';
const catalogPackageDefinition = protoLoader.loadSync(CATALOG_PROTO_PATH, {});
const catalogProto = grpc.loadPackageDefinition(
    catalogPackageDefinition
).catalog;
const catalogClient = new catalogProto.CatalogService(
    'catalog-service.default.svc.cluster.local:50051',
    grpc.credentials.createInsecure()
);

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.post('/register', (req, res) => {
    console.log('Received register request:', req.body);
    const { username, password } = req.body;
    authClient.register({ username, password }, (err, response) => {
        if (err) {
            console.error('Error occurred during registration:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            console.log('Registration response:', response);
            res.json(response);
        }
    });
});

app.post('/login', (req, res) => {
    console.log('Received login request:', req.body);
    const { username, password } = req.body;
    authClient.login({ username, password }, (err, response) => {
        if (err) {
            console.error('Error occurred during login:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            console.log('Login response:', response);
            if (response.error) {
                res.status(401).json({ error: response.error });
            } else {
                res.json({ token: response.token });
            }
        }
    });
});

const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    authClient.validateToken({ token }, (err, response) => {
        if (err || !response.isValid) {
            console.error('Token validation failed:', err);
            return res.status(401).json({ error: 'Invalid token' });
        } else {
            console.log('Token validated successfully:', response);
            req.user = response;
            next();
        }
    });
};

app.get('/catalog', authenticate, (req, res) => {
    console.log('Catalog route accessed by:', req.user.username);
    const catalogId = req.query.catalogId;

    if (catalogId) {
        catalogClient.GetProduct({ id: catalogId }, (err, response) => {
            if (err) {
                if (err.code === 5) {
                    res.status(404).json({ error: 'Product not found' });
                } else {
                    console.error(
                        'Error occurred during catalog retrieval:',
                        err
                    );
                    res.status(500).json({ error: 'Internal server error' });
                }
            } else {
                console.log('Catalog retrieved:', response);
                res.json(response);
            }
        });
    } else {
        catalogClient.GetProducts({}, (err, response) => {
            if (err) {
                console.error('Error occurred during catalog retrieval:', err);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                console.log('Catalog retrieved:', response);
                res.json(response.products);
            }
        });
    }
});

app.post('/catalog', authenticate, (req, res) => {
    console.log('Received create catalog request:', req.body);
    const { name, description } = req.body;
    catalogClient.CreateProduct({ name, description }, (err, response) => {
        if (err) {
            console.error('Error occurred during catalog creation:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            console.log('Catalog created:', response);
            res.json(response);
        }
    });
});

app.get('/protected', authenticate, (req, res) => {
    console.log('Protected route accessed by:', req.user.username);
    res.json({
        message: `Hello, ${req.user.username}! Your role is ${req.user.role}.`,
    });
});

// Other routes
app.use('/flights', authenticate, (req, res) => {
    console.log('Flights route accessed by:', req.user.username);
});

app.use('/hotels', authenticate, (req, res) => {
    console.log('Hotels route accessed by:', req.user.username);
});

app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
});
