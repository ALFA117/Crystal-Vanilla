import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from './ModeSelector';

export default function InputSection({ mode, onCalculate }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [ripple, setRipple] = useState(false);

  const currentMode = MODES.find((m) => m.id === mode);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(value);
    if (!value || isNaN(num) || num <= 0) {
      setError('Por favor ingresa un número válido mayor a 0');
      return;
    }
    setError('');
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    onCalculate(num);
  };

  const handleChange = (e) => {
    // Solo enteros — elimina cualquier carácter que no sea dígito
    const v = e.target.value.replace(/[^0-9]/g, '');
    setValue(v);
    if (error) setError('');
  };

  const blockDecimals = (e) => {
    if (e.key === '.' || e.key === ',') e.preventDefault();
  };

  return (
    <motion.div
      className="cv-input-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="cv-input-section__inner"
        >
          <p className="cv-input-section__desc">{currentMode?.description}</p>

          <form onSubmit={handleSubmit} className="cv-input-form" noValidate>
            <div className="cv-input-form__field">
              <span className="cv-input-form__prefix">{currentMode?.emoji}</span>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                className="cv-input-form__input"
                placeholder={currentMode?.placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={blockDecimals}
                aria-label={currentMode?.description}
              />
              <span className="cv-input-form__unit">{currentMode?.unit}</span>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  className="cv-input-form__error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  ⚠️ {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              className={`cv-btn-calculate ${ripple ? 'cv-btn-calculate--ripple' : ''}`}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 30px rgba(212,160,23,0.55)' }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.span
                animate={ripple ? { rotate: [0, 15, -15, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                ✨
              </motion.span>
              &nbsp; Calcular Producción
            </motion.button>
          </form>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
