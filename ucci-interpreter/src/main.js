const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;

let engineProcess = null;
let enginePath = '';

// UI Elements
const engineFileInput = document.getElementById('engine-file');
const loadEngineBtn = document.getElementById('load-engine');
const engineStatusText = document.getElementById('engine-status-text');
const commandForm = document.getElementById('command-form');
const commandInput = document.getElementById('command-input');
const logContent = document.getElementById('log-content');
const quickCommandBtns = document.querySelectorAll('.cmd-btn');

// Add message to log
function addToLog(message, type = 'sent') {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', type);
    messageDiv.textContent = `${type === 'sent' ? '> ' : '< '}${message}`;
    logContent.appendChild(messageDiv);
    logContent.scrollTop = logContent.scrollHeight;
}

// Load engine
async function loadEngine() {
    try {
        if (!enginePath) {
            const selected = await open({
                multiple: false,
                filters: [{
                    name: 'Engine',
                    extensions: ['exe']
                }]
            });
            
            if (!selected) return;
            enginePath = selected;
        }

        engineProcess = await invoke('start_engine', { enginePath });
        engineStatusText.textContent = 'Loaded';
        engineStatusText.style.color = '#27ae60';
        
        // Start listening for engine output
        await invoke('start_engine_listener');
        
        // Send initial UCCI command
        await sendCommand('ucci');
    } catch (error) {
        console.error('Failed to load engine:', error);
        addToLog(`Error loading engine: ${error}`, 'received');
        engineStatusText.textContent = 'Error';
        engineStatusText.style.color = '#e74c3c';
    }
}

// Send command to engine
async function sendCommand(command) {
    if (!engineProcess) {
        addToLog('Engine not loaded', 'received');
        return;
    }

    try {
        addToLog(command);
        await invoke('send_command', { command });
    } catch (error) {
        console.error('Failed to send command:', error);
        addToLog(`Error sending command: ${error}`, 'received');
    }
}

// Event Listeners
loadEngineBtn.addEventListener('click', loadEngine);

commandForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const command = commandInput.value.trim();
    if (command) {
        await sendCommand(command);
        commandInput.value = '';
    }
});

quickCommandBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const command = btn.dataset.cmd;
        sendCommand(command);
    });
});

// Listen for engine output
async function setupEngineOutputListener() {
    try {
        await invoke('listen_for_engine_output', {}, (output) => {
            addToLog(output, 'received');
        });
    } catch (error) {
        console.error('Failed to setup engine output listener:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', setupEngineOutputListener);
