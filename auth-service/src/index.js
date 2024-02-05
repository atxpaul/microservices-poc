import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import express from 'express';
import bodyParser from 'body-parser';
import pool from './utils/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from './utils/config.js';

const app = express();
const PORT = 3000; // Puerto para las solicitudes REST

app.use(bodyParser.json());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const dbRes = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        if (dbRes.rows.length > 0) {
            const user = dbRes.rows[0];
            const role = user.role;
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                const token = jwt.sign({ username, role }, config.jwt_secret, {
                    expiresIn: '24h',
                });
                res.json({ token });
            } else {
                res.status(401).json({ error: 'Invalid password' });
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to connect to the database' });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const role = 'client';
        const dbRes = await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, role]
        );
        if (dbRes.rows.length > 0) {
            res.json({ success: true });
        } else {
            res.status(500).json({ error: 'Failed to register the user' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to connect to the database' });
    }
});

app.listen(PORT, () => {
    console.log(`REST API listening on port ${PORT}`);
});

const validateToken = (call, callback) => {
    const { token } = call.request;

    jwt.verify(token, config.jwt_secret, (err, decoded) => {
        if (err) {
            callback(null, { isValid: false });
        } else {
            callback(null, {
                isValid: true,
                username: decoded.username,
                role: decoded.role,
            });
        }
    });
};

const PROTO_PATH = 'auth.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const authService =
    grpc.loadPackageDefinition(packageDefinition).auth.AuthService;

const server = new grpc.Server();
server.addService(authService.service, { validateToken });

server.bindAsync(
    '0.0.0.0:4000',
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(`gRPC listening on port ${port}`);
        server.start();
    }
);
