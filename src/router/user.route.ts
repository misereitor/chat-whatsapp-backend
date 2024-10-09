import { Response, Request, Router } from 'express';
import { createUserServices } from '../services/user-services';
import { User } from '../model/user-model';

const routerUser = Router();

routerUser.post('/user/create-user', async (req: Request, res: Response) => {
  try {
    const user: User = req.body;
    const response = await createUserServices(user);
    res.status(200).json({ success: true, data: response });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export { routerUser };
