import express from 'express';
import { postsService } from '../services/postsService.mjs';

export const postsRouter = express.Router();

//findAll
postsRouter.get('/', async (req, res) => {
  console.log('[GET] /posts route is being called');
  const posts = await postsService.findAll();
  res.json(posts); //express will send status 200 automatically
});
//findById
postsRouter.get('/:id', async (req, res) => {
  const { id } = req.params; //destructering from the objekt re.params
  const post = await postsService.findById(id); //id is here just a string
  if (!post) {
    res.status(404).send({ message: 'post not found' });
    return;
  }
  res.json(post);
});
//create
postsRouter.post('/', async (req, res) => {
  const newPost = req.body;
  const id = await postsService.create(newPost);

  res.status(201).json({ _id: id }); //sending an json object
});
//update
postsRouter.put('/:id', async (req, res) => {
  const { id } = req.params;
  const newPost = req.body;
  const result = await postsService.update(newPost, id);
  if (!result) {
    res.status(404).send({ message: 'post not found for update' });
    return;
  }
  res.json({ _id: id }); //sending JS Object, best practice für REST-APIs after create and update
});
//delete
postsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const result = await postsService.remove(id);
  if (!result) {
    res.status(404).send({ message: 'post not found for deletion' });
    return;
  }
  res.status(204).send(); //204 means, it worked, but i am sending no body
});

//Infos:
//sending an javascript object in post { id: id }. express converts it under the hood to an json object
//bei create and update schicken wir immer ein js obect zurück -> { id } wichtig, weil reg.params ein objekt mit allen parametern, deshalb macht man destructering um die key value pairs rauszubekommen
//res.send(posts) is enough, because Express sends default values if we do not send it explicidly
//statuscode 201 means created. good for posts
