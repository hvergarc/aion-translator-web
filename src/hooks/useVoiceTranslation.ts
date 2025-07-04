import { useState } from "react";
import { sendAudio } from "../services/translatorService";

export const useVoiceTranslation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAudio = async (audioBlob: Blob) => {
    setIsLoading(true);

    try {
      await sendAudio(audioBlob); // Solo llamamos y dejamos que el backend se encargue
    } catch (error) {
      console.error("Error en la traducción:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleAudio,
  };
};
