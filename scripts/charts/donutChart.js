// Minimal accessible SVG donut chart

export function renderDonutChart(container, { pass = 0, fail = 0 }, {
  width = 200,
  height = 200,
  innerRadius = 60,
  passColor = '#22c55e',
  failColor = '#ef4444',
  title = 'PASS vs FAIL',
} = {}) {
  container.textContent = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', title);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));
  const cx = width / 2, cy = height / 2;
  const radius = Math.min(cx, cy) - 4;

  const total = Math.max(1, pass + fail);
  const startAngle = -Math.PI / 2;
  const passAngle = (pass / total) * Math.PI * 2;
  const failAngle = (fail / total) * Math.PI * 2;

  const arc = (start, angle, color) => {
    const end = start + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);

    const path = document.createElementNS(svg.namespaceURI, 'path');
    const d = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`,
      `L ${cx} ${cy}`,
      'Z',
    ].join(' ');
    path.setAttribute('d', d);
    path.setAttribute('fill', color);
    return path;
  };

  // Segments
  const passSeg = arc(startAngle, passAngle, passColor);
  const failSeg = arc(startAngle + passAngle, failAngle, failColor);

  // Donut hole
  const hole = document.createElementNS(svg.namespaceURI, 'circle');
  hole.setAttribute('cx', String(cx));
  hole.setAttribute('cy', String(cy));
  hole.setAttribute('r', String(innerRadius));
  hole.setAttribute('fill', '#fff');

  // Labels
  const label = document.createElementNS(svg.namespaceURI, 'text');
  label.textContent = `${Math.round((pass / total) * 100)}% pass`;
  label.setAttribute('x', String(cx));
  label.setAttribute('y', String(cy));
  label.setAttribute('text-anchor', 'middle');
  label.setAttribute('dominant-baseline', 'central');
  label.setAttribute('style', 'font-size:14px;fill:#111827;');

  svg.appendChild(failSeg);
  svg.appendChild(passSeg);
  svg.appendChild(hole);
  svg.appendChild(label);
  container.appendChild(svg);
}
