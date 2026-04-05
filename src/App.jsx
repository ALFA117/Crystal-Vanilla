import { useState } from 'react';
import { motion } from 'framer-motion';

import ParticlesBackground from './components/ParticlesBackground';
import Header              from './components/Header';
import ModeSelector        from './components/ModeSelector';
import InputSection        from './components/InputSection';
import ResultsGrid         from './components/ResultsGrid';
import Inventario          from './components/Inventario';
import Footer              from './components/Footer';

import { calculate }       from './utils/calculations';
import './App.css';

export default function App() {
  const [mode,       setMode]       = useState('litros');
  const [results,    setResults]    = useState(null);
  const [inputValue, setInputValue] = useState(null);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResults(null);
    setInputValue(null);
  };

  const handleCalculate = (value) => {
    const res = calculate(mode, value);
    setInputValue(value);
    setResults(res);
    // Smooth scroll to results
    setTimeout(() => {
      document.getElementById('cv-results-anchor')?.scrollIntoView({
        behavior: 'smooth', block: 'start',
      });
    }, 150);
  };

  return (
    <div className="cv-app">
      <ParticlesBackground />

      <div className="cv-app__content">
        <Header />

        <main className="cv-main">
          <div className="cv-top-row">
            <motion.div
              className="cv-calculator-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            >
              <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
              <InputSection mode={mode} onCalculate={handleCalculate} />
            </motion.div>

            <Inventario />
          </div>

          <div id="cv-results-anchor" />

          <ResultsGrid results={results} mode={mode} inputValue={inputValue} />
        </main>

        <Footer />
      </div>
    </div>
  );
}
