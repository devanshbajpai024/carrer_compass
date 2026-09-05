// Simple AI Chat component – vanilla JS
// Renders a minimal chat UI and forwards user queries to aiAssistant.answerQuestion
import { answerQuestion } from '../services/aiAssistant.js';
import { mockStudent } from '../data/mockStudent.js';
import { opportunities } from '../data/opportunities.js';

export function initChat(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return console.error('Chat container not found');

  // create UI elements
  const chatBox = document.createElement('div');
  chatBox.style.border = '1px solid #ccc';
  chatBox.style.padding = '10px';
  chatBox.style.maxHeight = '300px';
  chatBox.style.overflowY = 'auto';
  chatBox.style.marginBottom = '8px';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Ask a question...';
  input.style.width = '80%';
  const sendBtn = document.createElement('button');
  sendBtn.textContent = 'Send';

  container.appendChild(chatBox);
  container.appendChild(input);
  container.appendChild(sendBtn);

  const addMessage = (author, text) => {
    const msg = document.createElement('div');
    msg.style.margin = '4px 0';
    msg.innerHTML = <strong>:</strong> ;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const handleSend = () => {
    const query = input.value.trim();
    if (!query) return; // ignore empty
    addMessage('You', query);
    input.value = '';
    try {
      const response = answerQuestion(query, mockStudent, opportunities);
      addMessage('AI', response);
    } catch (e) {
      console.error(e);
      addMessage('AI', 'Sorry, something went wrong.');
    }
  };

  sendBtn.addEventListener('click', handleSend);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') handleSend(); });
}