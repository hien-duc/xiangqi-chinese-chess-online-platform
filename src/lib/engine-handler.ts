import { spawn, ChildProcess } from "child_process";

export class EngineHandler {
  private engine: ChildProcess | null = null;
  private enginePath: string;
  private isReady: boolean = false;
  private moveCallback: ((move: string) => void) | null = null;

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
            if (move && this.moveCallback) {
              this.moveCallback(move);
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
        });

        // Initialize UCI protocol
        this.sendCommand("uci");
        this.sendCommand("isready");
      } catch (error) {
        reject(error);
      }
    });
  }

  public sendMove(fen: string, callback: (move: string) => void) {
    if (!this.engine || !this.isReady) {
      throw new Error("Engine not ready");
    }

    this.moveCallback = callback;
    this.sendCommand(`position fen ${fen}`);
    this.sendCommand("go movetime 1000"); // Think for 1 second
  }

  private sendCommand(command: string) {
    if (this.engine?.stdin) {
      this.engine.stdin.write(command + "\n");
    }
  }

  private parseBestMove(output: string): string | null {
    const match = output.match(/bestmove\s+(\S+)/);
    return match ? match[1] : null;
  }

  public stop() {
    if (this.engine) {
      this.sendCommand("quit");
      this.engine.kill();
      this.engine = null;
      this.isReady = false;
    }
  }
}
