import * as aiService from '../services/aiService.js';

export async function handleAnalyze(req, res) {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'O código é obrigatório.' });
    }

    const result = await aiService.analyzeCode(code, language);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar análise.' });
  }
}

export async function handleExplain(req, res) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'O código é obrigatório.' });
    }

    const result = await aiService.explainCode(code);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao processar explicação.' });
  }
}

export async function handleAsk(req, res) {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'A pergunta é obrigatória.' });
    }

    const result = await aiService.askQuestion(question);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Erro detalhado da API:', error);
    return res.status(500).json({ error: 'Erro ao processar dúvida.' });
  }
}