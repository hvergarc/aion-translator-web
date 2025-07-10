export const sendAudio = async (audioBlob: Blob): Promise<void> => {
  const formData = new FormData();
  formData.append("file", audioBlob, "audio.wav");

const response = await fetch("https://aion-backend-490681010783.us-central1.run.app/translate-audio", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Error al traducir el audio");
  }

  // Recibe el stream y crea un objeto de audio
  const audioBlobTranslated = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlobTranslated);

  const audio = new Audio(audioUrl);
  audio.play();
};
