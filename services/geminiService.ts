import { GoogleGenAI, Modality } from "@google/genai";
import { Language } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const getLanguageName = (langCode: Language): string => {
    switch (langCode) {
        case Language.EN: return 'English (US)';
        case Language.PT: return 'Portuguese (Brazil)';
        case Language.FR: return 'French';
        case Language.ES: return 'Spanish';
        case Language.IT: return 'Italian';
        case Language.DE: return 'German';
        case Language.RU: return 'Russian';
        default:
          const exhaustiveCheck: never = langCode;
          return exhaustiveCheck;
    }
}

export const translateText = async (
    text: string,
    sourceLang: Language,
    targetLang: Language,
    isAdvanced: boolean
): Promise<string> => {
    if (!text.trim()) {
        return "";
    }

    const model = 'gemini-2.5-flash';
    let prompt = '';
    const sourceLangName = getLanguageName(sourceLang);
    const targetLangName = getLanguageName(targetLang);

    if (isAdvanced) {
        prompt = `
        You are an expert translator. Perform an advanced, contextual translation of the following text from ${sourceLangName} to ${targetLangName}.
        Your analysis must consider: the narrative context, the author's original style, specific terms and expressions (including colloquialisms, regionalisms, and cultural profile), and the format and intended use of the text (e.g., medical, literary, casual message).
        Your goal is to produce a translation with the maximum possible fidelity to the original style, narrative objective, and personality.
        Do not add any introductory or concluding remarks, explanations, or any text other than the translation itself. Just provide the final translated text.

        The text to translate is:
        ---
        ${text}
        ---
        `;
    } else {
        prompt = `
        Perform a direct and fast translation of the following text from ${sourceLangName} to ${targetLangName}.
        Do not add any introductory or concluding remarks, explanations, or any text other than the translation itself. Just provide the final translated text.

        The text to translate is:
        ---
        ${text}
        ---
        `;
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to translate text. Please check your API key and network connection.");
    }
};

export const generateSpeech = async (
    text: string,
    lang: Language,
): Promise<string> => {
    if (!text.trim()) {
        return "";
    }

    const model = "gemini-2.5-flash-preview-tts";
    let voiceName = 'Kore'; // Default voice

    switch (lang) {
        case Language.EN: voiceName = 'Kore'; break;
        case Language.PT: voiceName = 'Puck'; break;
        case Language.FR: voiceName = 'Zephyr'; break;
        case Language.ES: voiceName = 'Charon'; break;
        case Language.IT: voiceName = 'Fenrir'; break;
        case Language.DE: voiceName = 'Puck'; break;
        case Language.RU: voiceName = 'Kore'; break;
    }

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: `Say: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Gemini TTS API call failed:", error);
        throw new Error("Failed to generate speech. Please try again.");
    }
};