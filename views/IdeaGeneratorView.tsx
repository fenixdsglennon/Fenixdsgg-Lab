
import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import { generateIdeas } from '../services/geminiService';
import { GroundingChunk } from '../types';

interface IdeaGeneratorViewProps {
    onBack: () => void;
}

const IdeaGeneratorView: React.FC<IdeaGeneratorViewProps> = ({ onBack }) => {
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<{ text: string; chunks: GroundingChunk[] } | null>(null);

    // Fix: Removed all API key related logic and UI. Service now uses process.env.API_KEY.
    const handleSubmit = async () => {
        if (!topic) {
            setError('Por favor, insira um tópico.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await generateIdeas(topic);
            setResult(response);
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
                    <h2 className="text-3xl font-bold mb-2">Gerador de Ideias</h2>
                    <p className="text-content-200">Não sabe o que criar? Insira um tópico e receba ideias criativas baseadas em informações recentes da web.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Ex: Carros voadores, moda sustentável, arquitetura alienígena"
                        className="flex-grow p-3 bg-base-200 border border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition disabled:opacity-50"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 disabled:bg-base-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Buscando...' : 'Gerar Ideias'}
                    </button>
                </div>

                {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

                <div className="mt-10">
                    {isLoading && <Spinner message="Pesquisando na web por inspiração..." />}
                    {result && (
                        <div className="bg-base-200 p-6 rounded-lg shadow-inner">
                            <h3 className="text-2xl font-bold mb-4 text-brand-light">Ideias para "{topic}"</h3>
                            <div className="prose prose-invert max-w-none text-content-200 whitespace-pre-wrap">{result.text}</div>
                            
                            {result.chunks.length > 0 && (
                                <div className="mt-6 border-t border-base-300 pt-4">
                                    <h4 className="font-semibold text-content-100 mb-2">Fontes da Web:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {result.chunks.map((chunk, index) => (
                                            chunk.web && (
                                                <li key={index}>
                                                    <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-brand-secondary hover:underline">
                                                        {chunk.web.title || chunk.web.uri}
                                                    </a>
                                                </li>
                                            )
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IdeaGeneratorView;
