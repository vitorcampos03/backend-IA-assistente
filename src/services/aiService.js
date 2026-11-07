import groq from '../config/groq.js';


const MODEL_NAME = 'openai/gpt-oss-120b'

async function generateResponse(prompt) {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: MODEL_NAME,
    max_completion_tokens: 1000,
    reasoning_effort: "low",
  });

  return completion.choices[0]?.message?.content || '';
}

export async function askQuestion(question) {
  const prompt = `Você é um assistente técnico especialista em TI e desenvolvimento de software.
Responda de forma clara, precisa e com exemplos práticos se necessário à seguinte dúvida:

Pergunta: ${question}`;

  const text = await generateResponse(prompt);

  return {
    status: 'success',
    result: text,
  };
}

export async function analyzeCode(code, language) {
  const prompt = `Você é um assistente técnico especialista em código.
Analise o seguinte trecho de código em ${language || 'linguagem não especificada'} em busca de bugs, falhas de segurança e oportunidades de otimização:

\`\`\`
${code}
\`\`\`

Dê uma resposta objetiva, organizada em tópicos.`;

  const text = await generateResponse(prompt);

  return {
    status: 'success',
    result: text,
  };
}

export async function explainCode(code) {
  const prompt = `Você é um instrutor de programação didático e direto.
Explique passo a passo o que o seguinte código faz:

\`\`\`
${code}
\`\`\`
`;

  const text = await generateResponse(prompt);

  return {
    status: 'success',
    result: text,
  };
}