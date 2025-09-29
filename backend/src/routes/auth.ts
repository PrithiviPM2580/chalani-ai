import { Router } from 'express';
import signUpContoller from '@/controllers/auth/sign-up';

const router = Router();

router.route('/auth').post(signUpContoller);

export default router;
