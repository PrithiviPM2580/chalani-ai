import type { Request, Response } from 'express';

const signUpController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  res
    .status(201)
    .json({ message: 'User registered successfully', user: _req.body });
};

export default signUpController;
