// ═══════════════════════════════════════════════
//   PEACE VISION — AI Features
//   1. Soul Guide Chat (Claude API powered)
//   2. Healing Path Quiz (AI recommendation)
// ═══════════════════════════════════════════════

// ════════════════════════════
//   SOUL GUIDE AI CHAT
// ════════════════════════════

let chatOpen = false;
let chatHistory = [];

const SYSTEM_PROMPT = `You are "Soul Guide", the compassionate AI assistant for Peace Vision — a soul-led healing centre. 

Your personality: warm, empathetic, gentle, spiritually aware, non-judgmental. Use calming language. Speak from the heart.

Peace Vision services:
- Emotional Healing (Trauma, Inner Child, Shadow Work) — for processing past wounds
- Energy Healing (Reiki, Quantum, Sound Healing) — for energy blockages
- Holistic Remedies (Bach Flowers, Wellness) — natural plant-based healing
- Spiritual Guidance (Tarot, Soul Reading, Counselling) — soul purpose
- Workshops & Groups — community healing
- Meditation & Mindfulness — breathwork, visualization

Pricing:
- Guidance Path: $97/month — 2x 1:1 sessions, weekly group circle
- Healing Path: $197/month — 4x 1:1 sessions, daily group circle, full assessment

Your role: 
1. Listen deeply and empathetically to the person's struggles
2. Ask gentle clarifying questions
3. Recommend the most suitable service based on their needs
4. Encourage them to book a free Heart Connection Call
5. Never claim to replace therapy or medical treatment
6. Keep responses concise (2-4 sentences max), warm, and supportive

Always end with an invitation to connect, like: "Would you like to book a free Heart Connection Call?" or "I'd love to guide you to the right service."`;

function toggleChat() {
  chatOpen = !chatOpen;
  document.getElementById('aiChatPanel').classList.toggle('open', chatOpen);
  if (chatOpen) {
    setTimeout(() => document.getElementById('chatInput').focus(), 300);
  }
}
window.toggleChat = toggleChat;

function getTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function addMessage(role, text) {
  const messages = document.getElementById('chatMessages');

  // Remove typing indicator if present
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();

  const msg = document.createElement('div');
  msg.className = `chat-msg ${role}`;
  msg.innerHTML = `
    ${role === 'ai' ? '<div class="chat-avatar-sm">🌿</div>' : ''}
    <div>
      <div class="msg-bubble">${text}</div>
    </div>
    <span class="msg-time">${getTime()}</span>
  `;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;

  // Add to history
  chatHistory.push({ role: role === 'ai' ? 'assistant' : 'user', content: text });
}

function showTyping() {
  const messages = document.getElementById('chatMessages');
  const typing = document.createElement('div');
  typing.id = 'typingIndicator';
  typing.className = 'chat-msg ai';
  typing.innerHTML = `
    <div class="chat-avatar-sm">🌿</div>
    <div class="msg-bubble" style="background:rgba(58,184,204,0.1);border:1px solid rgba(58,184,204,0.15);">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  messages.appendChild(typing);
  messages.scrollTop = messages.scrollHeight;
}

async function sendChat() {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  document.getElementById('chatQuick').style.display = 'none';

  // Add to history
  
  
  addMessage('user', text);
  showTyping();

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: chatHistory.slice(-10),
        system: SYSTEM_PROMPT
      })
    });

    const data = await response.json();
    const reply = data.content?.[0]?.text || "I'm here with you. Could you tell me a little more about what you're experiencing?";
    chatHistory.push({ role: 'assistant', content: reply });
    addMessage('ai', reply);
  } catch (err) {
    const fallbacks = [
      "Thank you for sharing that with me. 🙏 It takes courage to reach out. Would you like to book a free Heart Connection Call?",
      "I hear you, and you're not alone on this journey. 🌿 Shall we find the right service for you?",
      "That resonates deeply. A free call with our team would help us understand how to best support you. Would that feel right?",
    ];
    addMessage('ai', fallbacks[Math.floor(Math.random() * fallbacks.length)]);
  }
}

function sendQuick(text) {
  document.getElementById('chatInput').value = text;
  sendChat();
}

window.sendChat = sendChat;
window.sendQuick = sendQuick;


// ════════════════════════════
//   AI HEALING QUIZ
// ════════════════════════════

const quizData = [
  {
    question: "Where do you feel most called to begin your healing journey?",
    options: [
      { text: "Processing emotions from my past", value: "emotional" },
      { text: "Clearing heavy or stuck energy from my body", value: "energy" },
      { text: "Understanding my soul's deeper purpose", value: "spiritual" },
      { text: "Finding calm and stillness in daily life", value: "mindfulness" },
    ]
  },
  {
    question: "How would you describe your current inner state?",
    options: [
      { text: "Overwhelmed, anxious, or emotionally heavy", value: "emotional" },
      { text: "Drained, blocked, or physically unwell", value: "energy" },
      { text: "Searching, lost, or spiritually empty", value: "spiritual" },
      { text: "Scattered, restless, or struggling to focus", value: "mindfulness" },
    ]
  },
  {
    question: "What outcome feels most important to you right now?",
    options: [
      { text: "Healing old wounds and breaking old patterns", value: "emotional" },
      { text: "Feeling lighter, clearer, and more vital", value: "energy" },
      { text: "Connecting to my higher self and life direction", value: "spiritual" },
      { text: "A daily practice that creates peace and presence", value: "mindfulness" },
    ]
  },
  {
    question: "How do you prefer to begin your healing?",
    options: [
      { text: "One-on-one deep dive with a practitioner", value: "individual" },
      { text: "Gentle, gradual — go at my own pace", value: "guidance" },
      { text: "Immersive, committed transformation", value: "healing" },
      { text: "Group setting with community support", value: "group" },
    ]
  }
];

const recommendations = {
  emotional: {
    icon: "🌸",
    title: "Emotional Healing Journey",
    service: "Emotional Healing — Trauma & Inner Child Work",
    desc: "Your soul is ready to release what no longer serves you. Our emotional healing sessions will gently guide you through processing past wounds and creating new patterns of love and freedom.",
    path: "Healing Path"
  },
  energy: {
    icon: "⚡",
    title: "Energy Restoration Path",
    service: "Energy Healing — Reiki & Sound Healing",
    desc: "Your body and energy field are calling for clearing and renewal. Our energy healing work will help you release blockages, restore flow, and reconnect with your natural vitality.",
    path: "Guidance Path"
  },
  spiritual: {
    icon: "🔮",
    title: "Spiritual Awakening Path",
    service: "Spiritual Guidance — Soul Reading & Counselling",
    desc: "Your soul is seeking deeper meaning and direction. Our spiritual guidance sessions will help you reconnect with your inner compass, understand your soul's path, and move forward with clarity.",
    path: "Healing Path"
  },
  mindfulness: {
    icon: "🧘",
    title: "Mindfulness & Presence Path",
    service: "Meditation & Mindfulness — Breathwork & Visualization",
    desc: "Your mind is craving stillness and your nervous system needs restoration. Our mindfulness practices will create a sanctuary of calm within you that you carry everywhere.",
    path: "Guidance Path"
  },
  group: {
    icon: "🫂",
    title: "Community Healing Path",
    service: "Workshops & Group Healing Circles",
    desc: "You are ready to heal in the beautiful container of community. Our group circles create deep transformation through shared experience, witnessed healing, and collective wisdom.",
    path: "Guidance Path"
  }
};

let quizAnswers = [];
let currentQ = 0;

function renderQuiz() {
  const content = document.getElementById('quizContent');
  if (!content) return;

  if (currentQ < quizData.length) {
    const q = quizData[currentQ];
    const progress = ((currentQ) / quizData.length) * 100;
    document.getElementById('quizProgress').style.width = progress + '%';

    content.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-step-label">Question ${currentQ + 1} of ${quizData.length}</div>
        <div class="quiz-question">${q.question}</div>
      </div>
      <div class="quiz-body">
        <div class="quiz-options" id="quizOptions">
          ${q.options.map((opt, i) => `
            <button class="quiz-option" onclick="selectOption('${opt.value}', this)">
              <div class="option-dot"></div>
              ${opt.text}
            </button>
          `).join('')}
        </div>
        <div class="quiz-nav">
          <button class="btn-ghost" onclick="quizBack()" style="opacity:${currentQ === 0 ? 0.3 : 1};pointer-events:${currentQ === 0 ? 'none' : 'all'};">← Back</button>
          <button class="btn-primary" id="quizNext" onclick="quizNext()" style="opacity:0.3;pointer-events:none;">Next →</button>
        </div>
      </div>
    `;
  }
}

function selectOption(value, btn) {
  document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
  btn.classList.add('selected');
  btn.querySelector('.option-dot').textContent = '✓';

  quizAnswers[currentQ] = value;

  const nextBtn = document.getElementById('quizNext');
  if (nextBtn) {
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'all';
    if (currentQ === quizData.length - 1) {
      nextBtn.textContent = 'See My Results ✨';
    }
  }
}

function quizNext() {
  if (!quizAnswers[currentQ]) return;

  if (currentQ < quizData.length - 1) {
    currentQ++;
    renderQuiz();
  } else {
    showQuizResult();
  }
}

function quizBack() {
  if (currentQ > 0) {
    currentQ--;
    renderQuiz();
  }
}

async function showQuizResult() {
  document.getElementById('quizProgress').style.width = '100%';

  const content = document.getElementById('quizContent');
  content.innerHTML = `
    <div class="quiz-header" style="border-bottom:none;padding-bottom:0;">
      <div class="quiz-step-label">✨ Analyzing your soul's needs...</div>
      <div class="quiz-question" style="opacity:0.5;">Our AI is personalizing your healing path</div>
    </div>
    <div class="quiz-body" style="text-align:center;padding-top:2rem;">
      <div class="typing-indicator" style="justify-content:center;margin-bottom:1rem;">
        <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
      </div>
    </div>
  `;

  // Count answer frequencies
  const counts = {};
  quizAnswers.forEach(a => counts[a] = (counts[a] || 0) + 1);

  // Get AI recommendation via Claude API
  let aiInsight = '';
  try {
    const answerSummary = quizAnswers.join(', ');
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `You are a compassionate healing guide at Peace Vision. A person completed a healing quiz with these answers: ${answerSummary}. Write 2 warm, personalized sentences (max 60 words) explaining why their specific healing path is perfect for them right now. Be specific to their answers. Sound like a caring spiritual guide, not a generic AI.`
        }]
      })
    });
    const data = await response.json();
    aiInsight = data.content?.[0]?.text || '';
  } catch (e) {
    aiInsight = '';
  }

  // Determine best recommendation
  const topAnswer = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  const rec = recommendations[topAnswer] || recommendations.emotional;

  // Final delay for UX
  await new Promise(r => setTimeout(r, 800));

  content.innerHTML = `
    <div class="quiz-header" style="border-bottom:none;">
      <div class="quiz-step-label">✨ Your Personalized Healing Path</div>
    </div>
    <div class="quiz-body">
      <div class="quiz-result show">
        <div class="quiz-result-icon">${rec.icon}</div>
        <h3>${rec.title}</h3>
        <div class="recommendation">
          <h4>Recommended: ${rec.service}</h4>
          <p>${rec.desc}</p>
          ${aiInsight ? `<p style="margin-top:0.8rem;border-top:1px solid rgba(58,184,204,0.1);padding-top:0.8rem;font-style:italic;color:rgba(248,244,239,0.5);">${aiInsight}</p>` : ''}
        </div>
        <p style="color:rgba(248,244,239,0.5);font-size:0.88rem;margin-bottom:1.5rem;">We recommend starting with the <strong style="color:var(--rose-light);">${rec.path}</strong></p>
        <a href="#contact" class="btn-primary" style="display:inline-flex;">Book Your Free Call →</a>
        <button class="quiz-restart" onclick="restartQuiz()">↺ Retake Quiz</button>
      </div>
    </div>
  `;
}

function restartQuiz() {
  quizAnswers = [];
  currentQ = 0;
  document.getElementById('quizProgress').style.width = '0%';
  renderQuiz();
}

window.selectOption = selectOption;
window.quizNext = quizNext;
window.quizBack = quizBack;
window.restartQuiz = restartQuiz;

// ─── INIT ───
document.addEventListener('DOMContentLoaded', () => {
  renderQuiz();
});