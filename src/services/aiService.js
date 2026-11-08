import groq from '../config/groq.js';

const MODEL_NAME = 'openai/gpt-oss-120b';

const SYSTEM_PROMPTS = {
  ask:`Você é um assistente técnico especialista em TI e desenvolvimento de software.
Responda de forma curta e objetiva, em português, sem emojis e sem tabelas.
Use exemplos de código só quando ajudarem de verdade.`,

  analyze: `Você é um assistente técnico especialista em código.
Analise o código em busca de bugs, falhas de segurança e oportunidades de otimização.
Responda em português, de forma objetiva, organizada em tópicos curtos, sem emojis e sem tabelas.
Priorize os problemas mais graves e mostre o código corrigido só quando ajudar.`,

  explain: `Você é um instrutor de programação didático e direto.
Explique passo a passo o que o código faz.
Responda em português, de forma curta e clara, sem emojis e sem tabelas.`,
};

async function generateResponse(systemPrompt, history, userMessage) {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      ...history, // [{ role, content }, ...] vindo do banco
      { role: 'user', content: userMessage },
    ],
    model: MODEL_NAME,
    max_completion_tokens: 1700,
    reasoning_effort: 'low',
  });

  return completion.choices[0]?.message?.content || '';
}

export async function askQuestion(question, history = []) {
  const userMessage = question;
  const result = await generateResponse(SYSTEM_PROMPTS.ask, history, userMessage);
  return { status: 'success', result, userMessage };
}

export async function analyzeCode(code, language, history = []) {
  const userMessage = `Analise este código em ${language || 'linguagem não especificada'}:\n\n\`\`\`\n${code}\n\`\`\``;
  const result = await generateResponse(SYSTEM_PROMPTS.analyze, history, userMessage);
  return { status: 'success', result, userMessage };
}

export async function explainCode(code, history = []) {
  const userMessage = `Explique este código:\n\n\`\`\`\n${code}\n\`\`\``;
  const result = await generateResponse(SYSTEM_PROMPTS.explain, history, userMessage);
  return { status: 'success', result, userMessage };
}