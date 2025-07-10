import React, { useEffect, useState } from 'react';
import './LandingPage.css';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Translator } from '../components/Translator';


const LandingPage: React.FC = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const updateVisitCount = async () => {
      const countRef = doc(db, 'visits', 'counter');
      try {
        await updateDoc(countRef, {
          value: increment(1),
        });
        const snap = await getDoc(countRef);
        const data = snap.data();
        setCount(data?.value ?? 0);
      } catch (error) {
        console.error('🔥 Error actualizando visitas:', error);
      }
    };

    updateVisitCount();
  }, []);

  return (
    <div className="landing-wrapper">
      <div className="glass-container">
        <h1>🌐 AionTranslator</h1>
        <p>Traducción de voz en tiempo real potenciada por IA</p>

            <div className="placeholder-content">
            <Translator />
            </div>

        <div id="counter" className="counter">
          🧭 Traducciones realizadas: {count !== null ? count : '--'}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
