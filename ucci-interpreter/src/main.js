// Import Tauri APIs
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { Command } from "@tauri-apps/api/shell";

// UI Elements
const engineFileInput = document.getElementById("engine-file");
const loadEngineBtn = document.getElementById("load-engine");
const unloadEngineBtn = document.getElementById("unload-engine");
const engineStatus = document.getElementById("engine-status");
const engineOutput = document.getElementById("engine-output");
const commandInput = document.getElementById("command-input");
const sendCommandBtn = document.getElementById("send-command");
const apiStatusIndicator = document.getElementById("api-status-indicator");
const quickCommandBtns = document.querySelectorAll(".command-btn");

// State
let engineProcess = null;
let isEngineLoaded = false;
let apiConnected = false;

// API Configuration
const API_URL = "http://localhost:3000"; // Update with your API endpoint

// Helper Functions
function updateEngineStatus(status, isError = false) {
  engineStatus.textContent = `Engine Status: ${status}`;
  engineStatus.style.color = isError ? "var(--error-color)" : "var(--terminal-text)";
}

function appendOutput(text, isError = false) {
  const line = document.createElement("div");
  line.textContent = text;
  line.style.color = isError ? "var(--error-color)" : "var(--terminal-text)";
  engineOutput.appendChild(line);
  engineOutput.scrollTop = engineOutput.scrollHeight;
}

async function checkApiConnection() {
  try {
    const response = await fetch(`${API_URL}/health`);
    apiConnected = response.ok;
    apiStatusIndicator.textContent = apiConnected ? "Connected" : "Disconnected";
    apiStatusIndicator.className = apiConnected ? "connected" : "disconnected";
  } catch (error) {
    apiConnected = false;
    apiStatusIndicator.textContent = "Disconnected";
    apiStatusIndicator.className = "disconnected";
  }
}

// UCCI Protocol Implementation
async function sendUcciCommand(command) {
  if (!isEngineLoaded) {
    appendOutput("Error: Engine not loaded", true);
    return;
  }

  try {
    // Send command to engine process
    await engineProcess.write(`${command}\n`);
    appendOutput(`> ${command}`);

    // If command requires API interaction
    if (command.startsWith("position") || command.startsWith("go")) {
      await handleApiInteraction(command);
    }
  } catch (error) {
    appendOutput(`Error: ${error.message}`, true);
  }
}

async function handleApiInteraction(command) {
  if (!apiConnected) {
    appendOutput("Warning: API not connected", true);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/engine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command })
    });

    if (!response.ok) throw new Error("API request failed");
    
    const data = await response.json();
    appendOutput(`API Response: ${JSON.stringify(data)}`);
  } catch (error) {
    appendOutput(`API Error: ${error.message}`, true);
  }
}

// Event Listeners
loadEngineBtn.addEventListener("click", async () => {
  try {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Engine", extensions: ["exe"] }]
    });

    if (!selected) return;

    engineProcess = new Command(selected);
    
    // Set up process listeners
    engineProcess.stdout.on("data", line => appendOutput(line));
    engineProcess.stderr.on("data", line => appendOutput(line, true));
    
    await engineProcess.spawn();
    isEngineLoaded = true;
    updateEngineStatus("Loaded");
    loadEngineBtn.disabled = true;
    unloadEngineBtn.disabled = false;
    sendCommandBtn.disabled = false;
    
    // Initialize UCCI protocol
    await sendUcciCommand("ucci");
  } catch (error) {
    appendOutput(`Error loading engine: ${error.message}`, true);
  }
});

unloadEngineBtn.addEventListener("click", async () => {
  if (engineProcess) {
    await sendUcciCommand("quit");
    await engineProcess.kill();
    engineProcess = null;
    isEngineLoaded = false;
    updateEngineStatus("Not Loaded");
    loadEngineBtn.disabled = false;
    unloadEngineBtn.disabled = true;
    sendCommandBtn.disabled = true;
  }
});

sendCommandBtn.addEventListener("click", () => {
  const command = commandInput.value.trim();
  if (command) {
    sendUcciCommand(command);
    commandInput.value = "";
  }
});

commandInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendCommandBtn.click();
  }
});

quickCommandBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const command = btn.dataset.command;
    if (command) {
      sendUcciCommand(command);
    }
  });
});

// Initialize
checkApiConnection();
setInterval(checkApiConnection, 30000); // Check API connection every 30 seconds
