import { after, before, beforeEach, describe, it } from 'node:test';
import { deepStrictEqual, strictEqual } from 'node:assert';

import { MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { postsService } from './postsService.mjs';

describe('postsService', () => {
  let config;
  /** @type {MongoMemoryServer} */
  let mongoServer;
  /** @type {MongoClient} */
  let client;

  /** @type {import('mongodb').InsertManyResult<import('mongodb').Document>} */
  let insertManyResults;

  before(async () => {
    config = await import(`../config/${process.env.MESSAGE_BOARD_ENV}.env.mjs`);
    mongoServer = await MongoMemoryServer.create({
      instance: {
        port: config.MONGO_PORT,
        ip: config.MONGO_HOST,
      },
    });
    client = await MongoClient.connect(mongoServer.getUri());
  });

  after(async () => {
    await mongoServer.stop();
    await client.close();
  });

  beforeEach(async () => {
    const db = client.db(config.MONGO_DBNAME);
    const posts = await db.createCollection('posts');

    await posts.deleteMany({});
    insertManyResults = await posts.insertMany([
      {
        title: 'Create',
        author: 'Sherlock',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        votes: 0,
      },
      {
        title: 'Read',
        author: 'Sherlock',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        votes: 0,
      },
      {
        title: 'Update',
        author: 'Sherlock',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        votes: 0,
      },
      {
        title: 'Delete',
        author: 'Sherlock',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        votes: 0,
      },
    ]);
  });

  describe('findAll()', () => {
    // our actual tests are in its.
    // test() is another option for this.
    it('returns all posts', async () => {
      // arrange / act
      const posts = await postsService.findAll();

      // assert
      deepStrictEqual(posts.length, 4);
    });

    it('prevents changes by consuming code', async () => {
      // arrange / act
      const posts = await postsService.findAll();
      posts[0].votes = 1;
      const posts_2 = await postsService.findAll();

      // assert
      strictEqual(posts_2[0].votes, 0);
    });
  });

  describe('findById(id)', () => {
    it('returns the matching post if it exists', async () => {
      // arrange
      const id = insertManyResults.insertedIds[0].toHexString();

      // act
      const post = await postsService.findById(id);

      // assert
      deepStrictEqual(post, (await postsService.findAll())[0]);
    });

    it('returns undefined if no todo is found', async () => {
      // arrange
      const id = ObjectId.createFromTime(new Date()).toHexString();

      // act
      const post = await postsService.findById(id);

      // assert
      strictEqual(post, undefined);
    });

    it('prevents changes by consuming code', async () => {
      // arrange
      const id = insertManyResults.insertedIds[0].toHexString();

      // act
      const post = await postsService.findById(id);
      post.votes = 1;
      const post_2 = await postsService.findById(id);

      // assert
      strictEqual(post_2.votes, 0);
    });
  });

  describe('create(todo)', () => {
    let newPost;

    beforeEach(() => {
      newPost = {
        title: 'Write',
        author: 'Sherlock',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        votes: 0,
      };
    });

    it('creates a new todo', async () => {
      // arrange / act
      await postsService.create(newPost);

      // assert
      strictEqual((await postsService.findAll()).length, 5);
    });

    it('generates and returns the new todos id', async () => {
      // arrange / act
      const id = await postsService.create(newPost);
      const post = await postsService.findById(id);

      // assert
      deepStrictEqual(post, {
        ...newPost,
        _id: ObjectId.createFromHexString(id),
      });
    });

    it('can deal with deletions', async () => {
      // arrange / act
      postsService.remove(insertManyResults.insertedIds[0].toHexString());
      const id = await postsService.create(newPost);
      const post = await postsService.findById(id);

      // assert
      deepStrictEqual(post, {
        ...newPost,
        _id: ObjectId.createFromHexString(id),
      });
    });

    it('prevents changes by consuming code', async () => {
      // arrange / act
      const id = await postsService.create(newPost);
      newPost.votes = 1;
      const post = await postsService.findById(id);

      // assert
      strictEqual(post.votes, 0);
    });
  });

  describe('update(todo, id)', () => {
    let toBeUpdated;

    beforeEach(async () => {
      toBeUpdated = {
        _id: insertManyResults.insertedIds[2].toHexString(),
        title: 'Update Success',
        author: 'Sherlock',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        votes: 1,
      };
    });

    it('updates the todo', async () => {
      // arrange / act
      await postsService.update(toBeUpdated, toBeUpdated._id);

      // assert
      strictEqual(
        (await postsService.findById(toBeUpdated._id)).title,
        'Update Success'
      );
      strictEqual((await postsService.findById(toBeUpdated._id)).votes, 1);
    });

    it('returns true if the update was successful', async () => {
      // arrange / act
      const result = await postsService.update(toBeUpdated, toBeUpdated._id);

      // assert
      strictEqual(result, true);
    });

    it('returns false if no todo was found', async () => {
      // arrange / act
      const result = await postsService.update(
        toBeUpdated,
        ObjectId.createFromTime(new Date()).toHexString()
      );

      // assert
      strictEqual(result, false);
    });
  });

  describe('remove(id)', () => {
    let id;
    beforeEach(() => {
      id = insertManyResults.insertedIds[0].toHexString();
    });

    it('removes the post by id', async () => {
      // arrange / act
      await postsService.remove(id);

      // assert
      strictEqual(await postsService.findById(id), undefined);
    });

    it('returns true if the deletion was successful', async () => {
      // arrange / act
      const result = await postsService.remove(id);

      // assert
      strictEqual(result, true);
    });

    it('returns false if no todo was found', async () => {
      // arrange
      id = ObjectId.createFromTime(new Date()).toHexString();

      // act
      const result = await postsService.remove(id);

      // assert
      strictEqual(result, false);
    });
  });
});
