import React, { useState, useEffect, useCallback, useRef } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import ImageUploader from '../components/ImageUploader';
import { generateVideo, pollVideoOperation } from '../services/geminiService';
import { Operation, GenerateVideosResponse } from '../types';

interface VideoGeneratorViewProps {
    onBack: () => void;
}

const LOADING_MESSAGES = [
    "Aquecendo os motores de renderização...",
    "Consultando a musa da criatividade...",
    "Pintando pixels em movimento...",
    "Compondo a sinfonia visual...",
    "Ajustando o foco da realidade...",
    "Quase lá, adicionando um toque de brilho...",
];

const ApiKeySetupScreen: React.FC<{ onKeySelected: () => void, error: string | null }> = ({ onKeySelected, error }) => {
    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            onKeySelected();
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 300px)' }}>
            <div className="bg-base-200 p-8 rounded-lg text-center max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Configuração para Gerador de Vídeo</h2>
                <p className="mb-6 text-content-200">A geração de vídeo requer uma configuração de chave de API específica. Por favor, selecione sua chave de API para continuar.</p>
                <p className="mb-6 text-sm text-content-200">Para mais informações sobre cobrança, visite <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-light underline">a documentação oficial</a>.</p>
                <button onClick={handleSelectKey} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 w-full">
                    Configurar Chave de API
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </div>
    );
};

const VideoGeneratorView: React.FC<VideoGeneratorViewProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

    const [isKeyReady, setIsKeyReady] = useState<boolean | null>(null);
    const [keyError, setKeyError] = useState<string | null>(null);

    const pollingIntervalRef = useRef<number | null>(null);

    const checkApiKey = useCallback(async () => {
        setKeyError(null);
        try {
            if (!window.aistudio || typeof window.aistudio.hasSelectedApiKey !== 'function') {
                throw new Error("Ambiente do AI Studio não encontrado. Esta ferramenta só funciona dentro do AI Studio.");
            }
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeyReady(hasKey);
            if (!hasKey) {
                setKeyError("Por favor, selecione uma chave de API para usar o gerador de vídeo.");
            }
        } catch (e) {
            setKeyError(`Erro ao verificar a chave: ${e instanceof Error ? e.message : String(e)}`);
            setIsKeyReady(false);
        }
    }, []);
    
    useEffect(() => {
        const maxRetries = 10;
        let retries = 0;
        const intervalId = setInterval(() => {
            if (window.aistudio) {
                clearInterval(intervalId);
                checkApiKey();
            } else {
                retries++;
                if (retries >= maxRetries) {
                    clearInterval(intervalId);
                    setKeyError("Não foi possível carregar o ambiente do AI Studio. Por favor, atualize a página.");
                    setIsKeyReady(false);
                }
            }
        }, 500);

        return () => {
            clearInterval(intervalId)
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, [checkApiKey]);

    useEffect(() => {
        if (isLoading && !videoUrl) {
            const intervalId = window.setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = LOADING_MESSAGES.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                    return LOADING_MESSAGES[nextIndex];
                });
            }, 3000);
            return () => window.clearInterval(intervalId);
        }
    }, [isLoading, videoUrl]);

    const pollOperation = useCallback(async (operation: Operation<GenerateVideosResponse>) => {
        pollingIntervalRef.current = window.setInterval(async () => {
            try {
                const updatedOp = await pollVideoOperation(operation);
                if (updatedOp.done) {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setIsLoading(false);
                    const downloadLink = updatedOp.response?.generatedVideos?.[0]?.video?.uri;
                    if (downloadLink) {
                        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                        if (!response.ok) {
                            throw new Error(`Falha ao buscar o vídeo: ${response.statusText}`);
                        }
                        const blob = await response.blob();
                        setVideoUrl(URL.createObjectURL(blob));
                    } else {
                        setError(updatedOp.response ? "A operação foi concluída, mas nenhum vídeo foi encontrado." : "A operação falhou ou foi concluída sem resultado.");
                    }
                }
            } catch (e) {
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                setError(`Erro durante a verificação: ${e instanceof Error ? e.message : String(e)}`);
                setIsLoading(false);
            }
        }, 10000);
    }, []);

    const handleSubmit = async () => {
        if (!prompt) {
            setError('Por favor, insira um prompt.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage(LOADING_MESSAGES[0]);

        try {
            const initialOperation = await generateVideo(prompt, aspectRatio, image || undefined);
            if (initialOperation.done && initialOperation.response === undefined) {
                throw new Error("A operação foi concluída imediatamente sem um resultado. Verifique seu prompt e a imagem.");
            }
            pollOperation(initialOperation);
        } catch (e) {
            let errorMessage = `Ocorreu um erro: ${e instanceof Error ? e.message : String(e)}`;
            if (e instanceof Error) {
                if (e.message.includes("API_KEY_MISSING") || e.message.includes("An API Key must be set")) {
                    errorMessage = "Chave de API não encontrada. Por favor, configure a chave de API novamente.";
                    checkApiKey();
                } else if (e.message.includes("Requested entity was not found.")) {
                    errorMessage = "Chave de API inválida ou não encontrada. Por favor, configure a chave de API novamente.";
                    checkApiKey();
                }
            }
            setError(errorMessage);
            setIsLoading(false);
        }
    };

    if (isKeyReady === null) {
        return (
            <div>
                <BackButton onClick={onBack} />
                <div className="flex justify-center items-center h-64"><Spinner message="Verificando configuração de vídeo..." /></div>
            </div>
        );
    }

    if (!isKeyReady) {
        return (
            <div>
                <BackButton onClick={onBack} />
                <ApiKeySetupScreen onKeySelected={checkApiKey} error={keyError} />
            </div>
        );
    }

    return (
        <div>
            <BackButton onClick={onBack} />
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Gerador de Vídeo</h2>
                    <p className="text-content-200">Crie um vídeo curto a partir de uma descrição de texto e, opcionalmente, uma imagem inicial.</p>
                </div>

                <div className="space-y-6 bg-base-200 p-6 rounded-lg">
                    <ImageUploader onFilesChange={(files) => setImage(files[0] || null)} multiple={false} label="Imagem Inicial (Opcional)" />
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Ex: Um carro futurista voando por uma cidade neon" className="w-full p-4 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition" rows={3} disabled={isLoading} />
                    <div>
                        <label className="block text-sm font-medium text-content-200 mb-2">Proporção</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as "16:9" | "9:16")} disabled={isLoading} className="w-full p-2 bg-base-100 border border-base-300 rounded-lg">
                            <option value="16:9">16:9 (Paisagem)</option>
                            <option value="9:16">9:16 (Retrato)</option>
                        </select>
                    </div>
                    <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-base-300 disabled:cursor-not-allowed">
                        {isLoading ? 'Gerando...' : 'Gerar Vídeo'}
                    </button>
                </div>

                {error && !isLoading && <p className="text-red-500 mt-4 text-center">{error}</p>}

                <div className="mt-10 text-center">
                    {isLoading && <Spinner message={loadingMessage} />}
                    {videoUrl && (
                        <div className="bg-base-200 p-4 rounded-lg inline-block">
                            <video src={videoUrl} controls autoPlay loop className="max-w-full h-auto rounded-md shadow-lg" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoGeneratorView;
