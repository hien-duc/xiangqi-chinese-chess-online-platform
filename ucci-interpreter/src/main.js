const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;
const { listen } = window.__TAURI__.event;

let isEngineRunning = false;

// UI Elements
// const engineFileInput = document.getElementById("engine-file");
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

// Update engine status
function updateEngineStatus(status) {
  engineStatusText.textContent = status;
  if (status === "Loaded") {
    engineStatusText.style.color = "#27ae60";
    isEngineRunning = true;
  } else if (status === "Failed to load") {
    engineStatusText.style.color = "#c0392b";
    isEngineRunning = false;
  } else {
    engineStatusText.style.color = "#000";
    isEngineRunning = false;
  }
}

// Setup event listeners for engine output
async function setupEngineListeners() {
  // Listen for engine output
  await listen("engine-output", (event) => {
    addToLog(event.payload, "received");
  });

  // Listen for engine errors
  await listen("engine-error", (event) => {
    addToLog(`Error: ${event.payload}`, "error");
  });
}

// Load engine
async function loadEngine() {
  if (isEngineRunning) {
    console.log("Engine is already running");
    return;
  }

  try {
    console.log("Opening file dialog...");
    const result = await open({
      multiple: false,
      filters: [
        {
          name: "Engine",
          extensions: ["exe"],
        },
      ],
    });

    console.log("Dialog result:", result);
    if (!result) {
      console.log("No file selected");
      addToLog("No engine file selected", "received");
      return;
    }

    const enginePath = result;
    console.log("Starting engine with path:", enginePath);
    
    await invoke("start_engine", { enginePath });
    console.log("Engine started successfully");
    updateEngineStatus("Loaded");
    
    // Send initial UCCI command
    await sendCommand("ucci");
  } catch (error) {
    console.error("Error loading engine:", error);
    updateEngineStatus("Failed to load");
    addToLog(`Error: ${error}`, "received");
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
    console.log("Sending command:", command);
    await invoke("send_command", { command });
  } catch (error) {
    console.error("Failed to send command:", error);
    addToLog(`Error sending command: ${error}`, "received");
  }
}

// Setup event listeners
setupEngineListeners().catch(console.error);

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
  btn.addEventListener("click", async () => {
    const command = btn.dataset.cmd;
    if (command) {
      await sendCommand(command);
    }
  });
});
