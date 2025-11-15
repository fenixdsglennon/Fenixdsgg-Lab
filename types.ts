import React from 'react';

export enum Tool {
  IMAGE_GENERATOR,
  IMAGE_EDITOR,
  VIDEO_GENERATOR,
  IDEA_GENERATOR,
  TTS_GENERATOR,
}

export interface Feature {
  id: Tool;
  title: string;
  description: string;
  // Fix: Replaced JSX.Element with React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
  icon: React.ReactElement;
  requiresImage: boolean;
  requiresVideo: boolean;
}

export interface ImageFile {
  file: File;
  preview: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Operation<T> {
  name: string;
  done: boolean;
  response?: T;
}

export interface GeneratedVideo {
  video: {
    uri: string;
    aspectRatio: string;
  };
}

export interface GenerateVideosResponse {
    generatedVideos: GeneratedVideo[];
}