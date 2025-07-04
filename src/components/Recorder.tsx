// src/components/Recorder.tsx
import React from 'react';
import { ReactMediaRecorder } from 'react-media-recorder';

const Recorder = () => (
  <ReactMediaRecorder
    audio
    render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
      <div>
        <p>Estado: {status}</p>
        <button onClick={startRecording}>🎙️ Grabar</button>
        <button onClick={stopRecording}>🛑 Detener</button>
        <audio src={mediaBlobUrl || ''} controls />
      </div>
    )}
  />
);

export default Recorder;
