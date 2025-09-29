import type { Request, Response } from 'express';

const signUpContoller = async (req: Request, res: Response): Promise<void> => {
  res.send('sign up controller');
};

export default signUpContoller;
