// =============================================
// FELIX AI HUB — App (Router + Render)
// =============================================

// ---- State ----
let currentSection = 'home';
let activeCommandFilter = 'все';
let activeSkillFilter = 'все';
let learned = JSON.parse(localStorage.getItem('felix-learned') || '{}');

// ---- Router ----
function navigate(section) {
  currentSection = section;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('section-' + section);
  if (el) el.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateNavActive(section);
}

function updateNavActive(section) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('nav-active'));
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
  renderAll();
  navigate('home');
});

function renderAll() {
  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderHome()}
    ${renderCommandsSection()}
    ${renderSkillsSection()}
    ${renderAgentsSection()}
    ${renderSetupSection()}
    ${renderAddSection()}
  `;
  restoreLearnedState();
}

// =============================================
// HOME
// =============================================

function renderHome() {
  const quickItems = [
    { emoji: '🌅', title: 'Утренняя разведка', cmd: '/morning', section: 'commands' },
    { emoji: '✍️', title: 'Написать пост', cmd: '/telegram', section: 'commands' },
    { emoji: '🤝', title: 'Новый клиент', cmd: '/client', section: 'commands' },
    { emoji: '🚀', title: 'Начать с нуля', cmd: 'настройка', section: 'setup' },
  ];

  const cats = [
    { emoji: '🔍', name: 'Разведка', filter: 'разведка', count: COMMANDS.filter(c=>c.category==='разведка').length },
    { emoji: '✍️', name: 'Контент', filter: 'контент', count: COMMANDS.filter(c=>c.category==='контент').length },
    { emoji: '💼', name: 'Клиенты', filter: 'клиенты', count: COMMANDS.filter(c=>c.category==='клиенты').length },
    { emoji: '🤖', name: 'Агенты', filter: 'агенты', count: COMMANDS.filter(c=>c.category==='агенты').length + SKILLS.filter(s=>s.category==='агенты').length },
    { emoji: '🎨', name: 'Дизайн', filter: 'дизайн', count: COMMANDS.filter(c=>c.category==='дизайн').length },
    { emoji: '🧰', name: 'Утилиты', filter: 'утилиты', count: COMMANDS.filter(c=>c.category==='утилиты').length },
  ];

  return `
  <section class="section" id="section-home">
    <!-- HERO -->
    <div class="hero">
      <div class="hero-tag">Felix AI Hub v2.0</div>
      <h1>Твой AI-стек.<br>Просто.</h1>
      <p class="hero-sub">31 плагин, 170 скиллов, 90 команд — всё что умеет Felix, объяснено человеческим языком.</p>
      <div class="hero-actions">
        <button class="btn-primary" onclick="navigate('commands')">Смотреть команды</button>
        <button class="btn-secondary" onclick="navigate('skills')">Все скиллы</button>
        <button class="btn-secondary" onclick="navigate('agents')">Как работают агенты</button>
        <button class="btn-secondary" onclick="toggleSearch()">🔍 Найти</button>
      </div>
      <!-- QUICK START -->
      <div class="quick-grid">
        ${quickItems.map(q => `
          <div class="quick-card" onclick="navigate('${q.section}')${q.section === 'commands' ? "; setTimeout(()=>filterCommands('" + (q.cmd === '/morning' ? 'разведка' : q.cmd === '/telegram' ? 'контент' : 'клиенты') + "'), 100)" : ''}">
            <div class="qc-emoji">${q.emoji}</div>
            <div class="qc-title">${q.title}</div>
            <div class="qc-cmd">${q.cmd}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- STATS -->
    <div class="stats-bar">
      <div class="stats-inner">
        <div class="stat-item"><div class="stat-num">31</div><div class="stat-label">плагинов</div></div>
        <div class="stat-item"><div class="stat-num">${COMMANDS.length}</div><div class="stat-label">команд</div></div>
        <div class="stat-item"><div class="stat-num">${SKILLS.length}</div><div class="stat-label">скиллов</div></div>
        <div class="stat-item"><div class="stat-num">170</div><div class="stat-label">скиллов всего</div></div>
        <div class="stat-item"><div class="stat-num" id="learned-count">0</div><div class="stat-label">изучено тобой</div></div>
      </div>
    </div>

    <!-- CATEGORIES -->
    <div class="home-categories">
      <h2>Что умеет Felix</h2>
      <p>Выбери категорию чтобы увидеть команды</p>
      <div class="cat-grid">
        ${cats.map(c => `
          <div class="cat-card" onclick="navigate('commands'); setTimeout(()=>filterCommands('${c.filter}'),100)">
            <div class="cat-emoji">${c.emoji}</div>
            <div class="cat-name">${c.name}</div>
            <div class="cat-count">${c.count} команд</div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

// =============================================
// COMMANDS
// =============================================

function renderCommandsSection() {
  const categories = ['все', 'разведка', 'контент', 'клиенты', 'агенты', 'дизайн', 'утилиты'];

  return `
  <section class="section" id="section-commands">
    <div class="container">
      <h2 class="section-title">Команды</h2>
      <p class="section-sub">${COMMANDS.length} команд — что написать Claude чтобы что-то сделалось</p>

      <!-- PROGRESS -->
      <div class="progress-bar-wrap">
        <div class="progress-bar"><div class="progress-fill" id="cmd-progress-fill" style="width:0%"></div></div>
        <div class="progress-text" id="cmd-progress-text">0 / ${COMMANDS.length} изучено</div>
      </div>

      <!-- FILTERS -->
      <div class="filter-tags" id="commandFilters">
        ${categories.map(cat => `
          <button class="tag ${cat==='все'?'active':''}" onclick="filterCommands('${cat}')">${cat}</button>
        `).join('')}
      </div>

      <!-- CARDS -->
      <div class="cards-grid" id="commandsGrid">
        ${COMMANDS.map(cmd => renderCommandCard(cmd)).join('')}
      </div>
    </div>
  </section>`;
}

function renderCommandCard(cmd) {
  const isLearned = learned[cmd.id] ? 'done' : '';
  return `
  <div class="card command-card" data-category="${cmd.category}" data-id="${cmd.id}">
    <div class="card-header">
      <div class="card-emoji">${cmd.emoji}</div>
      <div class="card-meta">
        <div class="card-cmd">${cmd.cmd}</div>
        <div class="card-title">${cmd.title}</div>
        <span class="card-badge badge-${cmd.category}">${cmd.category}</span>
      </div>
    </div>
    ${cmd.needsSetup ? '<div class="setup-needed">⚠️ Требует /setup перед первым использованием</div>' : ''}
    <div class="card-desc">${cmd.desc}</div>
    <div class="card-time"><span>⏱ ${cmd.time}</span></div>
    <div class="card-rules">
      <div class="rule rule-do">✅ ${cmd.do}</div>
      <div class="rule rule-dont">❌ ${cmd.dont}</div>
      <div class="rule rule-also">💡 ${cmd.also}</div>
    </div>
    ${cmd.flags && cmd.flags.length > 0 ? `
    <div class="card-flags">
      ${cmd.flags.map(f => `<span class="flag">${f}</span>`).join('')}
    </div>` : ''}
    <div class="card-actions">
      <button class="btn-copy" onclick="copyCmd('${cmd.cmd}', event)">Скопировать ${cmd.cmd}</button>
      <button class="btn-learned ${isLearned}" id="learned-${cmd.id}" onclick="toggleLearned('${cmd.id}', event)" title="${isLearned ? 'Отметить как не изучено' : 'Отметить как изучено'}">
        ${isLearned ? '✓' : '○'}
      </button>
    </div>
  </div>`;
}

function filterCommands(category) {
  activeCommandFilter = category;
  // update tags
  document.querySelectorAll('#commandFilters .tag').forEach(t => {
    t.classList.toggle('active', t.textContent.trim() === category);
  });
  // show/hide cards
  document.querySelectorAll('.command-card').forEach(card => {
    const show = category === 'все' || card.dataset.category === category;
    card.style.display = show ? '' : 'none';
  });
}

// =============================================
// SKILLS
// =============================================

function renderSkillsSection() {
  const categories = ['все', 'контент', 'маркетинг', 'разведка', 'агенты', 'дизайн', 'клиенты', 'утилиты'];
  return `
  <section class="section" id="section-skills">
    <div class="container">
      <h2 class="section-title">Скиллы</h2>
      <p class="section-sub">${SKILLS.length} ключевых скиллов — движки внутри плагинов</p>

      <!-- FILTERS -->
      <div class="filter-tags" id="skillFilters">
        ${categories.map(cat => `
          <button class="tag ${cat==='все'?'active':''}" onclick="filterSkills('${cat}')">${cat}</button>
        `).join('')}
      </div>

      <!-- CARDS -->
      <div class="cards-grid" id="skillsGrid">
        ${SKILLS.map(skill => renderSkillCard(skill)).join('')}
      </div>
    </div>
  </section>`;
}

function renderSkillCard(skill) {
  return `
  <div class="skill-card" data-category="${skill.category}" data-id="${skill.id}">
    <div class="card-header">
      <div class="card-emoji">${skill.emoji}</div>
      <div class="card-meta">
        <div class="card-title">${skill.title}</div>
        <span class="card-badge badge-${skill.category}">${skill.category}</span>
      </div>
    </div>
    <div class="card-desc">${skill.desc}</div>
    <div class="skill-blondes">"${skill.blondes}"</div>
    <div class="skill-when">
      <div class="skill-when-title">Когда использовать</div>
      <ul>${skill.use_when.map(w => `<li>${w}</li>`).join('')}</ul>
    </div>
    ${skill.dont_use && skill.dont_use.length > 0 ? `
    <div class="skill-when" style="margin-top:10px">
      <div class="skill-when-title" style="color:#b71c1c">Когда НЕ нужен</div>
      <ul style="color:#b71c1c">${skill.dont_use.map(d => `<li>${d}</li>`).join('')}</ul>
    </div>` : ''}
    <div class="skill-trigger">${skill.trigger}</div>
    <div style="margin-top:12px">
      <button class="btn-copy" onclick="copyCmd('${skill.trigger}', event)">Скопировать команду</button>
    </div>
  </div>`;
}

function filterSkills(category) {
  activeSkillFilter = category;
  document.querySelectorAll('#skillFilters .tag').forEach(t => {
    t.classList.toggle('active', t.textContent.trim() === category);
  });
  document.querySelectorAll('.skill-card').forEach(card => {
    const show = category === 'все' || card.dataset.category === category;
    card.style.display = show ? '' : 'none';
  });
}

// =============================================
// AGENTS
// =============================================

function renderAgentsSection() {
  const patterns = [
    {
      icon: '👑',
      name: 'Supervisor',
      desc: 'Один агент-координатор управляет остальными. Раздаёт задачи, собирает результаты, синтезирует.',
      example: 'Катя: "подготовь маркетинг-кит для клиента" → Supervisor разбивает на: исследование, ICP, контент-план, battlecard — и запускает 4 подагентов параллельно.'
    },
    {
      icon: '🔗',
      name: 'Pipeline',
      desc: 'Цепочка агентов: результат одного — вход для следующего. Последовательная обработка.',
      example: 'Для Navirost: Агент 1 исследует конкурентов → Агент 2 пишет оффер на основе данных → Агент 3 делает лендинг → Агент 4 пишет контент-план запуска.'
    },
    {
      icon: '⚖️',
      name: 'Debate',
      desc: 'Два агента с противоположными ролями спорят о задаче. Один за, один против. Ты видишь оба лагеря.',
      example: 'Катя думает поднять цену на консалтинг: Агент-1 (за повышение) vs Агент-2 (против). Ты видишь оба аргумента и принимаешь взвешенное решение.'
    }
  ];

  const spawns = [
    {
      title: '🗓 Контент-план на месяц',
      prompt: `/agents
ЦЕЛЬ: Создать полный контент-план на следующий месяц
ПАТТЕРН: pipeline

Агент 1 → /trends → найди 5 актуальных трендов в нише
Агент 2 → на основе трендов сгенерируй 20 тем постов
Агент 3 → распредели по форматам (telegram/reels/carousel/article)
Агент 4 → составь таблицу с датами, форматами и KPI`
    },
    {
      title: '🔍 Анализ конкурентов',
      prompt: `/agents
ЦЕЛЬ: Глубокий анализ 3 конкурентов
ПАТТЕРН: supervisor

Агент 1 → анализ Telegram-каналов конкурентов (посты за месяц)
Агент 2 → анализ их сайтов и офферов
Агент 3 → анализ отзывов и комментариев
Координатор → синтез: где дыры, где мы сильнее`
    },
    {
      title: '🤝 Онбординг клиента',
      prompt: `/agents
ЦЕЛЬ: Полный онбординг нового клиента
ПАТТЕРН: pipeline

Агент 1 → /client (интервью с клиентом, 30 вопросов)
Агент 2 → создай marketing brief на основе интервью
Агент 3 → /strategy --fast для клиента
Агент 4 → первый контент-план на 2 недели`
    }
  ];

  const errors = [
    { title: 'Запустил /morning без /setup', desc: 'Ошибка NotebookLM — notebooks не найдены. Сначала один раз запусти /setup.' },
    { title: 'Пишу контент без /client', desc: 'Контент получается generic, без голоса клиента. Всегда начинай с онбординга.' },
    { title: 'Использую /agents для простого поста', desc: 'Агенты — для сложных задач. Один пост — просто /telegram.' },
    { title: 'Жду готовый стратегию за 5 минут', desc: '/strategy — это 45–90 минут диалога. Это инвестиция, не быстрый ответ.' },
    { title: 'Не читаю результат /morning', desc: 'Разведка работает только если ты её читаешь. Иначе это просто трата времени.' },
    { title: 'Копирую текст без human-style', desc: 'AI-тексты "пахнут ChatGPT". Всегда прогоняй через human-style или проси живой голос.' },
  ];

  return `
  <section class="section" id="section-agents">
    <div class="container">
      <h2 class="section-title">Агенты</h2>
      <p class="section-sub">Как работают AI-агенты и когда их использовать</p>

      <!-- INTRO -->
      <div class="agents-intro">
        Агент — это <strong>Claude, которому дали роль и цель</strong>. Один Claude — один разговор. Несколько агентов — это как нанять команду: один исследует, другой пишет, третий проверяет — <strong>всё параллельно</strong>. Используй когда задача слишком большая для одного чата.
      </div>

      <!-- PATTERNS -->
      <h3 style="font-size:22px;font-weight:700;margin-bottom:20px;letter-spacing:-0.5px">3 паттерна работы</h3>
      <div class="agent-patterns">
        ${patterns.map(p => `
          <div class="pattern-card">
            <div class="pattern-icon">${p.icon}</div>
            <div class="pattern-name">${p.name}</div>
            <div class="pattern-desc">${p.desc}</div>
            <div class="pattern-example">📌 ${p.example}</div>
          </div>
        `).join('')}
      </div>

      <!-- SPAWN PROMPTS -->
      <h3 style="font-size:22px;font-weight:700;margin-bottom:20px;letter-spacing:-0.5px">Готовые шаблоны</h3>
      <div class="spawn-prompts">
        ${spawns.map(s => `
          <div class="spawn-prompt-card">
            <div class="spawn-title">${s.title}</div>
            <div class="spawn-code">${s.prompt}</div>
            <button class="btn-copy" onclick="copyText(\`${s.prompt.replace(/`/g, '\\`')}\`, event)">Скопировать шаблон</button>
          </div>
        `).join('')}
      </div>

      <!-- ERRORS -->
      <h3 style="font-size:22px;font-weight:700;margin-bottom:20px;letter-spacing:-0.5px">Частые ошибки</h3>
      <div class="errors-block">
        ${errors.map(e => `
          <div class="error-card">
            <strong>❌ ${e.title}</strong>
            ${e.desc}
          </div>
        `).join('')}
      </div>
    </div>
  </section>`;
}

// =============================================
// SETUP SECTION
// =============================================

function renderSetupSection() {
  const selfSteps = [
    {
      num: '1',
      emoji: '✅',
      title: 'Плагины установлены',
      desc: 'У тебя уже 31 плагин в ~/Documents/Felix/plugins/. Ничего устанавливать не надо — ты это уже прошла.',
      cmd: null,
      time: 'Готово'
    },
    {
      num: '2',
      emoji: '🔌',
      title: 'Подключи NotebookLM MCP',
      desc: 'MCP уже прописан в .mcp.json. При следующем открытии Claude Code — он подключится автоматически. Проверь: должен появиться notebooklm-mcp в списке инструментов.',
      cmd: null,
      time: 'Готово'
    },
    {
      num: '3',
      emoji: '⚙️',
      title: 'Настрой разведку (один раз)',
      desc: 'Запусти /setup — он создаст notebooks в NotebookLM и подключит источники (конкуренты, тренды, YouTube). Делается один раз, занимает 15–20 минут.',
      cmd: '/setup',
      time: '15–20 мин, 1 раз'
    },
    {
      num: '4',
      emoji: '🌅',
      title: 'Каждое утро — /morning',
      desc: 'Открываешь Claude Code → пишешь /morning → за 5–10 минут получаешь: тренды, что делают конкуренты, 5 идей для постов. Это твоя ежедневная разведка.',
      cmd: '/morning',
      time: '5–10 мин, ежедневно'
    },
    {
      num: '5',
      emoji: '✍️',
      title: 'Напиши первый пост',
      desc: 'После /morning у тебя есть тема. Пиши: /telegram [тема из разведки]. Получаешь готовый пост под твой голос. Если надо причесать — попроси human-style.',
      cmd: '/telegram',
      time: '5–7 мин'
    },
    {
      num: '6',
      emoji: '🤝',
      title: 'Первый клиент через /client',
      desc: 'Новый клиент? Запусти /client — агент проведёт 30-вопросный онбординг, соберёт бриф, создаст маркетинговый профиль. Всё сохранится в Felix-Vault.',
      cmd: '/client',
      time: '30–45 мин'
    },
    {
      num: '7',
      emoji: '📈',
      title: 'Стратегия за один сеанс',
      desc: 'Для себя или клиента: /strategy. Это диалог на 45–90 минут — глубокий разбор ниши, ICP, позиционирование, контент-стратегия. Результат: документ на 10+ страниц.',
      cmd: '/strategy',
      time: '45–90 мин'
    }
  ];

  const clientSteps = [
    {
      step: 'Шаг 1',
      title: 'Онбординг клиента',
      cmd: '/client',
      desc: 'Запускаешь /client — агент задаёт 30 структурных вопросов о бизнесе клиента. Записывает голос, боли, ICP, цели. Создаёт файл профиля.',
      result: 'Готовый маркетинговый профиль клиента',
      time: '30–45 мин'
    },
    {
      step: 'Шаг 2',
      title: 'Маркетинговая стратегия',
      cmd: '/strategy',
      desc: 'На основе профиля запускаешь /strategy. Агент строит полную стратегию: позиционирование, воронка, каналы, KPI, контент-микс.',
      result: 'Документ стратегии 10+ страниц',
      time: '45–90 мин'
    },
    {
      step: 'Шаг 3',
      title: 'Карточка конкурентов',
      cmd: '/battlecard',
      desc: '/battlecard — анализ 3–5 прямых конкурентов клиента. Сильные/слабые стороны, где клиент выигрывает, где проигрывает, как позиционировать.',
      result: 'Battlecard для отдела продаж',
      time: '20–30 мин'
    },
    {
      step: 'Шаг 4',
      title: 'Контент-план',
      cmd: '/plan',
      desc: '/plan — месячный контент-план по всем каналам. Форматы, темы, частота, CTA. Привязан к стратегии из шага 2.',
      result: 'Таблица с 20–30 единицами контента',
      time: '15–20 мин'
    },
    {
      step: 'Шаг 5',
      title: 'Производство контента',
      cmd: '/telegram + /reels + /carousel',
      desc: 'Далее производство: /telegram для постов в Telegram/VK, /reels для сценариев Reels, /carousel для карусели. Всё в голосе клиента.',
      result: 'Готовый контент под публикацию',
      time: '5–10 мин/единица'
    }
  ];

  const sellItems = [
    {
      emoji: '📊',
      title: 'Маркетинг-стратегия под ключ',
      price: '75 000 – 150 000 ₽',
      what: 'Полный аудит + стратегия + battlecard + первый контент-план. Один раз на 3–6 месяцев.',
      commands: ['/client', '/strategy', '/battlecard', '/plan'],
      who: 'Малый бизнес, эксперты, стартапы',
      usp: 'Ты даёшь не "консультацию", а документ с конкретными шагами и контентом на старт.'
    },
    {
      emoji: '🏭',
      title: 'Контент-фабрика (абонемент)',
      price: 'от 50 000 ₽/мес',
      what: 'Еженедельный контент-план + производство постов/reels/carousel. Поставка готового контента.',
      commands: ['/morning', '/plan', '/telegram', '/reels', '/carousel'],
      who: 'Предприниматели которым некогда, но нужен контент',
      usp: 'Не SMM-менеджер — AI-фабрика с твоим надзором. Скорость x5, стоимость в 2 раза ниже агентства.'
    },
    {
      emoji: '🛠️',
      title: 'Настройка AI-стека для бизнеса',
      price: '30 000 – 80 000 ₽',
      what: 'Установка Felix-стека, настройка под нишу клиента, обучение команды работе с командами.',
      commands: ['/setup', '/client', '/agents'],
      who: 'Бизнес который хочет внедрить AI в работу',
      usp: 'Ты продаёшь инфраструктуру + обучение = клиент становится самостоятельным.'
    },
    {
      emoji: '🎓',
      title: 'Обучение команды (воркшоп)',
      price: '50 000 – 100 000 ₽',
      what: '1–2 дневный воркшоп: что такое агенты, как работать с Claude, как автоматизировать маркетинг.',
      commands: ['/agents', '/spawn', '/strategy'],
      who: 'Маркетинг-команды, digital-агентства',
      usp: 'После воркшопа команда умеет сама запускать агентов и сокращает время на контент в 3–5 раз.'
    },
    {
      emoji: '🌐',
      title: 'Лендинг / сайт за 1 день',
      price: 'от 30 000 ₽',
      what: 'Через /ds команда из 7 дизайн-агентов собирает полноценный сайт за 3–5 часов.',
      commands: ['/ds'],
      who: 'Эксперты, стартапы, малый бизнес',
      usp: 'Скорость разработки в 10 раз быстрее агентства при сравнимом качестве.'
    },
    {
      emoji: '🔍',
      title: 'Конкурентная разведка',
      price: '15 000 – 40 000 ₽',
      what: 'Глубокий анализ 3–5 конкурентов: контент, офферы, цены, слабые места. Отчёт за 1–2 дня.',
      commands: ['/competitors', '/battlecard', '/trends'],
      who: 'Бизнес перед запуском или репозиционированием',
      usp: 'То что агентства делают за 2 недели и 200к — ты делаешь за 2 дня.'
    }
  ];

  return `
  <section class="section" id="section-setup">
    <div class="container">
      <h2 class="section-title">Настройка</h2>
      <p class="section-sub">Как начать, как работать с клиентами и что можно продавать</p>

      <!-- TABS -->
      <div class="setup-tabs" id="setupTabs">
        <button class="setup-tab active" onclick="switchSetupTab('self', this)">🚀 Старт для себя</button>
        <button class="setup-tab" onclick="switchSetupTab('clients', this)">🤝 Для клиентов</button>
        <button class="setup-tab" onclick="switchSetupTab('sell', this)">💰 Что продавать</button>
      </div>

      <!-- TAB: SELF -->
      <div class="setup-content" id="setup-tab-self">
        <div class="setup-intro">
          Ты уже прошла онбординг — плагины установлены. Осталось <strong>3 шага чтобы всё заработало</strong>, и потом ежедневная рутина из 2 команд.
        </div>
        <div class="setup-steps">
          ${selfSteps.map(s => `
            <div class="setup-step ${s.time === 'Готово' ? 'step-done' : ''}">
              <div class="step-num">${s.time === 'Готово' ? '✓' : s.num}</div>
              <div class="step-body">
                <div class="step-title">${s.emoji} ${s.title}
                  <span class="step-time">${s.time}</span>
                </div>
                <div class="step-desc">${s.desc}</div>
                ${s.cmd ? `<button class="btn-copy step-cmd-btn" onclick="copyCmd('${s.cmd}', event)">Скопировать ${s.cmd}</button>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="setup-tip">
          <strong>💡 После шага 4:</strong> Felix работает как утренняя газета + копирайтер + стратег в одном. Открываешь Claude Code → /morning → /telegram → всё.
        </div>
      </div>

      <!-- TAB: CLIENTS -->
      <div class="setup-content hidden" id="setup-tab-clients">
        <div class="setup-intro">
          Стандартный пайплайн работы с клиентом: от онбординга до контента. Занимает <strong>2–3 сессии</strong>, даёт документы на весь цикл.
        </div>
        <div class="client-pipeline">
          ${clientSteps.map((s, i) => `
            <div class="pipeline-step">
              <div class="pipeline-connector ${i === 0 ? 'first' : ''}"></div>
              <div class="pipeline-card">
                <div class="pipeline-step-label">${s.step}</div>
                <div class="pipeline-title">${s.title}</div>
                <div class="pipeline-cmd-badge">${s.cmd}</div>
                <div class="pipeline-desc">${s.desc}</div>
                <div class="pipeline-meta">
                  <span class="pipeline-result">→ ${s.result}</span>
                  <span class="pipeline-time">⏱ ${s.time}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="setup-tip">
          <strong>💡 Про голос клиента:</strong> После /client его голос сохраняется в профиле. Все следующие команды (/telegram, /reels, /carousel) автоматически используют этот голос — контент звучит как он, не как ChatGPT.
        </div>
      </div>

      <!-- TAB: SELL -->
      <div class="setup-content hidden" id="setup-tab-sell">
        <div class="setup-intro">
          Что ты реально можешь продавать прямо сейчас, используя Felix. Цены — ориентиры для российского рынка B2B/B2C.
        </div>
        <div class="sell-grid">
          ${sellItems.map(item => `
            <div class="sell-card">
              <div class="sell-emoji">${item.emoji}</div>
              <div class="sell-title">${item.title}</div>
              <div class="sell-price">${item.price}</div>
              <div class="sell-what">${item.what}</div>
              <div class="sell-commands">
                ${item.commands.map(c => `<span class="sell-cmd">${c}</span>`).join('')}
              </div>
              <div class="sell-who"><strong>Кому:</strong> ${item.who}</div>
              <div class="sell-usp"><strong>Почему купят:</strong> ${item.usp}</div>
            </div>
          `).join('')}
        </div>
        <div class="setup-tip">
          <strong>💡 Стратегия продаж:</strong> Начни с "маркетинг-стратегии под ключ" — это твой основной чек. Потом предложи абонемент на контент. Среднее LTV клиента = 3–6 месяцев × 50–150к = 150к–900к.
        </div>
      </div>
    </div>
  </section>`;
}

function switchSetupTab(tab, btn) {
  document.querySelectorAll('.setup-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.setup-content').forEach(c => c.classList.add('hidden'));
  document.getElementById('setup-tab-' + tab).classList.remove('hidden');
}

// =============================================
// ADD SECTION
// =============================================

function renderAddSection() {
  return `
  <section class="section" id="section-add">
    <div class="add-section">
      <h2>Добавить в Felix</h2>
      <p class="add-sub">Нашла команду или скилл которого нет на сайте? Заполни форму — получишь JSON для добавления.</p>

      <form id="add-form" onsubmit="submitAddForm(event)">
        <div class="form-group">
          <label class="form-label">Команда (например /myskill)</label>
          <input class="form-input" id="add-cmd" placeholder="/my-command" type="text">
        </div>
        <div class="form-group">
          <label class="form-label">Название</label>
          <input class="form-input" id="add-title" placeholder="Короткое название" type="text" required>
        </div>
        <div class="form-group">
          <label class="form-label">Что делает (простыми словами)</label>
          <textarea class="form-textarea" id="add-desc" placeholder="Опиши одним-двумя предложениями что происходит когда запускаешь эту команду" required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Когда использовать</label>
          <textarea class="form-textarea" id="add-when" placeholder="Описание ситуации когда это нужно" style="min-height:70px"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Из какого плагина</label>
          <input class="form-input" id="add-plugin" placeholder="название-плагина" type="text">
        </div>
        <div class="form-group">
          <label class="form-label">Категория</label>
          <select class="form-select" id="add-category">
            <option value="разведка">Разведка</option>
            <option value="контент">Контент</option>
            <option value="клиенты">Клиенты / Маркетинг</option>
            <option value="агенты">Агенты</option>
            <option value="дизайн">Дизайн</option>
            <option value="утилиты">Утилиты</option>
          </select>
        </div>
        <button type="submit" class="btn-submit">Сгенерировать JSON</button>
      </form>

      <div class="add-result" id="add-result">
        <h4>Скопируй это и отправь мне (Claude) чтобы я добавил в сайт:</h4>
        <pre id="add-result-code"></pre>
        <button class="btn-copy" onclick="copyText(document.getElementById('add-result-code').textContent, event)">Скопировать JSON</button>
      </div>
    </div>
  </section>`;
}

function submitAddForm(e) {
  e.preventDefault();
  const obj = {
    id: (document.getElementById('add-cmd').value || document.getElementById('add-title').value).replace(/[^a-z0-9]/gi, '-').toLowerCase(),
    cmd: document.getElementById('add-cmd').value || null,
    title: document.getElementById('add-title').value,
    category: document.getElementById('add-category').value,
    desc: document.getElementById('add-desc').value,
    when: document.getElementById('add-when').value,
    plugin: document.getElementById('add-plugin').value || 'unknown',
    emoji: '⚡',
    do: 'Заполни это поле',
    dont: 'Заполни это поле',
    also: 'Заполни это поле'
  };
  const result = document.getElementById('add-result');
  document.getElementById('add-result-code').textContent = JSON.stringify(obj, null, 2);
  result.classList.add('visible');
  result.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================
// LEARNED / PROGRESS
// =============================================

function toggleLearned(id, e) {
  e.stopPropagation();
  learned[id] = !learned[id];
  if (!learned[id]) delete learned[id];
  localStorage.setItem('felix-learned', JSON.stringify(learned));
  const btn = document.getElementById('learned-' + id);
  if (btn) {
    btn.classList.toggle('done', !!learned[id]);
    btn.textContent = learned[id] ? '✓' : '○';
  }
  updateProgress();
}

function restoreLearnedState() {
  Object.keys(learned).forEach(id => {
    const btn = document.getElementById('learned-' + id);
    if (btn) { btn.classList.add('done'); btn.textContent = '✓'; }
  });
  updateProgress();
}

function updateProgress() {
  const count = Object.keys(learned).length;
  const fill = document.getElementById('cmd-progress-fill');
  const text = document.getElementById('cmd-progress-text');
  const lc = document.getElementById('learned-count');
  if (fill) fill.style.width = `${Math.round(count / COMMANDS.length * 100)}%`;
  if (text) text.textContent = `${count} / ${COMMANDS.length} изучено`;
  if (lc) lc.textContent = count;
}

// =============================================
// COPY
// =============================================

function copyCmd(cmd, e) {
  if (e) e.stopPropagation();
  navigator.clipboard.writeText(cmd).then(() => showToast('Скопировано!')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = cmd; document.body.appendChild(ta);
    ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Скопировано!');
  });
}

function copyText(text, e) {
  if (e) e.stopPropagation();
  navigator.clipboard.writeText(text).then(() => showToast('Скопировано!')).catch(() => showToast('Ошибка'));
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// =============================================
// MOBILE MENU
// =============================================

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

// =============================================
// SEARCH
// =============================================

function toggleSearch() {
  const overlay = document.getElementById('searchOverlay');
  overlay.classList.toggle('open');
  if (overlay.classList.contains('open')) {
    setTimeout(() => document.getElementById('searchInput').focus(), 50);
  } else {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
  }
}

function closeSearch(e) {
  if (e.target === document.getElementById('searchOverlay')) toggleSearch();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const overlay = document.getElementById('searchOverlay');
    if (overlay && overlay.classList.contains('open')) toggleSearch();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    toggleSearch();
  }
});
