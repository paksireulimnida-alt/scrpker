let selectedImageData = null;
let chatHistory = [];

// DOM Elements
const chatThread = document.getElementById('chatThread');
const promptInput = document.getElementById('prompt');
const imageInput = document.getElementById('imageInput');
const sendBtn = document.getElementById('sendBtn');
const modelSelect = document.getElementById('modelSelect');
const apiKeyInput = document.getElementById('apiKey');

// Auto-resize textarea
promptInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Image Handling
imageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            selectedImageData = event.target.result;
            document.getElementById('imagePreview').src = selectedImageData;
            document.getElementById('imagePreviewContainer').classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('removeImage').addEventListener('click', () => {
    selectedImageData = null;
    imageInput.value = '';
    document.getElementById('imagePreviewContainer').classList.add('hidden');
});

// Message Rendering
function appendMessage(role, content, imageData = null, reasoning = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}-message`;

    let html = '';
    if (imageData) {
        html += `<img src="${imageData}" class="chat-image">`;
    }
    html += `<div class="bubble">${content}</div>`;

    if (reasoning) {
        html += `<div class="reasoning"><strong>Thinking:</strong>\n${reasoning}</div>`;
    }

    msgDiv.innerHTML = html;
    chatThread.appendChild(msgDiv);
    chatThread.scrollTop = chatThread.scrollHeight;
}

// Send Message
async function sendMessage() {
    const prompt = promptInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const model = modelSelect.value;

    if (!prompt && !selectedImageData) return;
    if (!apiKey) { alert('API Key required'); return; }

    // Add user message to UI
    appendMessage('user', prompt, selectedImageData);

    // Prepare for History
    if (selectedImageData) {
        const base64Content = selectedImageData.split(',')[1];
        const mimeType = selectedImageData.split(';')[0].split(':')[1];
        chatHistory.push({
            role: "user",
            content: [
                { type: "text", text: prompt || "Analyze this image" },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Content}` } }
            ]
        });
    } else {
        chatHistory.push({ role: "user", content: prompt });
    }

    // Reset Inputs
    promptInput.value = '';
    promptInput.style.height = 'auto';
    const currentImage = selectedImageData; // Store for preview logic if needed
    selectedImageData = null;
    imageInput.value = '';
    document.getElementById('imagePreviewContainer').classList.add('hidden');

    // UI Loading
    document.getElementById('sendIcon').classList.add('hidden');
    sendBtn.querySelector('.loader-dots').classList.remove('hidden');
    sendBtn.disabled = true;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                "model": model,
                "messages": chatHistory,
                "include_reasoning": true
            })
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const choice = data.choices[0];
        const aiMessage = choice.message;

        let reasoning = aiMessage.reasoning || choice.reasoning || null;

        // Add AI message to UI & History
        appendMessage('ai', aiMessage.content, null, reasoning);
        chatHistory.push({ role: "assistant", content: aiMessage.content });

    } catch (error) {
        console.error(error);
        appendMessage('ai', "Error: " + error.message);
    } finally {
        document.getElementById('sendIcon').classList.remove('hidden');
        sendBtn.querySelector('.loader-dots').classList.add('hidden');
        sendBtn.disabled = false;
    }
}

sendBtn.addEventListener('click', sendMessage);
promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

document.getElementById('clearChat').addEventListener('click', () => {
    chatHistory = [];
    chatThread.innerHTML = '<div class="message ai-message"><div class="bubble">Chat cleared. How can I help?</div></div>';
});

// Usage Tracking
async function checkUsage() {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) return;

    try {
        const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
            headers: {
                "Authorization": `Bearer ${apiKey}`
            }
        });
        const data = await response.json();

        if (data.data) {
            const usage = data.data.usage || 0;
            const limit = data.data.limit || 0;
            const remaining = limit ? (limit - usage).toFixed(4) : "Unlimited";

            document.getElementById('usageValue').textContent = `Credits: $${usage.toFixed(4)} / $${limit || '∞'}`;
            document.getElementById('usageInfo').title = `Usage: $${usage.toFixed(6)}\nLimit: $${limit ? '$' + limit : 'None'}`;
        }
    } catch (e) {
        console.error("Usage check failed", e);
        document.getElementById('usageValue').textContent = "Usage check failed";
    }
}

// Initial check and on refresh click
checkUsage();
document.getElementById('usageInfo').addEventListener('click', checkUsage);

// Refresh usage after each message
const originalSendMessage = sendMessage;
sendMessage = async function () {
    await originalSendMessage();
    setTimeout(checkUsage, 1000); // Small delay to let OpenRouter update
};
