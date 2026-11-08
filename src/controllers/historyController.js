import {
  isValidUuid,
  getConversation,
  listConversations,
  getMessages,
  deleteConversation,
} from "../services/historyService.js";

export async function handleListConversations(req, res) {
  try {
    const conversations = await listConversations();
    res.json({ status: "success", conversations });
  } catch (err) {
    console.error("Erro ao listar conversas:", err.message);
    res.status(500).json({ status: "error", message: "Erro ao listar conversas." });
  }
}

export async function handleGetConversation(req, res) {
  try {
    const { conversationId } = req.params;

    if (!isValidUuid(conversationId)) {
      return res.status(400).json({ status: "error", message: "ID de conversa inválido." });
    }

    const conversation = await getConversation(conversationId);
    if (!conversation) {
      return res.status(404).json({ status: "error", message: "Conversa não encontrada." });
    }

    const messages = await getMessages(conversationId);
    res.json({ status: "success", conversation, messages });
  } catch (err) {
    console.error("Erro ao buscar conversa:", err.message);
    res.status(500).json({ status: "error", message: "Erro ao buscar conversa." });
  }
}

export async function handleDeleteConversation(req, res) {
  try {
    const { conversationId } = req.params;

    if (!isValidUuid(conversationId)) {
      return res.status(400).json({ status: "error", message: "ID de conversa inválido." });
    }

    const deleted = await deleteConversation(conversationId);
    if (!deleted) {
      return res.status(404).json({ status: "error", message: "Conversa não encontrada." });
    }

    res.json({ status: "success", message: "Conversa apagada." });
  } catch (err) {
    console.error("Erro ao apagar conversa:", err.message);
    res.status(500).json({ status: "error", message: "Erro ao apagar conversa." });
  }
}