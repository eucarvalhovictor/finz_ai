
import { GoogleGenAI } from "@google/genai";
import type { Transaction } from '../types';

export const getFinancialInsight = async (transactions: Transaction[]): Promise<string> => {
  // Initialize Gemini API with the API key from environment variables.
  // We assume process.env.API_KEY is pre-configured and valid.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-2.5-flash';

  if (transactions.length === 0) {
    return "Não há transações suficientes para gerar uma análise. Adicione algumas transações e tente novamente.";
  }

  const formattedTransactions = transactions.map(t => ({
    descricao: t.description,
    valor: t.amount,
    tipo: t.type === 'INCOME' ? 'Receita' : 'Despesa',
    data: t.date,
    categoria: t.category
  }));

  const prompt = `
    Você é o FinzAI, um assistente financeiro pessoal inteligente. Seu objetivo é analisar os dados de transações de um usuário no Brasil (valores em BRL) e fornecer uma análise clara, objetiva e amigável com dicas práticas para melhorar sua saúde financeira.

    **Análise Requerida:**
    1.  **Resumo Geral:** Comece com um resumo do comportamento financeiro do usuário no período.
    2.  **Principais Despesas:** Identifique as 3 principais categorias de despesas e o total gasto em cada uma.
    3.  **Pontos de Melhoria:** Aponte áreas onde o usuário pode estar gastando muito e sugira formas de economizar.
    4.  **Dicas Práticas:** Ofereça 2 a 3 dicas acionáveis e personalizadas com base nos dados.
    5.  **Tom:** Seja encorajador e positivo. Use formatação Markdown para melhorar a legibilidade (títulos, listas, negrito).

    **Dados das Transações do Usuário:**
    ${JSON.stringify(formattedTransactions, null, 2)}

    Por favor, gere a análise financeira.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    if (response.text) {
      return response.text;
    } else {
        return "Não foi possível gerar a análise. A resposta da IA estava vazia.";
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocorreu um erro ao tentar gerar sua análise financeira. Por favor, tente novamente mais tarde.";
  }
};
