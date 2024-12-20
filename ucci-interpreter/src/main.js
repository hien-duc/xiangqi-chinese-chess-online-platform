const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;
const { listen } = window.__TAURI__.event;

let isEngineRunning = false;
let messageBuffer = "";
let messageTimeout = null;

// UI Elements
// const engineFileInput = document.getElementById("engine-file");
const loadEngineBtn = document.getElementById("load-engine");
const engineStatusText = document.getElementById("engine-status-text");
const commandForm = document.getElementById("command-form");
const commandInput = document.getElementById("command-input");
const logContent = document.getElementById("log-content");
const quickCommandBtns = document.querySelectorAll(".cmd-btn");

// Function to preserve all spaces including leading ones
function preserveSpaces(text) {
  // Special handling for board display
  if (text.includes('┌') || text.includes('└')) {
    return text.split('').map(char => {
      if (char === ' ') return '\u2007'; // Figure space for better alignment
      if (char === '·') return '\u00B7'; // Middle dot
      return char;
    }).join('');
  }
  return text.split('').map(char => char === ' ' ? '&nbsp;' : char).join('');
}

// Function to flush the message buffer
function flushMessageBuffer() {
  if (messageBuffer) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message-wrapper", "received");
    
    const messageContent = document.createElement("pre");
    messageContent.classList.add("message-content");
    
    // Add board-text class if it's a board display
    if (messageBuffer.includes('┌') || messageBuffer.includes('└')) {
      messageContent.classList.add("board-text");
    }
    
    messageContent.innerHTML = preserveSpaces(messageBuffer);
    
    messageDiv.appendChild(messageContent);
    logContent.appendChild(messageDiv);
    logContent.scrollTop = logContent.scrollHeight;
  }
  messageBuffer = "";
  messageTimeout = null;
}

// Add message to log
function addToLog(message, type = "sent") {
  if (type === "sent" || type === "error") {
    // Flush any pending received messages
    if (messageTimeout) {
      clearTimeout(messageTimeout);
      flushMessageBuffer();
    }

    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message-wrapper", type);
    
    const messageContent = document.createElement("pre");
    messageContent.classList.add("message-content");
    messageContent.innerHTML = preserveSpaces(message);
    
    messageDiv.appendChild(messageContent);
    logContent.appendChild(messageDiv);
    logContent.scrollTop = logContent.scrollHeight;
  } else {
    // Buffer received messages
    messageBuffer += message + "\n";
    
    // Clear any existing timeout
    if (messageTimeout) {
      clearTimeout(messageTimeout);
    }
    
    // Set a new timeout to flush the buffer
    messageTimeout = setTimeout(flushMessageBuffer, 50);
  }
}

// Update engine status
function updateEngineStatus(status) {
  engineStatusText.textContent = status;
  const container = document.querySelector('.container');
  
  if (status === "Loaded") {
    engineStatusText.style.color = "#22c55e";
    engineStatusText.classList.add('loaded');
    container.classList.add('engine-loaded');
    isEngineRunning = true;
  } else if (status === "Failed to load") {
    engineStatusText.style.color = "#dc2626";
    engineStatusText.classList.remove('loaded');
    container.classList.remove('engine-loaded');
    isEngineRunning = false;
  } else {
    engineStatusText.style.color = "#666";
    engineStatusText.classList.remove('loaded');
    container.classList.remove('engine-loaded');
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
