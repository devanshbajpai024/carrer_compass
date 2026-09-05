/**
 * aiChat.js — Floating AI chat panel component.
 * Requires: AIAssistant service, marked.js (for markdown rendering, optional).
 */

const AIChat = (() => {
  let isOpen = false;
  let profile = null;
  let initialized = false;

  const WELCOME_MSG = `Hey! 👋 I'm **Opportunity AI** — your personal career assistant.\n\nAsk me anything:\n- "Find ML internships for me"\n- "What skills am I missing?"\n- "Which opportunity to apply first?"\n\nType **help** to see all I can do.`;

  function init(studentProfile) {
    if (initialized) { profile = studentProfile; return; }
    profile = studentProfile;
    initialized = true;

    injectHTML();
    bindEvents();
    addMessage('assistant', WELCOME_MSG);
  }

  function injectHTML() {
    // Create toggle button
    const toggle = document.createElement('button');
    toggle.id = 'ai-chat-toggle';
    toggle.title = 'Opportunity AI';
    toggle.innerHTML = '🤖';
    toggle.setAttribute('aria-label', 'Open AI Assistant');
    document.body.appendChild(toggle);

    // Create chat window
    const win = document.createElement('div');
    win.id = 'ai-chat-window';
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', 'Opportunity AI Chat');
    win.innerHTML = `
      <div class="chat-header">
        <div class="chat-header-avatar">🤖</div>
        <div class="chat-header-info">
          <div class="chat-name">Opportunity AI</div>
          <div class="chat-status">
            <span class="chat-status-dot"></span>
            <span>AI-Powered · Always Online</span>
          </div>
        </div>
        <button class="chat-close-btn" id="ai-chat-close" aria-label="Close chat">✕</button>
      </div>
      <div class="chat-messages" id="chat-messages" role="log" aria-live="polite"></div>
      <div class="chat-input-area">
        <input class="chat-input" id="chat-input" type="text"
          placeholder="Ask anything about opportunities..."
          aria-label="Chat message input" maxlength="300" />
        <button class="chat-send-btn" id="chat-send" aria-label="Send message">➤</button>
      </div>
    `;
    document.body.appendChild(win);
  }

  function bindEvents() {
    document.getElementById('ai-chat-toggle').addEventListener('click', toggle);
    document.getElementById('ai-chat-close').addEventListener('click', close);

    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function toggle() {
    isOpen ? close() : open();
  }

  function open() {
    isOpen = true;
    document.getElementById('ai-chat-window').classList.add('open');
    document.getElementById('chat-input').focus();
  }

  function close() {
    isOpen = false;
    document.getElementById('ai-chat-window').classList.remove('open');
  }

  async function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    addMessage('user', msg);

    const typing = showTyping();

    try {
      const response = await AIAssistant.generateResponse(msg, profile);
      typing.remove();
      addMessage('assistant', response);
    } catch (err) {
      typing.remove();
      addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    }
  }

  function addMessage(role, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = `chat-message ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = renderMarkdown(text);

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
  }

  function showTyping() {
    const container = document.getElementById('chat-messages');
    const wrapper = document.createElement('div');
    wrapper.className = 'chat-message assistant';
    wrapper.innerHTML = `
      <div class="chat-typing">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>`;
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return wrapper;
  }

  // Simple markdown renderer (bold, italic, lists, newlines)
  function renderMarkdown(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n/g, '<br>');
  }

  function updateProfile(newProfile) {
    profile = newProfile;
  }

  return { init, updateProfile, open };
})();
