export interface UCCICommand {
    command: string;
    parameters?: string[];
}

export interface UCCIResponse {
    id?: string;
    response: string;
    data?: any;
}

export enum UCCICommands {
    UCI = 'ucci',
    ISREADY = 'isready',
    POSITION = 'position',
    GO = 'go',
    STOP = 'stop',
    QUIT = 'quit',
    PONDERHIT = 'ponderhit',
    SETOPTION = 'setoption'
}