import { useState, useRef, useEffect } from "react";
import { useVoiceTranslation } from "../hooks/useVoiceTranslation";
import logo from '../assets/aion-logo.png';

import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export const Translator = () => {
  const [recording, setRecording] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationCount, setTranslationCount] = useState<number | null>(null);

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

  const increaseTranslationCounter = async () => {
    const counterRef = doc(db, 'translationCount', 'main');
    await setDoc(doc(db, "translationCount", "n"), { count: 1 }, { merge: true });
    const updatedDoc = await getDoc(counterRef);
    const newCount = updatedDoc.data()?.count ?? null;
    setTranslationCount(newCount);
  };

  const fetchTranslationCount = async () => {
    const docRef = doc(db, 'translationCount', 'main');
    const snapshot = await getDoc(docRef);
    setTranslationCount(snapshot.data()?.count ?? 0);
  };

  useEffect(() => {
    fetchTranslationCount();
  }, []);

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
  try {
    console.log("🎤 Grabación terminada, enviando a traducción");
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    stopMic();
    setTranslating(true);
    await handleAudio(blob); // puede estar fallando aquí
    await increaseTranslationCounter();
  } catch (err) {
    console.error("⚠️ Error en el flujo:", err);
  } finally {
    setTranslating(false);
    setRecording(false);
  }
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
    <div className="flex flex-col items-center justify-center min-h-screen px-6 rounded-xl backdrop-blur bg-white/20 shadow-lg">
      <div className="flex items-center justify-center gap-4 mt-8 text-white text-4xl font-extrabold drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
        <span className="text-5xl">🌐</span>
        <span>AionTranslator</span>
      </div>
      <p className="text-white text-lg font-medium mt-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        Traducción de voz en tiempo real potenciada por IA
      </p>

      <br /><br />
      <canvas ref={canvasRef} width="600" height="100" className="border rounded" />

      <div className="flex gap-4 mt-4 items-center justify-center">
        <button
          onClick={startRecording}
          disabled={recording || isLoading || translating}
          className="px-6 py-2 bg-[#1da1f2] hover:bg-[#0d8ddc] text-white rounded font-semibold disabled:bg-gray-400 transition-colors duration-300"
        >
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




      {(isLoading || translating) && (
        <p className="mt-4 text-gray-700">⏳ Procesando...</p>
      )}

      <footer className="text-center text-base text-gray-700 py-4 mt-10 border-t border-gray-300 w-full">
        <p>
          Hecho con 💡 usando <span className="font-semibold">OpenAI GPT</span> y{" "}
          <span className="font-semibold">ElevenLabs</span>
          <br />
          <em className="text-sm">Powered by Héctor Miguel Vergara Canevaro</em>
          <br /><br /><br />
          <em className="text-sm">versión Beta</em>
        </p>
              {translationCount !== null && (
  <p className="text-sm">
    🔢 Traducciones realizadas: <span className="font-bold">{translationCount}</span>
  </p>
)}
      </footer>
    </div>
  );
};
