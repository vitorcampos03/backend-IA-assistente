import ai from '../config/gemini.js';

const MODEL_NAME = 'gemini-3.8-flash';


//  funcao que faz no maximo 1 retry 
async function generateContentWithFastRetry(prompt) {
  try {
    return await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
  } catch (error) {
    // se der erro 503/429, tenta apenas mais uma vez em 1.5 segundos
    
    if ((error?.status === 503 || error?.status === 429)) {
      console.warn(`[Gemini API] Erro ${error.status}. Tentativa rápida de reconexão em 1.5s...`);
      await new Promise((res) => setTimeout(res, 1500));
      return await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      });
    }
    throw error;
  }
}

export async function askQuestion(question) {
  const prompt = `Você é um assistente técnico especialista em TI e desenvolvimento de software.
Responda de forma clara, precisa e com exemplos práticos se necessário à seguinte dúvida:

Pergunta: ${question}`;

  const response = await generateContentWithFastRetry(prompt);

  return {
    status: 'success',
    result: response.text,
  };
}

export async function analyzeCode(code, language) {
  const prompt = `Você é um assistente técnico especialista em código.
Analise o seguinte trecho de código em ${language || 'linguagem não especificada'} em busca de bugs, falhas de segurança e oportunidades de otimização:

\`\`\`
${code}
\`\`\`

Dê uma resposta objetiva, organizada em tópicos.`;

  const response = await generateContentWithFastRetry(prompt);

  return {
    status: 'success',
    result: response.text,
  };
}

export async function explainCode(code) {
  const prompt = `Você é um instrutor de programação didático e direto.
Explique passo a passo o que o seguinte código faz:

\`\`\`
${code}
\`\`\`
`;

  const response = await generateContentWithFastRetry(prompt);

  return {
    status: 'success',
    result: response.text,
  };
}