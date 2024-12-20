const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;

let engineProcess = null;
let enginePath = "";
let isEngineRunning = false;

// UI Elements
const engineFileInput = document.getElementById("engine-file");
const loadEngineBtn = document.getElementById("load-engine");
const engineStatusText = document.getElementById("engine-status-text");
const commandForm = document.getElementById("command-form");
const commandInput = document.getElementById("command-input");
const logContent = document.getElementById("log-content");
const quickCommandBtns = document.querySelectorAll(".cmd-btn");

// Add message to log
function addToLog(message, type = "sent") {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message", type);
  messageDiv.textContent = `${type === "sent" ? "> " : "< "}${message}`;
  logContent.appendChild(messageDiv);
  logContent.scrollTop = logContent.scrollHeight;
}

// Load engine
async function loadEngine() {
  try {
    // Use Tauri's dialog to get the file path
    const selectedPath = await open({
      multiple: false,
      filters: [{
        name: 'Engine',
        extensions: ['exe']
      }]
    });

    if (!selectedPath) {
      addToLog("No engine file selected", "received");
      return;
    }

    enginePath = selectedPath[0]; // Get the first element of the array
    await invoke("start_engine", { enginePath: enginePath });
    isEngineRunning = true;
    engineStatusText.textContent = "Loaded";
    engineStatusText.style.color = "#27ae60";

    // Send initial UCCI command
    await sendCommand("ucci");

    // Start reading engine output
    startEngineOutputLoop();
  } catch (error) {
    console.error("Failed to load engine:", error);
    addToLog(`Error loading engine: ${error}`, "received");
    engineStatusText.textContent = "Error";
    engineStatusText.style.color = "#e74c3c";
  }
}

// Send command to engine
async function sendCommand(command) {
  if (!isEngineRunning) {
    addToLog("Engine not loaded", "received");
    return;
  }

  try {
    addToLog(command);
    await invoke("send_command", { command });
  } catch (error) {
    console.error("Failed to send command:", error);
    addToLog(`Error sending command: ${error}`, "received");
  }
}

// Continuously read engine output
async function startEngineOutputLoop() {
  while (isEngineRunning) {
    try {
      const output = await invoke("read_engine_output");
      if (output && output.trim()) {
        addToLog(output.trim(), "received");
      }
    } catch (error) {
      console.error("Failed to read engine output:", error);
      isEngineRunning = false;
      engineStatusText.textContent = "Error";
      engineStatusText.style.color = "#e74c3c";
      break;
    }
    // Small delay to prevent excessive CPU usage
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

// Event Listeners
loadEngineBtn.addEventListener("click", loadEngine);

commandForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const command = commandInput.value.trim();
  if (command) {
    await sendCommand(command);
    commandInput.value = "";
  }
});

quickCommandBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const command = btn.dataset.cmd;
    sendCommand(command);
  });
});
