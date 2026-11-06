import ai from '../config/gemini.js';

export async function analyzeCode(code, language) {
  const prompt = `Você é um assistente técnico especialista em código.
Analise o seguinte trecho de código em ${language || 'linguagem não especificada'} em busca de bugs, falhas de segurança e oportunidades de otimização:

\`\`\`
${code}
\`\`\`

Dê uma resposta objetiva, organizada em tópicos.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return {
    status: 'success',
    result: response.text
  };
}

export async function explainCode(code) {
  const prompt = `Você é um instrutor de programação didático e direto.
Explique passo a passo o que o seguinte código faz:

\`\`\`
${code}
\`\`\`
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return {
    status: 'success',
    result: response.text
  };
}

export async function askQuestion(question) {
  const prompt = `Você é um assistente técnico especialista em TI e desenvolvimento de software.
Responda de forma clara, precisa e com exemplos práticos se necessário à seguinte dúvida:

Pergunta: ${question}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return {
    status: 'success',
    result: response.text
  };
}