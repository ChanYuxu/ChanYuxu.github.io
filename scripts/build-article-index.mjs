import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");

const sections = [
  { id: "domain-theory", directory: "domain-theory", landing: "domain-theory/index.html" },
  { id: "ai4math", directory: "ai4math", landing: "ai4math/index.html" },
  { id: "notes", directory: "notes", landing: "notes/index.html" },
];

function decodeHtml(value) {
  const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    mdash: "—",
    ndash: "–",
    omega: "ω",
    quot: '"',
  };

  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity) => {
    if (entity.startsWith("#x")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
    }
    if (entity.startsWith("#")) {
      return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
    }
    return namedEntities[entity.toLowerCase()] ?? match;
  });
}

function stripTags(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, "")).replace(/\s+/g, " ").trim();
}

function metaContent(html, keyType, key) {
  const metaTags = html.match(/<meta\s+[^>]*>/gi) ?? [];

  for (const tag of metaTags) {
    const attributes = {};
    for (const match of tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)) {
      attributes[match[1].toLowerCase()] = match[3];
    }
    if (attributes[keyType] === key && attributes.content) {
      return decodeHtml(attributes.content.trim());
    }
  }

  return null;
}

async function readSection(section) {
  const sectionDirectory = path.join(repositoryRoot, section.directory);
  const directoryEntries = await readdir(sectionDirectory, { withFileTypes: true });
  const articles = [];

  for (const entry of directoryEntries) {
    if (!entry.isDirectory() || entry.name.startsWith(".")) {
      continue;
    }

    const articleFile = path.join(sectionDirectory, entry.name, "index.html");
    let html;
    try {
      html = await readFile(articleFile, "utf8");
    } catch (error) {
      if (error.code === "ENOENT") {
        continue;
      }
      throw error;
    }

    const published = metaContent(html, "property", "article:published_time");
    const label = metaContent(html, "name", "section-label");
    const headingMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const title = headingMatch ? stripTags(headingMatch[1]) : null;

    if (!published || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(published)) {
      throw new Error(`Missing or invalid article:published_time in ${articleFile}`);
    }
    if (!label) {
      throw new Error(`Missing section-label metadata in ${articleFile}`);
    }
    if (!title) {
      throw new Error(`Missing h1 title in ${articleFile}`);
    }

    articles.push({
      path: `/${section.directory}/${entry.name}/`,
      published,
      label,
      title,
    });
  }

  articles.sort((left, right) => {
    const byDate = right.published.localeCompare(left.published);
    return byDate || left.path.localeCompare(right.path);
  });

  if (articles.length === 0) {
    throw new Error(`No articles found for section ${section.id}`);
  }

  return articles;
}

async function updateLandingFallback(section, latestPath) {
  const landingFile = path.join(repositoryRoot, section.landing);
  const html = await readFile(landingFile, "utf8");
  const updatedHtml = html.replace(
    /(<a\s+data-latest-fallback\s+href=")[^"]+(")/g,
    `$1${latestPath}$2`,
  );

  if (updatedHtml === html) {
    return false;
  }

  await writeFile(landingFile, updatedHtml, "utf8");
  return true;
}

const generatedIndex = {
  version: 1,
  sections: {},
};

for (const section of sections) {
  generatedIndex.sections[section.id] = await readSection(section);
}

const outputDirectory = path.join(repositoryRoot, "data");
const outputFile = path.join(outputDirectory, "articles.json");
const output = `${JSON.stringify(generatedIndex, null, 2)}\n`;

await mkdir(outputDirectory, { recursive: true });

let previousOutput = null;
try {
  previousOutput = await readFile(outputFile, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

if (previousOutput !== output) {
  await writeFile(outputFile, output, "utf8");
  console.log(`Updated ${path.relative(repositoryRoot, outputFile)}`);
} else {
  console.log(`${path.relative(repositoryRoot, outputFile)} is current`);
}

for (const section of sections) {
  const latestPath = generatedIndex.sections[section.id][0].path;
  if (await updateLandingFallback(section, latestPath)) {
    console.log(`Updated fallback links in ${section.landing}`);
  }
}
