import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MODES } from './ModeSelector';
import Icon from './Icon';

export default function InputSection({ mode, onCalculate }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const currentMode = MODES.find((m) => m.id === mode);
  const inputId = `cv-input-${mode}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(value);
    if (!value || isNaN(num) || num <= 0) {
      setError('Ingresa un número entero mayor a 0.');
      return;
    }
    if (mode === 'litros' && num < 110) {
      setError('El mínimo es 110 litros, lo que equivale a 1 tienda completa.');
      return;
    }
    setError('');
    onCalculate(num);
  };

  const handleChange = (e) => {
    // Solo enteros — elimina cualquier carácter que no sea dígito
    const v = e.target.value.replace(/[^0-9]/g, '');
    setValue(v);
    if (error) setError('');
  };

  const blockDecimals = (e) => {
    if (['.', ',', '-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
  };

  return (
    <form onSubmit={handleSubmit} className="cv-entry" noValidate>
      <label htmlFor={inputId} className="cv-label">2 · {currentMode?.description}</label>
      <div className={`cv-field ${error ? 'has-error' : ''}`}>
        <span className="cv-field__icon"><Icon name={currentMode?.icon} size={20} /></span>
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          min="1"
          step="1"
          className="cv-field__input"
          placeholder={currentMode?.placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={blockDecimals}
          aria-invalid={!!error}
          aria-describedby={`${inputId}-help`}
        />
        <span className="cv-field__unit">{currentMode?.unit}</span>
      </div>

      <div id={`${inputId}-help`} className="cv-entry__help">
        <AnimatePresence mode="wait" initial={false}>
          {error ? (
            <motion.p
              key="err"
              className="cv-entry__error"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Icon name="alert" size={16} /> {error}
            </motion.p>
          ) : (
            <motion.p
              key="hint"
              className="cv-entry__hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {mode === 'litros'
                ? 'Mínimo 110 litros (1 tienda). Solo números enteros.'
                : 'Solo números enteros.'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button type="submit" className="cv-btn cv-btn--primary cv-btn--block cv-btn--lg">
        <Icon name="calculator" size={19} />
        Calcular producción
      </button>
    </form>
  );
}
