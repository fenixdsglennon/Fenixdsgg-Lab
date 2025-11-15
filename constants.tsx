
import React from 'react';
import { Feature, Tool } from './types';

const ImageGeneratorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const ImageEditorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
);

const VideoGeneratorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const IdeaGeneratorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
);

const TTSGeneratorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 3.553A1 1 0 0113 4.447v15.106a1 1 0 01-1.555.832l-6.65-3.839H2a1 1 0 01-1-1v-5.106a1 1 0 011-1h2.778l6.65-3.84a1 1 0 011.505-.047zM15 9a3 3 0 110 6" />
    </svg>
);

export const FEATURES: Feature[] = [
    {
        id: Tool.IMAGE_GENERATOR,
        title: 'Gerar Imagem',
        description: 'Crie uma imagem a partir de uma descrição de texto detalhada.',
        icon: <ImageGeneratorIcon />,
        requiresImage: false,
        requiresVideo: false,
    },
    {
        id: Tool.IMAGE_EDITOR,
        title: 'Editor de Imagem IA',
        description: 'Edite, junte, mescle ou estilize imagens usando um prompt de texto.',
        icon: <ImageEditorIcon />,
        requiresImage: true,
        requiresVideo: false,
    },
    {
        id: Tool.VIDEO_GENERATOR,
        title: 'Gerar Vídeo',
        description: 'Crie um vídeo a partir de um prompt de texto e uma imagem inicial opcional.',
        icon: <VideoGeneratorIcon />,
        requiresImage: true,
        requiresVideo: true,
    },
    {
        id: Tool.IDEA_GENERATOR,
        title: 'Gerador de Ideias',
        description: 'Busque ideias criativas e atualizadas para seus prompts de imagem e vídeo.',
        icon: <IdeaGeneratorIcon />,
        requiresImage: false,
        requiresVideo: false,
    },
    {
        id: Tool.TTS_GENERATOR,
        title: 'Gerador de Áudio (TTS)',
        description: 'Converta texto em fala com som natural usando uma variedade de vozes.',
        icon: <TTSGeneratorIcon />,
        requiresImage: false,
        requiresVideo: false,
    },
];
