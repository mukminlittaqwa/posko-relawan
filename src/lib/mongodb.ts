import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client
      .connect()
      .then((connectedClient) => {
        console.log("MongoDB Atlas TERHUBUNG (Development)");
        return connectedClient;
      })
      .catch((err) => {
        console.error("GAGAL terhubung MongoDB (Development):", err.message);
        throw err;
      });
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client
    .connect()
    .then((connectedClient) => {
      console.log("MongoDB Atlas TERHUBUNG (Production)");
      return connectedClient;
    })
    .catch((err) => {
      console.error("GAGAL terhubung MongoDB (Production):", err.message);
      throw err;
    });
}

export default clientPromise;
