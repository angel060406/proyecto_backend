import { Request, Response } from 'express';
import Pokemon from '../models/Pokemon';
import cloudinary from '../config/Cloudinary';
import { broadcastMessage } from '../websocket';

export const registerPokemon = async (req: Request, res: Response) => {
  const { name, type, image } = req.body;

  try {
    const result = await cloudinary.uploader.upload(image, {
      folder: 'pokemons',
    });

    const pokemon = new Pokemon({
      name,
      type,
      imageUrl: result.secure_url,
    });

    const savedPokemon = await pokemon.save();

    broadcastMessage(JSON.stringify({
      message: `${name} ha sido capturado`,
      imageUrl: result.secure_url,
    }));

    res.status(201).json(savedPokemon);
  } catch (error) {
    res.status(500).json({ message: 'Error registering Pokémon', error });
  }
};

export const getPokemons = async (req: Request, res: Response) => {
  try {
    const pokemons = await Pokemon.find();
    res.status(200).json(pokemons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching Pokémon', error });
  }
};