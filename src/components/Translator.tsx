import { useState, useRef } from "react";
import { useVoiceTranslation } from "../hooks/useVoiceTranslation";
import logo from '../assets/aion-logo.png';

export const Translator = () => {
  const [recording, setRecording] = useState(false);
  const [translating, setTranslating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const { isLoading, handleAudio } = useVoiceTranslation();

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current || !dataArrayRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const WIDTH = canvasRef.current.width;
    const HEIGHT = canvasRef.current.height;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    ctx.lineWidth = 2;
    ctx.strokeStyle = "blue";
    ctx.beginPath();

    const sliceWidth = WIDTH / dataArrayRef.current.length;
    let x = 0;

    for (let i = 0; i < dataArrayRef.current.length; i++) {
      const v = dataArrayRef.current[i] / 128.0;
      const y = (v * HEIGHT) / 2;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();

    animationIdRef.current = requestAnimationFrame(draw);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);

      analyserRef.current.fftSize = 2048;
      dataArrayRef.current = new Uint8Array(analyserRef.current.fftSize);
      chunksRef.current = [];

      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);

      draw();
      mediaRecorderRef.current.start();
      setRecording(true);
      setTranslating(false);
    } catch (err) {
      console.error("🎤 Error al acceder al micrófono:", err);
    }
  };

  const stopRecordingAndTranslate = async () => {
    if (!recording || !mediaRecorderRef.current) return;

    mediaRecorderRef.current.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      stopMic();
      setRecording(false);
      setTranslating(true);
      await handleAudio(blob);
      setTranslating(false);
    };

    mediaRecorderRef.current.stop();
  };

  const stopMic = () => {
    cancelAnimationFrame(animationIdRef.current!);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    audioContextRef.current?.close();
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
    sourceRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-white">
       <div className="text-center mb-6">
        <img
          src={logo}
          alt="AionTranslator logo"
          className="w-40 h-auto mt-8 mb-4"
        />

      <h1 className="text-3xl font-bold mt-4">AionTranslator</h1>
      <p className="text-gray-600 mt-2">Speak naturally. We translate it instantly.</p>

      </div>
      <canvas ref={canvasRef} width="300" height="100" className="border rounded" />

      <div className="flex gap-4 mt-4">
        <button
          onClick={startRecording}
          disabled={recording || isLoading || translating}
          className="px-6 py-2 bg-[#60a5fa] text-white rounded disabled:bg-gray-400">
          🗣️ Hablar
        </button>
        <button
          onClick={stopRecordingAndTranslate}
          disabled={!recording || translating || isLoading}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
>
          🌐 Traducir
        </button>
      </div>

      {(isLoading || translating) && <p className="mt-4">⏳ Procesando...</p>}
    </div>
  );
};
