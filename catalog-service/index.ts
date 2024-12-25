import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { MongoClient, ObjectId } from 'mongodb';

const packageDefinition = protoLoader.loadSync('catalog.proto', {});
const catalogProto = grpc.loadPackageDefinition(packageDefinition).catalog;

const mongoURI = process.env.DATABASE_URI || 'mongodb://localhost:27017';
const dbName = process.env.DATABASE_NAME;

let db;

const client = new MongoClient(mongoURI);

async function connectToMongo() {
  try {
    await client.connect();
    db = client.db(dbName);
    console.log('Connected to Mongodb');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

const getProduct = async (call, callback) => {
  try {
    const { id } = call.request;
    const product = await db.collection('products').findOne(
      { _id: ObjectId.createFromHexString(id) },
      { projection: { _id: 0, id: { $toString: "$_id" }, name: 1, description: 1 } }
    );
    if (!product) {
      callback({
        code: grpc.status.NOT_FOUND,
        message: 'Product not found',
      });
      return;
    }
    callback(null, product);
  } catch (err) {
    console.error('Error searching product:', err);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
};

const getProducts = async (call, callback) => {
  try {
    const products = await db.collection('products').find(
      {},
      { projection: { _id: 0, id: { $toString: "$_id" }, name: 1, description: 1 } }
    ).toArray();
    callback(null, { products });
  } catch (err) {
    console.error('Error fetching products:', err);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
};

const createProduct = async (call, callback) => {
  try {
    const { name, description } = call.request;
    const result = await db.collection('products').insertOne({ name, description });
    callback(null, {
      id: result.insertedId,
      name,
      description,
    });
    console.log('Product created:', result);
  } catch (err) {
    console.error('Error creating product:', err);
    callback({
      code: grpc.status.INTERNAL,
      message: 'Internal server error',
    });
  }
};

function startServer() {
  const server = new grpc.Server();
  server.addService(catalogProto.CatalogService.service, {
    GetProduct: getProduct,
    GetProducts: getProducts,
    CreateProduct: createProduct,
  });

  const port = process.env.PORT || '50051';
  server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
    if (err) {
      console.error('Error starting gRPC:', err);
      return;
    }
    console.log(`gRPC listening at: ${bindPort}`);
  });
}

(async () => {
  await connectToMongo();
  startServer();
})();
