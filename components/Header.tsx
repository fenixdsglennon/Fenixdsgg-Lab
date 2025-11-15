
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="bg-base-200 shadow-md">
            <div className="container mx-auto px-4 py-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-center text-content-100 tracking-wider">
                    <span className="text-brand-light">Estúdio</span> de Imagem IA
                </h1>
            </div>
        </header>
    );
};

export default Header;
