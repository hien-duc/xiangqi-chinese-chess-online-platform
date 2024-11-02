import express, { Request, Response } from 'express';
import { UCCIController } from '../controllers/UCCIController';

const router = express.Router();
const ucciController = new UCCIController();

// Define the route handler with proper types
router.post('/command', async (req: Request, res: Response) => {
    await ucciController.handleUCCICommand(req, res);
});

export const ucciRoutes = router;