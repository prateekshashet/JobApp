import { MongoClient, Db } from "mongodb";

declare global {
  // eslint-disable-next-line
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoClient: MongoClient | undefined;
}

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI not set");

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In dev, use global to preserve cached connection across HMR
  if (!global._mongoClient) {
    client = new MongoClient(uri, options);
    global._mongoClient = client;
    global._mongoClientPromise = client.connect();
  }
  client = global._mongoClient!;
  clientPromise = global._mongoClientPromise!;
} else {
  // In prod, no global
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB || client.db().databaseName;
  return client.db(dbName);
}
