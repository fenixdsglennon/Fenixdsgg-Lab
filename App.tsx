
import React, { useState, useEffect, useCallback } from 'react';
import { Tool } from './types';
import HomeScreen from './views/HomeScreen';
import Header from './components/Header';
import ImageGeneratorView from './views/ImageGeneratorView';
import ImageEditorView from './views/ImageEditorView';
import VideoGeneratorView from './views/VideoGeneratorView';
import IdeaGeneratorView from './views/IdeaGeneratorView';
import Spinner from './components/Spinner';

const ApiKeySetupScreen: React.FC<{ onKeySelected: () => void, error: string | null }> = ({ onKeySelected, error }) => {
    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume success and let the check in the parent component handle the state update
            onKeySelected(); 
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className="bg-base-200 p-8 rounded-lg text-center max-w-lg shadow-xl">
                <h2 className="text-2xl font-bold mb-4">Bem-vindo ao Estúdio de Imagem IA</h2>
                <p className="mb-6 text-content-200">Para começar a criar, você precisa configurar sua chave de API do Google AI Studio. Isso permite que o aplicativo se comunique com os modelos de IA.</p>
                <p className="mb-6 text-sm text-content-200">Para mais informações sobre cobrança, visite <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-brand-light underline">a documentação oficial</a>.</p>
                <button onClick={handleSelectKey} className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 w-full">
                    Configurar Chave de API
                </button>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [currentTool, setCurrentTool] = useState<Tool | null>(null);
    const [isKeyReady, setIsKeyReady] = useState<boolean | null>(null); // null = checking, false = not ready, true = ready
    const [keyError, setKeyError] = useState<string | null>(null);

    const checkApiKey = useCallback(async () => {
        try {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setIsKeyReady(hasKey);
                 if (!hasKey) {
                    setKeyError("Por favor, selecione uma chave de API para continuar.");
                } else {
                    setKeyError(null);
                }
            } else {
                // If aistudio is not available, assume key is set via other means (e.g. local dev)
                // and proceed. The service call will fail if it's not actually set.
                setIsKeyReady(true);
            }
        } catch (e) {
            setKeyError(`Erro ao verificar a chave: ${e instanceof Error ? e.message : String(e)}`);
            setIsKeyReady(false);
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);


    const renderContent = () => {
        if (isKeyReady === null) {
            return <div className="flex justify-center items-center h-64"><Spinner message="Verificando configuração..." /></div>;
        }

        if (!isKeyReady) {
            return <ApiKeySetupScreen onKeySelected={checkApiKey} error={keyError} />;
        }

        switch (currentTool) {
            case Tool.IMAGE_GENERATOR:
                return <ImageGeneratorView onBack={() => setCurrentTool(null)} onApiKeyError={checkApiKey} />;
            case Tool.IMAGE_EDITOR:
                return <ImageEditorView onBack={() => setCurrentTool(null)} onApiKeyError={checkApiKey} />;
            case Tool.VIDEO_GENERATOR:
                // Pass a callback to reset the key check if the video API fails due to an invalid key
                return <VideoGeneratorView onBack={() => setCurrentTool(null)} onApiKeyError={checkApiKey} />;
            case Tool.IDEA_GENERATOR:
                return <IdeaGeneratorView onBack={() => setCurrentTool(null)} onApiKeyError={checkApiKey} />;
            default:
                return <HomeScreen onSelectTool={setCurrentTool} />;
        }
    };

    return (
        <div className="min-h-screen bg-base-100 font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;
