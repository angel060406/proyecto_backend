import { Request, Response } from 'express';
import Comment from '../models/Comment';
import User from '../models/User';

interface Client {
  pokemonId: string;
  res: Response;
}

let clients: Client[] = [];

export const addComment = async (req: Request, res: Response) => {
  const { pokemonId, comment } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newComment = new Comment({
      pokemonId,
      comment: `${user.name}: ${comment}`,
      user: req.user._id,
    });

    const savedComment = await newComment.save();

    clients.forEach((client) => {
      if (client.pokemonId === pokemonId) {
        client.res.json(savedComment);
      }
    });
    clients = clients.filter((client) => client.pokemonId !== pokemonId);

    res.status(201).json(savedComment);
  } catch (error: any) {
    res.status(500).json({ message: 'Error adding comment', error: error.message });
  }
};

export const getComments = async (req: Request, res: Response) => {
  const { pokemonId } = req.params;

  try {
    const comments = await Comment.find({ pokemonId }).populate('user', 'name');
    res.status(200).json(comments);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

export const longPollingComments = (req: Request, res: Response) => {
  const { pokemonId } = req.params;

  clients.push({ pokemonId, res });

  setTimeout(() => {
    clients = clients.filter((client) => client.res !== res);
    res.status(204).end();
  }, 30000); // 30 segundos timeout
};