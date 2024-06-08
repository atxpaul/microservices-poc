import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import pool from './utils/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from './utils/config.js';

const PROTO_PATH = 'auth.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const authProto = grpc.loadPackageDefinition(packageDefinition).auth;

const SALT_ROUNDS = 10;

const register = async (call, callback) => {
    console.log('Received register request:', call.request);
    const { username, password } = call.request;
    try {
        const userCheck = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        if (userCheck.rows.length > 0) {
            console.log('Username already exists');
            callback(null, {
                success: false,
                error: 'Username already exists',
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const role = 'client';
        const dbRes = await pool.query(
            'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *',
            [username, hashedPassword, role]
        );
        if (dbRes.rows.length > 0) {
            console.log('Registration successful');
            callback(null, { success: true });
        } else {
            console.log('Failed to register the user');
            callback(null, {
                success: false,
                error: 'Failed to register the user',
            });
        }
    } catch (err) {
        console.error(err);
        console.log('Failed to connect to the database');
        callback(null, {
            success: false,
            error: 'Failed to connect to the database',
        });
    }
};

const login = async (call, callback) => {
    console.log('Received login request:', call.request);
    const { username, password } = call.request;
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
                console.log('Login successful');
                const token = jwt.sign({ username, role }, config.jwt_secret, {
                    expiresIn: '24h',
                });
                callback(null, { token });
            } else {
                console.log('User or password incorrect');
                callback(null, { error: 'User or password incorrect' });
            }
        } else {
            console.log('User or password incorrect');
            callback(null, { error: 'User or password incorrect' });
        }
    } catch (err) {
        console.error(err);
        console.log('Failed to connect to the database');
        callback(null, { error: 'Failed to connect to the database' });
    }
};

const validateToken = (call, callback) => {
    console.log('Received token validation request:', call.request);
    const { token } = call.request;
    jwt.verify(token, config.jwt_secret, (err, decoded) => {
        if (err) {
            console.log('Token validation failed:', err);
            callback(null, { isValid: false });
        } else {
            console.log('Token validated successfully');
            callback(null, {
                isValid: true,
                username: decoded.username,
                role: decoded.role,
            });
        }
    });
};

const server = new grpc.Server();
server.addService(authProto.AuthService.service, {
    register,
    login,
    validateToken,
});

server.bindAsync(
    '0.0.0.0:4000',
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(`gRPC server listening on port ${port}`);
        server.start();
    }
);
