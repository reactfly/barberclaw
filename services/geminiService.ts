import { GoogleGenAI, Type } from "@google/genai";
import { ALLOWED_CUTS } from "../constants";
import { VisagismAnalysisResult } from "../types";

// Define Schema using the official Type enum
const getAnalysisSchema = (allowedList: string[]) => ({
  type: Type.OBJECT,
  properties: {
    faceShape: {
      type: Type.STRING,
      description: "O formato do rosto identificado (ex: Oval, Quadrado, Redondo, etc).",
    },
    suggestedCuts: {
      type: Type.ARRAY,
      description: "Uma lista de sugestões baseadas no formato do rosto.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: `Nome do estilo. DEVE ser exatamente um destes: ${allowedList.join(", ")}`,
          },
          reason: {
            type: Type.STRING,
            description: "Justificativa curta (max 15 palavras) do porquê este estilo combina com o rosto.",
          },
        },
        required: ["name", "reason"],
      },
    },
  },
  required: ["faceShape", "suggestedCuts"],
});

// Mock Result for Fallback when API Quota is exceeded or Key is missing
const MOCK_RESULT: VisagismAnalysisResult = {
  faceShape: "Oval (Modo Demo)",
  suggestedCuts: [
    {
      name: "Buzz Cut (Militar)",
      reason: "Realça os traços naturais com praticidade e estilo moderno. (Simulação: Cota API Excedida)"
    },
    {
      name: "Pompadour",
      reason: "Adiciona volume vertical, valorizando a simetria facial. (Simulação: Cota API Excedida)"
    },
    {
      name: "Mid Fade (Degradê Médio)",
      reason: "Equilíbrio perfeito entre o clássico e o urbano. (Simulação: Cota API Excedida)"
    }
  ]
};

export const analyzeHairstyle = async (
  base64Image: string, 
  stylePreference: string = "Todos"
): Promise<VisagismAnalysisResult> => {
  
  // Guideline: API Key must be obtained exclusively from process.env.API_KEY
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn("API Key ausente em process.env.GEMINI_API_KEY. Usando modo demonstração.");
    await new Promise(resolve => setTimeout(resolve, 1500)); // Fake latency
    return MOCK_RESULT;
  }

  // Guideline: Use process.env.GEMINI_API_KEY string directly
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Removing the data:image/jpeg;base64, prefix if present for the API call
  const base64Data = base64Image.split(',')[1] || base64Image;

  let allowedList: string[] = ALLOWED_CUTS as string[];
  let contextPrompt = "Você é um especialista em Visagismo e geometria facial.";
  
  if (stylePreference !== "Todos") {
    contextPrompt += ` O cliente tem preferência pelo estilo: ${stylePreference}. Priorize cortes que se encaixem nisso, mas mantenha a harmonia facial.`;
  }

  try {
    const selectedModel = localStorage.getItem('gemini_model') || "gemini-3-flash-preview";
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          {
            text: `${contextPrompt} Analise o formato do rosto nesta imagem e sugira 3 cortes ideais da lista permitida. Responda APENAS com o JSON seguindo o schema.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: getAnalysisSchema(allowedList),
        temperature: 0.4,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as VisagismAnalysisResult;
    }
    throw new Error("Resposta vazia da IA");

  } catch (error) {
    console.error("Erro na análise de visagismo:", error);
    // Em produção, você pode querer lançar o erro para o UI lidar
    // ou retornar o Mock se for erro de cota.
    if ((error as any).status === 429) {
        return MOCK_RESULT;
    }
    throw error;
  }
};

export const generateHairstylePreview = async (
  _base64Image: string,
  cutName: string
): Promise<string> => {
  // Utilizando Pollinations.ai para geração de imagens gratuita sem necessidade de API Key
  try {
    const prompt = `A photorealistic portrait of a handsome man with a perfect ${cutName} haircut. High quality, 4k, cinematic lighting, barbershop background, highly detailed face, professional photography.`;
    const encodedPrompt = encodeURIComponent(prompt);
    const seed = Math.floor(Math.random() * 100000);
    
    // Pollinations.ai URL returns an image directly
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${seed}&width=512&height=512&nologo=true`;
    
    // Fazemos o fetch da imagem para aguardar a geração concluir e converter para base64
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Falha ao gerar a imagem.");
    }
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Erro na geração de preview:", error);
    throw new Error("Não foi possível gerar a simulação visual no momento.");
  }
};