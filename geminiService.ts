
import { GoogleGenAI, Type, GenerateContentResponse, Modality, FunctionDeclaration } from "@google/genai";

const dbInsertDeclaration: FunctionDeclaration = {
  name: 'db_insert',
  parameters: {
    type: Type.OBJECT,
    description: 'Insert a new record into the database to remember information.',
    properties: {
      collection: { type: Type.STRING, description: 'The name of the collection (e.g., "users", "notes", "tasks")' },
      document: { type: Type.STRING, description: 'The content or data to store (as a JSON string or text)' }
    },
    required: ['collection', 'document']
  }
};

const dbFindDeclaration: FunctionDeclaration = {
  name: 'db_find',
  parameters: {
    type: Type.OBJECT,
    description: 'Find records in the database based on a search term.',
    properties: {
      query: { type: Type.STRING, description: 'The search term to look for in the database.' }
    },
    required: ['query']
  }
};

export class GeminiService {
  private static getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  static async *chatStream(prompt: string, history: { role: string; parts: { text: string }[] }[] = []) {
    const ai = this.getClient();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      history: history.map(h => ({ role: h.role === 'assistant' ? 'model' : 'user', parts: h.parts })),
      config: {
        systemInstruction: "You are Prism AI. You have access to a neural database. Use 'db_insert' to remember things for the user and 'db_find' to look up previous data. Also use Google Search for external facts.",
        tools: [
          { googleSearch: {} },
          { functionDeclarations: [dbInsertDeclaration, dbFindDeclaration] }
        ]
      }
    });
    
    const stream = await chat.sendMessageStream({ message: prompt });
    for await (const chunk of stream) {
      const c = chunk as GenerateContentResponse;
      yield c;
    }
  }

  static async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  }

  static async generateSpeech(text: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    return base64Audio;
  }

  static async startVideoGeneration(prompt: string) {
    const ai = this.getClient();
    return await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });
  }

  static async pollVideoOperation(operation: any) {
    const ai = this.getClient();
    return await ai.operations.getVideosOperation({ operation });
  }
}
