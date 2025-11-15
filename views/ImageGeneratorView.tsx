
import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { generateImageFromText } from '../services/geminiService';

interface ImageGeneratorViewProps {
    onBack: () => void;
}

const ImageGeneratorView: React.FC<ImageGeneratorViewProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // Fix: Removed all API key related logic and UI. Service now uses process.env.API_KEY.
    const handleSubmit = async () => {
        if (!prompt) {
            setError('Por favor, insira um prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const imageUrl = await generateImageFromText(prompt);
            setGeneratedImage(imageUrl);
        } catch (e) {
            setError(`Ocorreu um erro: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <BackButton onClick={onBack} />
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-2">Gerador de Imagem</h2>
                <p className="text-content-200 mb-8">Descreva a imagem que você deseja criar. Seja o mais detalhado possível para melhores resultados.</p>
                
                <div className="space-y-6">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Um astronauta surfando em uma onda cósmica, estilo pintura a óleo, super detalhado"
                        className="w-full p-4 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition disabled:opacity-50"
                        rows={4}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-base-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Gerando...' : 'Gerar Imagem'}
                    </button>
                </div>

                {error && <p className="text-red-500 mt-4">{error}</p>}

                <div className="mt-10">
                    {isLoading && <Spinner message="Criando sua obra de arte..." />}
                    {generatedImage && (
                        <div className="bg-base-200 p-4 rounded-lg inline-block">
                             <img src={generatedImage} alt="Imagem gerada" className="max-w-full h-auto rounded-md shadow-lg" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorView;
