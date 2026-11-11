const $ = (id) => document.getElementById(id);
const els = {
  list: $('list'), messages: $('messages'), thread: $('thread'),
  input: $('input'), lang: $('lang'), send: $('btnSend'), newBtn: $('btnNew'),
};
let conversationId = null;

const PLACEHOLDERS = {
  ask: 'Escreva sua dúvida sobre tecnologia…',
  analyze: 'Cole aqui o código que você quer analisar…',
  explain: 'Cole aqui o código que você quer entender…',
};
const ENDPOINTS = { ask: 'ask', analyze: 'analyze', explain: 'explain' };

const getMode = () => document.querySelector('input[name="mode"]:checked').value;

function md(text) {
  const html = marked.parse(text || '', { breaks: true });
  return DOMPurify.sanitize(html);
}

function scrollDown() { els.thread.scrollTop = els.thread.scrollHeight; }

function addMessage(role, content, extraClass = '') {
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'user' : ''} ${extraClass}`.trim();
  const who = document.createElement('div');
  who.className = 'who';
  who.textContent = role === 'user' ? 'Você' : 'Assistente';
  const body = document.createElement('div');
  body.className = 'md';
  if (extraClass) body.textContent = content; else body.innerHTML = md(content);
  div.append(who, body);
  els.messages.appendChild(div);
  scrollDown();
  return div;
}

function showWelcome() {
  els.messages.innerHTML = `<div class="welcome"><h2>Como posso ajudar?</h2>
    <p>Faça uma pergunta ou cole um código para analisar ou explicar. As conversas ficam salvas ao lado.</p></div>`;
}

async function api(path, options) {
  const res = await fetch(path, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || data.message || 'Erro inesperado.');
    err.status = res.status;
    throw err;
  }
  return data;
}

/* ---------- Lista de conversas ---------- */
function fmtDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

async function loadList() {
  try {
    const { conversations } = await api('/api/history');
    els.list.innerHTML = '';
    if (!conversations.length) {
      els.list.innerHTML = '<li class="empty">Nenhuma conversa ainda.</li>';
      return;
    }
    for (const c of conversations) {
      const li = document.createElement('li');
      li.className = 'item' + (c.id === conversationId ? ' active' : '');
      li.innerHTML = '<div class="item-body"><div class="item-title"></div><div class="item-date"></div></div>' +
        '<button class="item-del" type="button" title="Apagar conversa" aria-label="Apagar conversa">Apagar</button>';
      li.querySelector('.item-title').textContent = c.title || 'Sem título';
      li.querySelector('.item-date').textContent = fmtDate(c.created_at);
      li.addEventListener('click', () => openConversation(c.id));
      li.querySelector('.item-del').addEventListener('click', (e) => { e.stopPropagation(); removeConversation(c.id); });
      els.list.appendChild(li);
    }
  } catch (e) {
    els.list.innerHTML = '<li class="empty">Não foi possível carregar as conversas.</li>';
  }
}

async function openConversation(id) {
  try {
    const { messages } = await api(`/api/history/${id}`);
    conversationId = id;
    els.messages.innerHTML = '';
    messages.forEach((m) => addMessage(m.role, m.content));
    await loadList();
  } catch (e) {
    addMessage('assistant', e.message, 'error');
  }
}

async function removeConversation(id) {
  if (!confirm('Apagar esta conversa? Essa ação não pode ser desfeita.')) return;
  try {
    await api(`/api/history/${id}`, { method: 'DELETE' });
    if (id === conversationId) newConversation();
    await loadList();
  } catch (e) {
    alert(e.message);
  }
}

function newConversation() {
  conversationId = null;
  showWelcome();
  els.input.value = '';
  els.input.focus();
  loadList();
}

/* ---------- Envio ---------- */
async function send() {
  const text = els.input.value.trim();
  if (!text) return;

  const mode = getMode();
  const body = mode === 'ask'
    ? { question: text }
    : { code: text, ...(mode === 'analyze' && els.lang.value ? { language: els.lang.value } : {}) };
  if (conversationId) body.conversationId = conversationId;

  if (!els.messages.querySelector('.msg')) els.messages.innerHTML = '';
  const label = { ask: '', analyze: 'Analisar código:\n\n', explain: 'Explicar código:\n\n' }[mode];
  addMessage('user', mode === 'ask' ? text : `${label}\`\`\`\n${text}\n\`\`\``);
  const pending = addMessage('assistant', 'Pensando…', 'loading');

  els.send.disabled = true;
  els.input.value = '';
  try {
    const data = await api(`/api/assistant/${ENDPOINTS[mode]}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    conversationId = data.conversationId;
    pending.remove();
    addMessage('assistant', data.result);
    loadList();
  } catch (e) {
    pending.remove();
    const msg = e.status === 429
      ? 'Limite de uso da IA atingido. Aguarde um pouco e tente novamente.'
      : e.message;
    addMessage('assistant', msg, 'error');
    els.input.value = text; // devolve o texto para o usuário não perder
  } finally {
    els.send.disabled = false;
    els.input.focus();
  }
}

/* ---------- Eventos ---------- */
document.querySelectorAll('input[name="mode"]').forEach((r) =>
  r.addEventListener('change', () => {
    const mode = getMode();
    els.input.placeholder = PLACEHOLDERS[mode];
    els.input.classList.toggle('code', mode !== 'ask');
    els.lang.hidden = mode !== 'analyze';
  })
);
els.send.addEventListener('click', send);
els.newBtn.addEventListener('click', newConversation);
els.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); }
});

showWelcome();
loadList();