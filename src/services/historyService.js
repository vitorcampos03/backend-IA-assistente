import pool from "../config/db.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id) {
  return typeof id === "string" && UUID_REGEX.test(id);
}

// Cria uma conversa nova. O título são as primeiras palavras da pergunta.
export async function createConversation(firstMessage = "") {
  const title = firstMessage.trim().slice(0, 50) || "Nova conversa";
  const { rows } = await pool.query(
    "INSERT INTO conversations (title) VALUES ($1) RETURNING id, title, created_at",
    [title]
  );
  return rows[0];
}

// Retorna a conversa ou null se não existir.
export async function getConversation(conversationId) {
  if (!isValidUuid(conversationId)) return null;
  const { rows } = await pool.query(
    "SELECT id, title, created_at FROM conversations WHERE id = $1",
    [conversationId]
  );
  return rows[0] || null;
}

// Lista as conversas, da mais recente para a mais antiga.
export async function listConversations(limit = 50) {
  const { rows } = await pool.query(
    "SELECT id, title, created_at FROM conversations ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
  return rows;
}

// Salva uma mensagem ('user' ou 'assistant').
export async function addMessage(conversationId, role, content) {
  const { rows } = await pool.query(
    `INSERT INTO messages (conversation_id, role, content)
     VALUES ($1, $2, $3)
     RETURNING id, role, content, created_at`,
    [conversationId, role, content]
  );
  return rows[0];
}

// Todas as mensagens da conversa, em ordem cronológica (para exibir o histórico).
export async function getMessages(conversationId) {
  const { rows } = await pool.query(
    `SELECT id, role, content, created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC, id ASC`,
    [conversationId]
  );
  return rows;
}

// Só as últimas N mensagens, em ordem cronológica (para mandar como contexto à IA).
export async function getRecentMessages(conversationId, limit = 8) {
  const { rows } = await pool.query(
    `SELECT role, content FROM (
       SELECT id, role, content, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT $2
     ) recentes
     ORDER BY created_at ASC, id ASC`,
    [conversationId, limit]
  );
  return rows;
}

// Apaga a conversa (as mensagens vão junto, por causa do ON DELETE CASCADE).
export async function deleteConversation(conversationId) {
  const { rowCount } = await pool.query(
    "DELETE FROM conversations WHERE id = $1",
    [conversationId]
  );
  return rowCount > 0;
}