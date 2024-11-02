import { UCCICommand, UCCIResponse, UCCICommands } from '../types/ucci';

export class UCCIHandler {
    private engineReady: boolean = false;

    async handleCommand(command: UCCICommand): Promise<UCCIResponse> {
        const cmd = command.command.toLowerCase();

        switch (cmd) {
            case UCCICommands.UCI:
                return this.handleUCCI();
            case UCCICommands.ISREADY:
                return this.handleIsReady();
            case UCCICommands.POSITION:
                return this.handlePosition(command.parameters);
            case UCCICommands.GO:
                return this.handleGo(command.parameters);
            case UCCICommands.STOP:
                return this.handleStop();
            default:
                throw new Error(`Unknown command: ${cmd}`);
        }
    }

    private handleUCCI(): UCCIResponse {
        return {
            response: 'ucciok',
            data: {
                id: 'XiangqiServer',
                author: 'YourName',
                options: [
                    { name: 'Hash', type: 'spin', default: 128, min: 1, max: 1024 },
                    { name: 'MultiPV', type: 'spin', default: 1, min: 1, max: 500 }
                ]
            }
        };
    }

    private handleIsReady(): UCCIResponse {
        this.engineReady = true;
        return {
            response: 'readyok'
        };
    }

    private handlePosition(params?: string[]): UCCIResponse {
        if (!params) throw new Error('No position parameters provided');

        const isStartPos = params[0] === 'startpos';
        const fen = isStartPos ? this.getStartPosFEN() : params[0];
        const moves = params.slice(isStartPos ? 2 : 1);

        return {
            response: 'info',
            data: {
                fen,
                moves
            }
        };
    }

    private handleGo(params?: string[]): UCCIResponse {
        const searchParams = this.parseGoParameters(params);

        return {
            response: 'bestmove',
            data: {
                move: 'a0a1', // Example move
                ponder: 'b0b1'
            }
        };
    }

    private handleStop(): UCCIResponse {
        return {
            response: 'bestmove',
            data: {
                move: 'a0a1' // Return current best move when stopped
            }
        };
    }

    private getStartPosFEN(): string {
        return 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';
    }

    private parseGoParameters(params?: string[]): any {
        if (!params) return {};

        const searchParams: any = {};
        for (let i = 0; i < params.length; i += 2) {
            if (params[i + 1]) {
                searchParams[params[i]] = params[i + 1];
            }
        }
        return searchParams;
    }
}