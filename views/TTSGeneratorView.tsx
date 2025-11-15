import React, { useState, useRef } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { generateSpeech } from '../services/geminiService';

const TTS_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

// Audio decoding utilities
function decode(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext
): Promise<AudioBuffer> {
    const sampleRate = 24000; // As per Gemini TTS docs
    const numChannels = 1; // As per Gemini TTS docs
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}


const TTSGeneratorView: React.FC<{ onBack: () => void; }> = ({ onBack }) => {
    const [text, setText] = useState('');
    const [voice, setVoice] = useState(TTS_VOICES[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const playAudio = (buffer: AudioBuffer) => {
        if (audioSourceRef.current) {
            try {
              audioSourceRef.current.stop();
            } catch (e) {
              console.warn("Could not stop previous audio source", e);
            }
        }
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const source = audioContextRef.current.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContextRef.current.destination);
        source.start(0);
        audioSourceRef.current = source;
    };

    const handleSubmit = async () => {
        if (!text) {
            setError('Por favor, insira um texto.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setAudioBuffer(null);
        if (audioSourceRef.current) {
            try {
              audioSourceRef.current.stop();
            } catch (e) {
                console.warn("Could not stop previous audio source", e);
            }
        }

        try {
            const base64Audio = await generateSpeech(text, voice);
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const decodedData = decode(base64Audio);
            const buffer = await decodeToAudioBuffer(decodedData, audioContextRef.current);
            setAudioBuffer(buffer);
            playAudio(buffer);

        } catch (e) {
            if (e instanceof Error && (e.message.includes("API_KEY_MISSING") || e.message.includes("An API Key must be set"))) {
                setError("Chave de API não encontrada ou inválida. Verifique se o aplicativo está sendo executado no ambiente correto do AI Studio.");
            } else {
                setError(`Ocorreu um erro: ${e instanceof Error ? e.message : String(e)}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <BackButton onClick={onBack} />
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Gerador de Áudio (TTS)</h2>
                    <p className="text-content-200">Digite o texto que deseja converter em fala, escolha uma voz e ouça a mágica acontecer.</p>
                </div>
                
                <div className="space-y-6 bg-base-200 p-6 rounded-lg">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ex: Olá, mundo! Bem-vindo ao futuro da geração de áudio."
                        className="w-full p-4 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                        rows={5}
                        disabled={isLoading}
                        aria-label="Texto para converter em fala"
                    />
                     <div>
                        <label htmlFor="voice-select" className="block text-sm font-medium text-content-200 mb-2">Voz</label>
                        <select
                            id="voice-select"
                            value={voice}
                            onChange={(e) => setVoice(e.target.value)}
                            disabled={isLoading}
                            className="w-full p-3 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none"
                        >
                            {TTS_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !text}
                        className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-base-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Gerando...' : 'Gerar Áudio'}
                    </button>
                </div>

                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

                <div className="mt-10 text-center">
                    {isLoading && <Spinner message="Sintetizando a fala..." />}
                    {audioBuffer && (
                        <div className="bg-base-200 p-4 rounded-lg inline-block shadow-md">
                           <p className="text-content-100 mb-3 font-semibold">Áudio gerado:</p>
                           <button 
                             onClick={() => playAudio(audioBuffer)}
                             className="bg-brand-secondary hover:bg-brand-dark text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 flex items-center mx-auto"
                             aria-label="Tocar áudio novamente"
                           >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Tocar novamente
                           </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TTSGeneratorView;