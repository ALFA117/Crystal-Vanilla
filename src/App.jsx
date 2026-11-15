import { useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';

import Header              from './components/Header';
import ModeSelector        from './components/ModeSelector';
import InputSection        from './components/InputSection';
import ResultsGrid         from './components/ResultsGrid';
import Equivalencias       from './components/Equivalencias';
import EmptyResults        from './components/EmptyResults';
import Footer              from './components/Footer';
import LoginModal          from './components/auth/LoginModal';
import DashboardPage       from './components/dashboard/DashboardPage';
import { AuthProvider }    from './contexts/AuthContext';

import { calculate }       from './utils/calculations';
import './App.css';

function AppContent() {
  const { user } = useAuth();
  const [page,       setPage]       = useState('calculator');
  const [mode,       setMode]       = useState('litros');
  const [results,    setResults]    = useState(null);
  const [inputValue, setInputValue] = useState(null);
  const [showLogin,  setShowLogin]  = useState(false);
  const [draft,      setDraft]      = useState('');

  const goTo = (dest) => { setPage(dest); window.scrollTo({ top: 0 }); };

  const handleInventario = () => {
    if (user) goTo('dashboard');
    else setShowLogin(true);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode); setResults(null); setInputValue(null); setDraft('');
  };

  const handleCalculate = (value) => {
    const res = calculate(mode, value);
    setInputValue(value);
    setDraft(String(value));
    setResults(res);
    // En escritorio el resultado aparece a la derecha; en móvil bajamos hasta él.
    if (window.matchMedia('(max-width: 959px)').matches) {
      setTimeout(() => {
        document.getElementById('cv-results-anchor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="cv-app">
        <a className="cv-skip" href="#contenido">Saltar al contenido</a>

        <Header
          page={page}
          onCalculator={() => goTo('calculator')}
          onInventario={handleInventario}
          onLoginClick={() => setShowLogin(true)}
        />

        <main id="contenido" className="cv-main">
          <AnimatePresence mode="wait">
            {page === 'dashboard' ? (
              <DashboardPage key="dashboard" onBack={() => goTo('calculator')} />
            ) : (
              <motion.div
                key="calculator"
                className="cv-workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <aside className="cv-panel" aria-labelledby="cv-calc-title">
                  <div className="cv-panel__intro">
                    <p className="cv-eyebrow">Producción y logística</p>
                    <h1 id="cv-calc-title" className="cv-panel__title">Calculadora de producción</h1>
                    <p className="cv-panel__lead">
                      Convierte el extracto disponible en tiendas, cajas, botellas y etiquetas,
                      o calcula cuánto extracto necesitas para surtir un número de tiendas.
                    </p>
                  </div>

                  <div className="cv-panel__form">
                    <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
                    <InputSection key={mode} mode={mode} onCalculate={handleCalculate} onDraftChange={setDraft} />
                  </div>
                </aside>

                <section className="cv-output" aria-live="polite" aria-label="Resultado">
                  <div id="cv-results-anchor" className="cv-anchor" />
                  {results ? (
                    <ResultsGrid
                      key={`${mode}-${inputValue}`}
                      results={results}
                      mode={mode}
                      inputValue={inputValue}
                      stale={draft !== String(inputValue)}
                    />
                  ) : (
                    <EmptyResults mode={mode} />
                  )}
                </section>

                <div className="cv-aside-ref">
                  <Equivalencias />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <Footer />

        <AnimatePresence>
          {showLogin && <LoginModal key="login-modal" onClose={() => setShowLogin(false)} />}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
