import React, { useState } from 'react';
import { Tool } from './types';
import HomeScreen from './views/HomeScreen';
import Header from './components/Header';
import ImageGeneratorView from './views/ImageGeneratorView';
import ImageEditorView from './views/ImageEditorView';
import VideoGeneratorView from './views/VideoGeneratorView';
import IdeaGeneratorView from './views/IdeaGeneratorView';
import TTSGeneratorView from './views/TTSGeneratorView';

const App: React.FC = () => {
    const [currentTool, setCurrentTool] = useState<Tool | null>(null);

    const renderContent = () => {
        switch (currentTool) {
            case Tool.IMAGE_GENERATOR:
                return <ImageGeneratorView onBack={() => setCurrentTool(null)} />;
            case Tool.IMAGE_EDITOR:
                return <ImageEditorView onBack={() => setCurrentTool(null)} />;
            case Tool.VIDEO_GENERATOR:
                return <VideoGeneratorView onBack={() => setCurrentTool(null)} />;
            case Tool.IDEA_GENERATOR:
                return <IdeaGeneratorView onBack={() => setCurrentTool(null)} />;
            case Tool.TTS_GENERATOR:
                return <TTSGeneratorView onBack={() => setCurrentTool(null)} />;
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
