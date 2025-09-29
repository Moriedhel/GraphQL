// Minimal, accessible SVG line/area chart

export function renderLineChart(container, data, {
  width = 600,
  height = 200,
  margin = { top: 16, right: 16, bottom: 24, left: 40 },
  color = '#4f46e5',
  areaOpacity = 0.15,
  title = 'XP over time',
  xLabel = 'Date',
  yLabel = 'XP',
} = {}) {
  container.textContent = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', title);
  svg.setAttribute('width', String(width));
  svg.setAttribute('height', String(height));

  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const g = document.createElementNS(svg.namespaceURI, 'g');
  g.setAttribute('transform', `translate(${margin.left},${margin.top})`);

  // Scales
  const xs = data.length ? data.map(d => new Date(d.key).getTime()) : [0, 1];
  const ys = data.length ? data.map(d => d.total) : [0, 1];
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = 0, yMax = Math.max(1, Math.max(...ys));

  const x = t => innerW * (xMax === xMin ? 0.5 : (t - xMin) / (xMax - xMin));
  const y = v => innerH * (1 - (v - yMin) / (yMax - yMin));

  // Axes (ticks)
  const axisStyle = 'font-size:10px;fill:#555;';
  const mkText = (txt, x0, y0, anchor = 'middle') => {
    const t = document.createElementNS(svg.namespaceURI, 'text');
    t.textContent = txt;
    t.setAttribute('x', x0);
    t.setAttribute('y', y0);
    t.setAttribute('text-anchor', anchor);
    t.setAttribute('style', axisStyle);
    return t;
  };

  // X ticks: first, last, middle
  if (data.length) {
    const tickDates = [new Date(xMin), new Date((xMin + xMax) / 2), new Date(xMax)];
    const fmt = d => d.toISOString().slice(0, 10);
    for (const d of tickDates) {
      const tx = x(d.getTime());
      const t = mkText(fmt(d), tx, innerH + 16);
      g.appendChild(t);
    }
  }

  // Y ticks: 0, mid, max
  for (const v of [0, yMax / 2, yMax]) {
    const ty = y(v);
    const t = mkText(String(Math.round(v)), -8, ty + 3, 'end');
    g.appendChild(t);

    const line = document.createElementNS(svg.namespaceURI, 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('x2', String(innerW));
    line.setAttribute('y1', String(ty));
    line.setAttribute('y2', String(ty));
    line.setAttribute('stroke', '#e5e7eb');
    line.setAttribute('stroke-width', '1');
    g.appendChild(line);
  }

  if (data.length) {
    const path = document.createElementNS(svg.namespaceURI, 'path');
    const area = document.createElementNS(svg.namespaceURI, 'path');

    const dLine = data
      .map((d, i) => {
        const px = x(new Date(d.key).getTime());
        const py = y(d.total);
        return `${i ? 'L' : 'M'}${px},${py}`;
      })
      .join(' ');

    const dArea = `${dLine} L ${x(new Date(data[data.length - 1].key).getTime())},${y(0)} L ${x(new Date(data[0].key).getTime())},${y(0)} Z`;

    area.setAttribute('d', dArea);
    area.setAttribute('fill', color);
    area.setAttribute('opacity', String(areaOpacity));

    path.setAttribute('d', dLine);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');

    g.appendChild(area);
    g.appendChild(path);
  } else {
    const t = document.createElementNS(svg.namespaceURI, 'text');
    t.textContent = 'No data';
    t.setAttribute('x', String(innerW / 2));
    t.setAttribute('y', String(innerH / 2));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('style', 'fill:#6b7280;font-size:12px;');
    g.appendChild(t);
  }

  svg.appendChild(g);
  container.appendChild(svg);
}
