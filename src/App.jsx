import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ParticlesBackground from './components/ParticlesBackground';
import Header              from './components/Header';
import ModeSelector        from './components/ModeSelector';
import InputSection        from './components/InputSection';
import ResultsGrid         from './components/ResultsGrid';
import InventarioPage      from './components/InventarioPage';
import Footer              from './components/Footer';
import LoginModal          from './components/auth/LoginModal';
import DashboardPage       from './components/dashboard/DashboardPage';
import { AuthProvider }    from './contexts/AuthContext';

import { calculate }       from './utils/calculations';
import './App.css';

function AppContent() {
  const [page,       setPage]       = useState('calculator');
  const [mode,       setMode]       = useState('litros');
  const [results,    setResults]    = useState(null);
  const [inputValue, setInputValue] = useState(null);
  const [showLogin,  setShowLogin]  = useState(false);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setResults(null);
    setInputValue(null);
  };

  const handleCalculate = (value) => {
    const res = calculate(mode, value);
    setInputValue(value);
    setResults(res);
    setTimeout(() => {
      document.getElementById('cv-results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  return (
    <div className="cv-app">
      <ParticlesBackground />

      <div className="cv-app__content">
        <Header
          onLoginClick={() => setShowLogin(true)}
          onDashboardClick={() => { setPage('dashboard'); window.scrollTo({ top: 0 }); }}
        />

        <main className="cv-main">
          <AnimatePresence mode="wait">

            {page === 'dashboard' ? (
              <DashboardPage
                key="dashboard"
                onBack={() => setPage('calculator')}
              />
            ) : page === 'inventario' ? (
              <InventarioPage key="inventario" onBack={() => setPage('calculator')} />
            ) : (
              <motion.div
                key="calculator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="cv-calculator-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
                >
                  <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
                  <InputSection key={mode} mode={mode} onCalculate={handleCalculate} />
                </motion.div>

                <div id="cv-results-anchor" />

                <ResultsGrid
                  results={results}
                  mode={mode}
                  inputValue={inputValue}
                  onInventario={() => { setPage('inventario'); window.scrollTo({ top: 0 }); }}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        <Footer />
      </div>

      {/* Modal de login */}
      <AnimatePresence>
        {showLogin && <LoginModal key="login-modal" onClose={() => setShowLogin(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
