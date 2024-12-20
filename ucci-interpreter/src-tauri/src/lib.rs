// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use tauri::State;

// Structure to hold the engine process
struct EngineState {
    process: Option<Child>,
    reader: Option<BufReader<std::process::ChildStdout>>,
    writer: Option<std::process::ChildStdin>,
}

impl EngineState {
    fn new() -> Self {
        Self {
            process: None,
            reader: None,
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
) -> Result<(), String> {
    let mut engine = state.lock().map_err(|e| e.to_string())?;

    // Start the engine process
    let mut child = Command::new(engine_path)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    // Get stdin and stdout handles
    let writer = child.stdin.take().ok_or("Failed to get stdin")?;
    let reader = BufReader::new(child.stdout.take().ok_or("Failed to get stdout")?);

    // Store the handles
    engine.writer = Some(writer);
    engine.reader = Some(reader);
    engine.process = Some(child);

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
async fn read_engine_output(state: State<'_, SafeEngineState>) -> Result<String, String> {
    let mut engine = state.lock().map_err(|e| e.to_string())?;

    if let Some(reader) = &mut engine.reader {
        let mut line = String::new();
        reader.read_line(&mut line).map_err(|e| e.to_string())?;
        Ok(line)
    } else {
        Err("Engine not started".to_string())
    }
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
            read_engine_output,
            greet
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
