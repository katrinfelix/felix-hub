// =============================================
// FELIX AI HUB — Search
// =============================================

function doSearch(query) {
  const q = query.toLowerCase().trim();
  const resultsEl = document.getElementById('searchResults');

  if (!q) {
    resultsEl.innerHTML = '';
    return;
  }

  const cmdResults = COMMANDS.filter(c =>
    c.cmd.toLowerCase().includes(q) ||
    c.title.toLowerCase().includes(q) ||
    c.desc.toLowerCase().includes(q) ||
    c.category.toLowerCase().includes(q) ||
    (c.do && c.do.toLowerCase().includes(q))
  );

  const skillResults = SKILLS.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.desc.toLowerCase().includes(q) ||
    s.blondes.toLowerCase().includes(q) ||
    s.category.toLowerCase().includes(q) ||
    s.use_when.some(w => w.toLowerCase().includes(q))
  );

  const all = [
    ...cmdResults.map(c => ({ type: 'cmd', data: c })),
    ...skillResults.map(s => ({ type: 'skill', data: s }))
  ];

  if (all.length === 0) {
    resultsEl.innerHTML = `<div class="search-empty">Ничего не найдено по запросу "${query}"</div>`;
    return;
  }

  resultsEl.innerHTML = all.slice(0, 12).map(item => {
    const d = item.data;
    if (item.type === 'cmd') {
      return `
        <div class="search-item" onclick="handleSearchResult('commands', '${d.id}')">
          <div class="si-emoji">${d.emoji}</div>
          <div class="si-meta">
            <div class="si-cmd">${d.cmd} · ${d.category}</div>
            <div class="si-title">${d.title}</div>
            <div class="si-desc">${d.desc.substring(0, 80)}...</div>
          </div>
        </div>`;
    } else {
      return `
        <div class="search-item" onclick="handleSearchResult('skills', '${d.id}')">
          <div class="si-emoji">${d.emoji}</div>
          <div class="si-meta">
            <div class="si-cmd">скилл · ${d.category}</div>
            <div class="si-title">${d.title}</div>
            <div class="si-desc">${d.desc.substring(0, 80)}...</div>
          </div>
        </div>`;
    }
  }).join('');
}

function handleSearchResult(section, id) {
  toggleSearch();
  navigate(section);
  setTimeout(() => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.boxShadow = '0 0 0 3px rgba(0,113,227,0.4)';
      setTimeout(() => { el.style.boxShadow = ''; }, 2000);
    }
  }, 200);
}
