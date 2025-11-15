
import React, { useState } from 'react';

interface ApiKeyInputProps {
  onApiKeyChange: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeyChange }) => {
  const [key, setKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (key.trim()) {
      onApiKeyChange(key.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000); // Reset saved message
    }
  };

  return (
    <div className="bg-base-200 border border-brand-secondary/30 p-4 rounded-lg mb-8 shadow-md">
      <h3 className="text-lg font-semibold mb-2 text-content-100">Configure sua Chave de API</h3>
      <p className="text-sm text-content-200 mb-4">
        Para usar esta ferramenta, você precisa de uma chave de API do Google AI Studio. Sua chave é armazenada com segurança em seu navegador.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Cole sua chave de API aqui"
          className="flex-grow p-2 bg-base-300 border-base-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none placeholder-gray-500"
        />
        <button
          onClick={handleSave}
          className="bg-brand-primary hover:bg-brand-dark text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-base-300"
          disabled={!key.trim()}
        >
          {saved ? 'Salva!' : 'Salvar Chave'}
        </button>
      </div>
       <p className="text-xs text-content-200 mt-2">
        Não tem uma chave? Obtenha uma gratuitamente no{' '}
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-light underline">
          Google AI Studio
        </a>.
      </p>
    </div>
  );
};

export default ApiKeyInput;
