
import React from 'react';
import { Feature } from '../types';

interface FeatureCardProps {
    feature: Feature;
    onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-base-200 rounded-lg p-6 shadow-lg hover:shadow-xl hover:bg-base-300 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        >
            <div className="flex items-center space-x-4 mb-4">
                {feature.icon}
                <h3 className="text-xl font-bold text-content-100">{feature.title}</h3>
            </div>
            <p className="text-content-200">{feature.description}</p>
        </div>
    );
};

export default FeatureCard;
