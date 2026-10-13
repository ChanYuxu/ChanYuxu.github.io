import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const browserScript = await readFile(path.join(repositoryRoot, "js", "academic.js"), "utf8");
const articleIndex = JSON.parse(
  await readFile(path.join(repositoryRoot, "data", "articles.json"), "utf8"),
);
const latestDomainTheoryPath = articleIndex.sections["domain-theory"][0].path;
const latestAi4MathPath = articleIndex.sections.ai4math[0].path;
const latestNotesPath = articleIndex.sections.notes[0].path;

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(value) {
    this.values.add(value);
  }

  contains(value) {
    return this.values.has(value);
  }
}

class FakeNode {
  constructor(tagName = "") {
    this.tagName = tagName;
    this.children = [];
    this.dataset = {};
    this.attributes = {};
    this.classList = new FakeClassList();
    this.href = "";
    this.textContent = "";
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  replaceChildren(...nodes) {
    this.children = nodes.flatMap((node) => (
      node instanceof FakeFragment ? node.children : [node]
    ));
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }
}

class FakeFragment extends FakeNode {}

async function executeNavigation({ articleSection = "ai4math", landingSection = null, pathname }) {
  const sectionLinks = [
    Object.assign(new FakeNode("a"), { dataset: { latestSection: "domain-theory" } }),
    Object.assign(new FakeNode("a"), { dataset: { latestSection: "ai4math" } }),
    Object.assign(new FakeNode("a"), { dataset: { latestSection: "notes" } }),
  ];
  const articleNavigation = Object.assign(new FakeNode("nav"), {
    dataset: { articleSection },
  });
  const fallback = new FakeNode("a");
  const status = new FakeNode("p");
  const warnings = [];
  const location = {
    pathname,
    replacedWith: null,
    replace(value) {
      this.replacedWith = value;
    },
  };

  const document = {
    body: { dataset: landingSection ? { sectionLanding: landingSection } : {} },
    createDocumentFragment: () => new FakeFragment(),
    createElement: (tagName) => new FakeNode(tagName),
    querySelector(selector) {
      return selector === "[data-latest-status]" ? status : null;
    },
    querySelectorAll(selector) {
      switch (selector) {
        case "[data-current-year]":
        case ".publication-section":
          return [];
        case "[data-latest-section]":
          return sectionLinks;
        case "[data-article-section]":
          return [articleNavigation];
        case "[data-latest-fallback]":
          return [fallback];
        default:
          return [];
      }
    },
  };

  const context = vm.createContext({
    Date,
    Error,
    Intl,
    console: { warn: (...values) => warnings.push(values) },
    document,
    fetch: async () => ({
      ok: true,
      json: async () => articleIndex,
    }),
    window: { location },
  });

  vm.runInContext(browserScript, context, { filename: "js/academic.js" });
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));

  return {
    articleNavigation,
    fallback,
    location,
    sectionLinks,
    status,
    warnings,
  };
}

const aiLanding = await executeNavigation({
  landingSection: "ai4math",
  pathname: "/ai4math/",
});
assert.equal(
  aiLanding.location.replacedWith,
  latestAi4MathPath,
);
assert.equal(aiLanding.articleNavigation.children.length, articleIndex.sections.ai4math.length);
assert.equal(
  aiLanding.articleNavigation.children[0].href,
  latestAi4MathPath,
);
assert.equal(aiLanding.fallback.href, latestAi4MathPath);
assert.equal(aiLanding.warnings.length, 0);

const domainLanding = await executeNavigation({
  landingSection: "domain-theory",
  pathname: "/domain-theory/",
});
assert.equal(
  domainLanding.location.replacedWith,
  latestDomainTheoryPath,
);
assert.equal(domainLanding.warnings.length, 0);

const notesLanding = await executeNavigation({
  articleSection: "notes",
  landingSection: "notes",
  pathname: "/notes/",
});
assert.equal(
  notesLanding.location.replacedWith,
  latestNotesPath,
);
assert.equal(notesLanding.articleNavigation.children.length, articleIndex.sections.notes.length);
assert.equal(notesLanding.sectionLinks[2].href, latestNotesPath);
assert.equal(notesLanding.fallback.href, latestNotesPath);
assert.equal(notesLanding.warnings.length, 0);

const aiArticle = await executeNavigation({
  pathname: latestAi4MathPath,
});
assert.equal(aiArticle.location.replacedWith, null);
assert.equal(aiArticle.articleNavigation.children.length, articleIndex.sections.ai4math.length);
assert.equal(
  aiArticle.articleNavigation.children[0].attributes["aria-current"],
  "page",
);
assert.equal(aiArticle.warnings.length, 0);

const notesArticle = await executeNavigation({
  articleSection: "notes",
  pathname: latestNotesPath,
});
assert.equal(notesArticle.location.replacedWith, null);
assert.equal(notesArticle.articleNavigation.children.length, articleIndex.sections.notes.length);
assert.equal(
  notesArticle.articleNavigation.children[0].attributes["aria-current"],
  "page",
);
assert.equal(notesArticle.warnings.length, 0);

console.log("Automatic article navigation tests passed");
