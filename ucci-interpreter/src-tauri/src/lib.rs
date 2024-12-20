// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tauri::{State};
use tauri::{Emitter};

// Structure to hold the engine process
struct EngineState {
    process: Option<Child>,
    writer: Option<std::process::ChildStdin>,
}

impl EngineState {
    fn new() -> Self {
        Self {
            process: None,
            writer: None,
        }
    }
}

// Wrap the engine state in a mutex for thread-safe access
type SafeEngineState = Mutex<EngineState>;

#[tauri::command]
async fn start_engine(
    engine_path: String,
    state: State<'_, SafeEngineState>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut engine = state.lock().map_err(|e| e.to_string())?;

    // Start the engine process
    let mut child = Command::new(engine_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    // Get stdin handle
    let writer = child.stdin.take().ok_or("Failed to get stdin")?;
    
    // Get stdout handle and create a reader
    let reader = BufReader::new(child.stdout.take().ok_or("Failed to get stdout")?);

    // Store the handles
    engine.writer = Some(writer);
    engine.process = Some(child);

    // Drop the lock before spawning the thread
    drop(engine);

    // Spawn a thread to continuously read engine output
    std::thread::spawn(move || {
        let mut line = String::new();
        let mut reader = reader;
        loop {
            line.clear();
            match reader.read_line(&mut line) {
                Ok(0) => {
                    // EOF reached, engine probably terminated
                    let _ = app_handle.emit("engine-error", "Engine process terminated");
                    break;
                }
                Ok(_) => {
                    // Skip if the line is just an echo of the command
                    let trimmed = line.trim();
                    if !trimmed.starts_with("Received command:") {
                        // Emit the output as an event
                        if let Err(e) = app_handle.emit("engine-output", trimmed) {
                            eprintln!("Failed to emit engine output: {}", e);
                            break;
                        }
                    }
                }
                Err(e) => {
                    let _ = app_handle.emit("engine-error", format!("Error reading engine output: {}", e));
                    break;
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn send_command(command: String, state: State<'_, SafeEngineState>) -> Result<(), String> {
    let mut engine = state.lock().map_err(|e| e.to_string())?;

    if let Some(writer) = &mut engine.writer {
        writeln!(writer, "{}", command).map_err(|e| e.to_string())?;
        writer.flush().map_err(|e| e.to_string())?;
    } else {
        return Err("Engine not started".to_string());
    }

    Ok(())
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(EngineState::new()))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            start_engine,
            send_command,
            greet
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
