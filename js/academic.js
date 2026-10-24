document.querySelectorAll('[data-current-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

document.querySelectorAll('.publication-section').forEach((section) => {
  let nextNumber = 1;

  section.querySelectorAll('ol.publication-list').forEach((list) => {
    list.start = nextNumber;
    nextNumber += list.querySelectorAll(':scope > li.publication').length;
  });
});

const normalizeArticlePath = (value) => {
  const withoutQuery = value.split(/[?#]/, 1)[0];
  return withoutQuery.endsWith('/') ? withoutQuery : `${withoutQuery}/`;
};

const formatArticleMonth = (published) => {
  const date = new Date(`${published.slice(0, 10)}T00:00:00Z`);
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const renderArticleNavigation = (navigation, articles) => {
  const currentPath = normalizeArticlePath(navigation.dataset.articlePath || window.location.pathname);
  const fragment = document.createDocumentFragment();

  articles.forEach((article) => {
    const link = document.createElement('a');
    const time = document.createElement('time');
    const label = document.createElement('span');

    link.href = article.path;
    time.dateTime = article.published.slice(0, 7);
    time.textContent = formatArticleMonth(article.published);
    label.textContent = article.label;

    if (normalizeArticlePath(article.path) === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }

    link.append(time, label);
    fragment.append(link);
  });

  navigation.replaceChildren(fragment);
};

const applyArticleIndex = (articleIndex) => {
  const sections = articleIndex?.sections;
  if (!sections || typeof sections !== 'object') {
    throw new Error('The article index has no sections object.');
  }

  document.querySelectorAll('[data-latest-section]').forEach((link) => {
    const section = link.dataset.latestSection;
    const latestArticle = sections[section]?.[0];
    if (latestArticle) {
      link.href = latestArticle.path;
    }
  });

  document.querySelectorAll('[data-article-section]').forEach((navigation) => {
    const section = navigation.dataset.articleSection;
    const articles = sections[section];
    if (Array.isArray(articles) && articles.length > 0) {
      renderArticleNavigation(navigation, articles);
    }
  });

  const landingSection = document.body.dataset.sectionLanding;
  if (!landingSection) {
    return;
  }

  const latestArticle = sections[landingSection]?.[0];
  if (!latestArticle) {
    throw new Error(`No indexed articles exist for ${landingSection}.`);
  }

  document.querySelectorAll('[data-latest-fallback]').forEach((link) => {
    link.href = latestArticle.path;
  });

  const status = document.querySelector('[data-latest-status]');
  if (status) {
    status.textContent = `Opening “${latestArticle.title}”…`;
  }

  if (normalizeArticlePath(window.location.pathname) !== normalizeArticlePath(latestArticle.path)) {
    window.location.replace(latestArticle.path);
  }
};

const initializeArticleNavigation = async () => {
  try {
    const response = await fetch('/data/articles.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Article index request failed with HTTP ${response.status}.`);
    }
    applyArticleIndex(await response.json());
  } catch (error) {
    console.warn('Automatic article navigation is unavailable.', error);
    const status = document.querySelector('[data-latest-status]');
    if (status) {
      status.textContent = 'Automatic selection failed. Use the article link below.';
    }
  }
};

initializeArticleNavigation();
