import { MongoClient } from 'mongodb';

let clientPromise;
let configPromise;

// Lazy load the config
async function getConfig() {
  if (!configPromise) {
    configPromise = import(
      `../config/${process.env.MESSAGE_BOARD_ENV}.env.mjs`
    );
  }
  return configPromise;
}
//Loads Database Access
async function createClient() {
  /*  const config = await import(
    `../config/${process.env.MESSAGE_BOARD_ENV}.env.mjs`
  ); */
  const config = await getConfig();
  const uri = `mongodb://${config.MONGO_HOST}:${config.MONGO_PORT}`;
  console.log('[MongoDB] Connecting to:', uri);
  const client = new MongoClient(uri, { monitorCommands: true });
  await client.connect();

  const database = client.db(config.MONGO_DBNAME);
  console.log('[MongoDB] Connected to database:', database.databaseName);
  console.log('[MongoDB] Returning client and database');
  return { client, database };
}

//Singleton Pattern with Lazy Initialization
//Ensures that only one database connection is established and only when needed (lazy)
async function getClientPromise() {
  if (!clientPromise) {
    clientPromise = createClient();
  }
  return clientPromise;
}

export { getClientPromise, getConfig };
