
import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import ImageUploader from '../components/ImageUploader';
import { editImage } from '../services/geminiService';

interface ImageEditorViewProps {
    onBack: () => void;
}

const ImageEditorView: React.FC<ImageEditorViewProps> = ({ onBack }) => {
    const [prompt, setPrompt] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);

    // Fix: Removed all API key related logic and UI. Service now uses process.env.API_KEY.
    const handleSubmit = async () => {
        if (!prompt || images.length === 0) {
            setError('Por favor, envie pelo menos uma imagem e insira um prompt.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResultImage(null);

        try {
            const imageUrl = await editImage(prompt, images);
            setResultImage(imageUrl);
        } catch (e) {
            setError(`Ocorreu um erro: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <BackButton onClick={onBack} />
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Editor de Imagem IA</h2>
                    <p className="text-content-200">Envie uma ou mais imagens e diga à IA o que fazer. Junte, mescle, troque cores, aplique estilos e muito mais.</p>
                </div>
                
                <div className="space-y-6 bg-base-200 p-6 rounded-lg">
                    <ImageUploader
                        onFilesChange={setImages}
                        multiple={true}
                        label="Suas Imagens"
                    />
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Mude a cor da jaqueta para vermelho / Aplique um estilo de anime nesta foto / Junte estas duas imagens em uma paisagem de fantasia"
                        className="w-full p-4 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition"
                        rows={4}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || images.length === 0}
                        className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:bg-base-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Editando...' : 'Aplicar Edição'}
                    </button>
                </div>

                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

                <div className="mt-10 text-center">
                    {isLoading && <Spinner message="Aplicando a mágica..." />}
                    {resultImage && (
                        <div className="bg-base-200 p-4 rounded-lg inline-block">
                             <img src={resultImage} alt="Imagem editada" className="max-w-full h-auto rounded-md shadow-lg" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageEditorView;
