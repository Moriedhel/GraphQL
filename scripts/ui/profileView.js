import { fetchGraphQL, QUERY_USER, QUERY_RESULTS_NESTED, QUERY_TRANSACTIONS_XP, QUERY_OBJECT_BY_ID, QUERY_OBJECTS_BY_IDS } from '../gql.js';
import { groupXpByDate, passFailFromResults } from '../data.js';
import { renderLineChart } from '../charts/lineChart.js';
import { renderDonutChart } from '../charts/donutChart.js';

export async function mountProfileView(root, abortController) {
  root.innerHTML = '';

  const header = document.createElement('header');
  header.innerHTML = `
    <h1>Profile</h1>
    <button id="logoutBtn" aria-label="Logout">Logout</button>
  `;
  root.appendChild(header);

  const main = document.createElement('main');
  const sections = {
    user: document.createElement('section'),
    xp: document.createElement('section'),
    charts: document.createElement('section'),
  };

  sections.user.innerHTML = '<h2>Basic Info</h2>';
  sections.xp.innerHTML = '<h2>Total XP</h2>';
  sections.charts.innerHTML = '<h2>Statistics</h2>';

  main.appendChild(sections.user);
  main.appendChild(sections.xp);
  main.appendChild(sections.charts);
  root.appendChild(main);

  // Bind logout event (handled by main.js to avoid circular dep)
  // A custom event dispatch
  header.querySelector('#logoutBtn').addEventListener('click', () => {
    root.dispatchEvent(new CustomEvent('logout', { bubbles: true }));
  });

  // Fetch data in parallel
  try {
    const signal = abortController?.signal;
    const [userData, resultsData, txData] = await Promise.all([
      fetchGraphQL(QUERY_USER, {}, { signal }),
      fetchGraphQL(QUERY_RESULTS_NESTED, { limit: 200 }, { signal }),
      fetchGraphQL(QUERY_TRANSACTIONS_XP, {}, { signal }),
    ]);

    // User section
    const user = userData.user?.[0];
    const info = document.createElement('div');
    info.className = 'card';
    info.innerHTML = '';
    const ul = document.createElement('ul');
    const add = (k, v) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${k}: `;
      const span = document.createElement('span');
      span.textContent = v ?? '-';
      li.appendChild(strong);
      li.appendChild(span);
      ul.appendChild(li);
    };
    add('ID', user?.id);
    add('Login', user?.login);
    add('Email', user?.email || '—');
    info.appendChild(ul);
    sections.user.appendChild(info);

    // XP section
    const tx = txData.transaction || [];
    const totalXp = tx.reduce((s, t) => s + (t.amount || 0), 0);
    const p = document.createElement('p');
    p.textContent = `${totalXp} XP total`;
    sections.xp.appendChild(p);

    // Recent projects with XP by project (argument query: objects by IDs)
    const objectIds = Array.from(new Set((tx || []).map(t => t.objectId).filter(Boolean))).slice(0, 50);
    let objectsById = new Map();
    if (objectIds.length) {
      const objsData = await fetchGraphQL(QUERY_OBJECTS_BY_IDS, { ids: objectIds }, { signal });
      const arr = objsData.object || [];
      objectsById = new Map(arr.map(o => [o.id, { name: o.name, type: o.type }]));
    }
    const projSection = document.createElement('section');
    projSection.innerHTML = '<h2>Recent Projects</h2>';
    const list = document.createElement('ul');
    const byProject = new Map();
    for (const t of tx) {
      const name = objectsById.get(t.objectId)?.name || `#${t.objectId}`;
      byProject.set(name, (byProject.get(name) || 0) + (t.amount || 0));
    }
    const items = Array.from(byProject, ([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    for (const it of items) {
      const li = document.createElement('li');
      const s = document.createElement('span');
      s.textContent = it.name;
      const v = document.createElement('strong');
      v.textContent = ` ${it.total} XP`;
      li.appendChild(s);
      li.appendChild(v);
      list.appendChild(li);
    }
    projSection.appendChild(list);
    sections.xp.appendChild(projSection);

    // Charts
    const xpSeries = groupXpByDate(tx);
    const lineWrap = document.createElement('div');
    lineWrap.className = 'chart';
    renderLineChart(lineWrap, xpSeries, { title: 'XP earned over time' });

    const pf = passFailFromResults(resultsData.result || []);
    const donutWrap = document.createElement('div');
    donutWrap.className = 'chart';
    renderDonutChart(donutWrap, pf, { title: 'Pass vs Fail' });

    sections.charts.appendChild(lineWrap);
    sections.charts.appendChild(donutWrap);

  } catch (ex) {
    const err = document.createElement('p');
    err.className = 'error';
    err.textContent = `Failed to load profile: ${ex.message || ex}`;
    root.appendChild(err);
  }
}
