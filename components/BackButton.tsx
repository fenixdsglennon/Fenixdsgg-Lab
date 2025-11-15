
import React from 'react';

interface BackButtonProps {
    onClick: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="flex items-center space-x-2 text-brand-light hover:text-brand-secondary transition-colors duration-200 mb-6"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            <span>Voltar ao início</span>
        </button>
    );
};

export default BackButton;
