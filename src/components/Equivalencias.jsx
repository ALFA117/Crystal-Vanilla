import Icon from './Icon';

const ROWS = [
  ['1 tienda',             '11 cajas · 110 litros · 220 botellas'],
  ['1 caja',               '10 litros · 20 botellas'],
  ['1 paquete de cajas',   '20 cajas (= charolas, es lo mismo)'],
  ['1 bolsa de botellas',  '200 botellas'],
  ['1 rollo de etiquetas', '1,000 etiquetas'],
];

export default function Equivalencias() {
  return (
    <section className="cv-ref" aria-labelledby="cv-ref-title">
      <h2 id="cv-ref-title" className="cv-ref__title">
        <Icon name="ruler" size={16} /> Tabla de equivalencias
      </h2>
      <dl className="cv-ref__list">
        {ROWS.map(([k, v]) => (
          <div key={k} className="cv-ref__row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
