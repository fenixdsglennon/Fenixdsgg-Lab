
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { GroundingChunk, Operation, GenerateVideosResponse } from '../types';

// Helper function to convert a File to a base64 string
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                resolve('');
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

// --- Image Generation ---
// Fix: Removed apiKey parameter and used process.env.API_KEY directly.
export const generateImageFromText = async (prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error("Nenhuma imagem foi gerada.");
};


// --- Image Editing ---
// Fix: Removed apiKey parameter and used process.env.API_KEY directly.
export const editImage = async (prompt: string, images: File[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const imageParts = await Promise.all(images.map(fileToGenerativePart));
    const textPart = { text: prompt };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [...imageParts, textPart] },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
    }
    throw new Error("Nenhuma imagem editada foi retornada.");
};

// --- Video Generation ---
// Esta seção permanece inalterada, pois usa um fluxo específico com window.aistudio para modelos Veo.
// A chave de API é gerenciada pelo ambiente do aistudio e injetada em process.env.API_KEY.
export const generateVideo = async (
    prompt: string,
    aspectRatio: "16:9" | "9:16",
    image?: File
): Promise<Operation<GenerateVideosResponse>> => {
    // For Veo models, we must re-initialize the client to ensure the latest selected API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    let imagePayload;
    if (image) {
        const imagePart = await fileToGenerativePart(image);
        imagePayload = {
            imageBytes: imagePart.inlineData.data,
            mimeType: imagePart.inlineData.mimeType,
        };
    }

    const operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: imagePayload,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        },
    });

    return operation;
};

export const pollVideoOperation = async (operation: Operation<GenerateVideosResponse>): Promise<Operation<GenerateVideosResponse>> => {
    // Re-initialize the client for polling as well.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai.operations.getVideosOperation({ operation: operation });
};


// --- Idea Generation with Search Grounding ---
// Fix: Removed apiKey parameter and used process.env.API_KEY directly.
export const generateIdeas = async (topic: string): Promise<{ text: string, chunks: GroundingChunk[] }> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `Gere 5 ideias criativas e detalhadas para prompts de imagem ou vídeo sobre o tópico "${topic}". Use informações da web para garantir que as ideias sejam atuais e interessantes. Para cada ideia, forneça uma breve justificativa de por que seria visualmente atraente.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const text = response.text;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { text, chunks: chunks as GroundingChunk[] };
};
