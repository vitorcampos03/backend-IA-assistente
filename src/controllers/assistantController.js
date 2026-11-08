import * as aiService from '../services/aiService.js';
import {
  isValidUuid,
  getConversation,
  createConversation,
  addMessage,
  getRecentMessages,
} from '../services/historyService.js';

const HISTORY_LIMIT = 6; // quantas mensagens anteriores vão como contexto para a IA

// Fluxo comum aos três endpoints: valida a conversa, busca o contexto,
// chama a IA e, só se der certo, salva pergunta e resposta.
async function respondWithHistory(res, conversationId, titleHint, run) {
  if (conversationId) {
    if (!isValidUuid(conversationId)) {
      return res.status(400).json({ error: 'ID de conversa inválido.' });
    }
    const existing = await getConversation(conversationId);
    if (!existing) {
      return res.status(404).json({ error: 'Conversa não encontrada.' });
    }
  }

  const history = conversationId
    ? await getRecentMessages(conversationId, HISTORY_LIMIT)
    : [];

  const { result, userMessage } = await run(history);

  const id = conversationId || (await createConversation(titleHint)).id;
  await addMessage(id, 'user', userMessage);
  await addMessage(id, 'assistant', result);

  return res.status(200).json({ status: 'success', conversationId: id, result });
}

export async function handleAnalyze(req, res) {
  try {
    const { code, language, conversationId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'O código é obrigatório.' });
    }

    return await respondWithHistory(
      res,
      conversationId,
      `Análise de código (${language || 'sem linguagem'})`,
      (history) => aiService.analyzeCode(code, language, history)
    );
  } catch (error) {
    console.error('Erro na análise:', error);
    return res.status(500).json({ error: 'Erro ao processar análise.' });
  }
}

export async function handleExplain(req, res) {
  try {
    const { code, conversationId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'O código é obrigatório.' });
    }

    return await respondWithHistory(
      res,
      conversationId,
      'Explicação de código',
      (history) => aiService.explainCode(code, history)
    );
  } catch (error) {
    console.error('Erro na explicação:', error);
    return res.status(500).json({ error: 'Erro ao processar explicação.' });
  }
}

export async function handleAsk(req, res) {
  try {
    const { question, conversationId } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'A pergunta é obrigatória.' });
    }

    return await respondWithHistory(
      res,
      conversationId,
      question,
      (history) => aiService.askQuestion(question, history)
    );
  } catch (error) {
    console.error('Erro detalhado da API:', error);
    return res.status(500).json({ error: 'Erro ao processar dúvida.' });
  }
}