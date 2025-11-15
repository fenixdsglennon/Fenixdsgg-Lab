
import React from 'react';
import { Tool } from '../types';
import { FEATURES } from '../constants';
import FeatureCard from '../components/FeatureCard';

interface HomeScreenProps {
    onSelectTool: (tool: Tool) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectTool }) => {
    return (
        <div className="flex flex-col items-center">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Suas Ferramentas Criativas</h2>
                <p className="text-lg text-content-200 max-w-2xl">
                    Selecione uma ferramenta abaixo para começar a criar. Transforme texto em imagens, edite suas fotos com IA, gere vídeos e muito mais.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                {FEATURES.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} onClick={() => onSelectTool(feature.id)} />
                ))}
            </div>
        </div>
    );
};

export default HomeScreen;
