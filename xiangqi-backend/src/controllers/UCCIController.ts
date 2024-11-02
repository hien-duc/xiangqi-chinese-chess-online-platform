import { Request, Response } from 'express';
import { UCCIHandler } from '../handlers/UCCIHandler';
import { UCCICommand, UCCICommands } from '../types/ucci';

export class UCCIController {
    private ucciHandler: UCCIHandler;

    constructor() {
        this.ucciHandler = new UCCIHandler();
    }

    async handleUCCICommand(req: Request, res: Response) {
        try {
            // Validate input
            const command: UCCICommand = req.body;
            if (!command.command) {
                return res.status(400).json({
                    response: 'error',
                    data: 'Command is required'
                });
            }

            // Validate command type
            if (!Object.values(UCCICommands).includes(command.command as UCCICommands)) {
                return res.status(400).json({
                    response: 'error',
                    data: `Invalid command: ${command.command}`
                });
            }

            const response = await this.ucciHandler.handleCommand(command);
            res.json(response);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

            res.status(400).json({
                response: 'error',
                data: errorMessage
            });
        }
    }
}