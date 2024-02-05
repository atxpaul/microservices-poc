const config = {
    jwt_secret: process.env.jwt_SECRET,
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    db_user: process.env.DB_USER,
    db_password: process.env.DB_PASSWORD,
    db_database: process.env.DB_DATABASE,
};

export default config;
