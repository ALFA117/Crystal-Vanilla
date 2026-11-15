export default function EmptyResults({ mode }) {
  return (
    <div className="cv-empty">
      <svg className="cv-empty__art" viewBox="0 0 120 110" aria-hidden="true" focusable="false">
        <rect x="6" y="84" width="108" height="10" rx="2" className="cv-empty__shelf" />
        {[24, 52, 80].map((x, i) => (
          <g key={x} transform={`translate(${x} ${i === 1 ? 26 : 36})`}>
            <path
              d="M8 0h4v9c0 1 .6 1.8 1.4 2.4C16 13 18 16 18 20v26a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V20c0-4 2-7 4.6-8.6C7.4 10.8 8 10 8 9z"
              transform={i === 1 ? undefined : 'translate(0 -10)'}
              className={i === 1 ? 'cv-empty__bottle cv-empty__bottle--main' : 'cv-empty__bottle'}
            />
          </g>
        ))}
      </svg>
      <h2 className="cv-empty__title">Aquí aparecerá tu orden de producción</h2>
      <p className="cv-empty__text">
        {mode === 'litros'
          ? 'Escribe los litros de extracto que tienes y pulsa «Calcular producción». Verás cuántas tiendas completas salen, qué falta o sobra y los materiales que necesitas.'
          : 'Escribe cuántas tiendas quieres surtir y pulsa «Calcular producción». Verás los litros de extracto y los materiales que necesitas.'}
      </p>
      <ul className="cv-empty__list">
        <li>Tiendas y litros</li>
        <li>Cajas y paquetes</li>
        <li>Botellas y bolsas</li>
        <li>Rollos de etiquetas</li>
        <li>Exportación a PDF</li>
      </ul>
    </div>
  );
}
