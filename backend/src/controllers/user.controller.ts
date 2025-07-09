import { Request, Response } from 'express';
import * as userService from '../services/user.service';

export const getUsers = async (_req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.json(users);
};
