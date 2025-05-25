import { ObjectId } from 'mongodb';
import { getClientPromise } from '../database/clientService.mjs';

async function getPostsCollection() {
  const { database } = await getClientPromise();
  const posts = database.collection('posts');
  return posts;
}

export const postsService = {
  async findAll() {
    //methoden syntax -> alternative arrow syntax: findAll: async () => {}
    const posts = await getPostsCollection();
    const result = await posts.find({}).toArray();
    console.log(JSON.stringify(result, null, 2));
    return result;
  },
  async findById(id) {
    const posts = await getPostsCollection();
    const query = { _id: ObjectId.createFromHexString(id) };
    const result = await posts.findOne(query);
    return result ?? undefined;
  },
  async create(post) {
    const posts = await getPostsCollection();
    const { acknowledged, insertedId } = await posts.insertOne(post);
    return acknowledged ? insertedId.toHexString() : undefined;
  },
  async update(updatePost, id) {
    const posts = await getPostsCollection();
    const filter = { _id: ObjectId.createFromHexString(id) };
    const updateDoc = {
      $set: {
        ...updatePost,
      },
    };
    delete updateDoc.$set._id; //always send mongodb a new doc without an _id
    const { acknowledged, modifiedCount } = await posts.updateOne(
      filter,
      updateDoc
    );
    return acknowledged && modifiedCount ? true : false;
    //returns true or false
  },
  async remove(id) {
    const posts = await getPostsCollection();
    const filter = { _id: ObjectId.createFromHexString(id) };
    const { acknowledged, deletedCount } = await posts.deleteOne(filter);
    return acknowledged && deletedCount ? true : false;
  },
};
