use serde::{Deserialize, Serialize};
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct EngineMove {
    from: String,
    to: String,
    fen: String,
}

#[wasm_bindgen]
pub struct XiangqiEngine {
    process: Option<Child>,
    engine_path: String,
}

#[wasm_bindgen]
impl XiangqiEngine {
    #[wasm_bindgen(constructor)]
    pub fn new(engine_path: &str) -> Self {
        XiangqiEngine {
            process: None,
            engine_path: engine_path.to_string(),
        }
    }

    pub fn start(&mut self) -> Result<(), JsValue> {
        let process = Command::new(&self.engine_path)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
            .map_err(|e| JsValue::from_str(&format!("Failed to start engine: {}", e)))?;

        self.process = Some(process);
        Ok(())
    }

    pub fn get_best_move(&mut self, fen: &str) -> Result<String, JsValue> {
        let process = self
            .process
            .as_mut()
            .ok_or_else(|| JsValue::from_str("Engine not started"))?;

        let stdin = process
            .stdin
            .as_mut()
            .ok_or_else(|| JsValue::from_str("Failed to get stdin"))?;

        // Send position command
        writeln!(stdin, "position fen {}", fen)
            .map_err(|e| JsValue::from_str(&format!("Failed to write position: {}", e)))?;
        stdin
            .flush()
            .map_err(|e| JsValue::from_str(&format!("Failed to flush stdin: {}", e)))?;

        // Send go command with a time limit
        writeln!(stdin, "go movetime 1000")
            .map_err(|e| JsValue::from_str(&format!("Failed to write go command: {}", e)))?;
        stdin
            .flush()
            .map_err(|e| JsValue::from_str(&format!("Failed to flush stdin: {}", e)))?;

        // Read engine output with timeout
        let stdout = process
            .stdout
            .as_mut()
            .ok_or_else(|| JsValue::from_str("Failed to get stdout"))?;
        let reader = BufReader::new(stdout);
        let start_time = std::time::Instant::now();
        let timeout = std::time::Duration::from_secs(5); // 5 second timeout

        for line in reader.lines() {
            if start_time.elapsed() > timeout {
                return Err(JsValue::from_str("Engine timeout"));
            }

            let line =
                line.map_err(|e| JsValue::from_str(&format!("Failed to read line: {}", e)))?;
            if line.starts_with("bestmove") {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    let best_move = parts[1];
                    if best_move.len() >= 4 {
                        let from = &best_move[0..2];
                        let to = &best_move[2..4];

                        let engine_move = EngineMove {
                            from: from.to_string(),
                            to: to.to_string(),
                            fen: fen.to_string(),
                        };

                        return Ok(serde_json::to_string(&engine_move).map_err(|e| {
                            JsValue::from_str(&format!("Failed to serialize move: {}", e))
                        })?);
                    }
                }
                return Err(JsValue::from_str("Invalid bestmove format"));
            }
        }

        Err(JsValue::from_str("No bestmove found in engine output"))
    }

    pub fn stop(&mut self) {
        if let Some(mut process) = self.process.take() {
            let _ = process.kill();
        }
    }
}

#[wasm_bindgen(start)]
pub fn main() {
    console_error_panic_hook::set_once();
}
