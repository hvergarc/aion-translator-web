export const sendAudio = async (
  audioBlob: Blob
): Promise<{ originalText: string; translatedText: string }> => {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");

  const response = await fetch("https://aion-backend-490681010783.us-central1.run.app/translate-audio", {
  // const response = await fetch("http://127.0.0.1:8000/translate-audio", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al traducir el audio");
  }

  const originalText = response.headers.get("X-Original-Text") || "";
  const translatedText = response.headers.get("X-Translated-Text") || "";
console.log(originalText);
console.log(translatedText);
  const audioBlobTranslated = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlobTranslated);

  const audio = new Audio(audioUrl);
  audio.play();

  return { originalText, translatedText };
};
