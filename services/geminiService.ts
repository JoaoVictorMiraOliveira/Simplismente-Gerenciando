import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in process.env");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeFinances = async (transactions: Transaction[], currentMonth: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Por favor, configure sua chave de API para receber insights.";

  const relevantData = transactions.map(t => ({
    desc: t.description,
    val: t.amount,
    date: t.date,
    type: t.type,
    status: t.status,
    cat: t.category
  }));

  const prompt = `
    Analise os seguintes dados financeiros (JSON) para o mês de referência ${currentMonth}.
    
    Dados:
    ${JSON.stringify(relevantData)}

    Por favor, forneça um resumo curto e 3 conselhos práticos de melhoria financeira ou alertas sobre gastos excessivos.
    Responda em formato Markdown, use tópicos (bullet points). Seja direto e profissional.
    Foque no fluxo de caixa e contas a pagar.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor financeiro pessoal experiente e prático.",
      }
    });

    return response.text || "Não foi possível gerar uma análise no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao conectar com a IA. Tente novamente mais tarde.";
  }
};