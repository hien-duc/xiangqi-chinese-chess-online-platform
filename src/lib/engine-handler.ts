import { spawn, ChildProcess } from "child_process";

interface MoveRequest {
  id: string;
  fen: string;
  callback: (move: string) => void;
}

export class EngineHandler {
  private engine: ChildProcess | null = null;
  private enginePath: string;
  private isReady: boolean = false;
  private requestQueue: MoveRequest[] = [];
  private currentRequest: MoveRequest | null = null;
  private isProcessing: boolean = false;

  constructor(enginePath: string) {
    this.enginePath = enginePath;
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.engine = spawn(this.enginePath);

        this.engine.stdout?.on("data", (data: Buffer) => {
          const output = data.toString();
          console.log("Engine output:", output);

          if (output.includes("bestmove")) {
            const move = this.parseBestMove(output);
            if (move && this.currentRequest?.callback) {
              this.currentRequest.callback(move);
              this.currentRequest = null;
              this.processNextRequest();
            }
          }

          if (output.includes("uciok")) {
            this.isReady = true;
            resolve();
          }
        });

        this.engine.stderr?.on("data", (data: Buffer) => {
          console.error("Engine error:", data.toString());
        });

        this.engine.on("close", (code) => {
          console.log(`Engine process exited with code ${code}`);
          this.isReady = false;
          this.currentRequest = null;
          this.requestQueue = [];
        });

        // Initialize UCI protocol
        this.sendCommand("uci");
        this.sendCommand("isready");
      } catch (error) {
        reject(error);
      }
    });
  }

  private async processNextRequest() {
    if (this.isProcessing || !this.requestQueue.length || this.currentRequest) {
      return;
    }

    this.isProcessing = true;
    try {
      this.currentRequest = this.requestQueue.shift()!;
      console.log("Processing request for position:", this.currentRequest.fen);
      
      // Set the position and get the best move
      this.sendCommand(`position fen ${this.currentRequest.fen}`);
      this.sendCommand("go depth 15"); // Adjust depth as needed
    } finally {
      this.isProcessing = false;
    }
  }

  public sendMove(fen: string, callback: (move: string) => void): void {
    if (!this.isReady || !this.engine) {
      console.error("Engine not ready");
      return;
    }

    // Create a unique ID for this request
    const requestId = Math.random().toString(36).substring(7);
    
    // Add to queue
    this.requestQueue.push({
      id: requestId,
      fen,
      callback,
    });

    // Try to process next request
    this.processNextRequest();
  }

  private sendCommand(command: string) {
    console.log("Sending command to engine:", command);
    this.engine?.stdin?.write(command + "\n");
  }

  private parseBestMove(output: string): string | null {
    console.log("Raw engine output:", output);
    const match = output.match(/bestmove\s+(\w+)/);
    if (match && match[1]) {
      const engineMove = match[1];
      console.log("Engine move format:", engineMove);
      return engineMove;
    }
    return null;
  }

  public stop(): void {
    if (this.engine) {
      // Clear all pending requests
      this.requestQueue = [];
      this.currentRequest = null;
      
      this.sendCommand("quit");
      this.engine.kill();
      this.engine = null;
      this.isReady = false;
    }
  }
}
