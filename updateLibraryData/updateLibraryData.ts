import { Octokit } from "@octokit/rest";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in an ES module context
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const octokit = new Octokit({
  auth: "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",
});

type GitHubData = {
  urls: {
    repo: string;
    clone: string;
    homepage?: string | null;
  };
  stats: {
    hasIssues: boolean;
    hasWiki: boolean;
    hasPages: boolean;
    hasDownloads: boolean;
    hasTopics?: boolean;
    updatedAt: Date | string;
    createdAt: Date | string;
    pushedAt: Date | string;
    issues: number;
    subscribers: number;
    stars: number;
    forks: number;
  };
  name: string;
  fullName: string;
  description: string;
  topics?: string[];
  license?: {
    key: string;
    name: string;
    spdxId: string;
    url: string;
    id: string;
  };
  lastRelease?: {
    name: string;
    tagName: string;
    createdAt: Date | string;
    publishedAt: Date | string;
    isPrerelease: boolean;
  };
  hasTypes?: boolean;
  newArchitecture?: boolean;
};

type NpmData = {
  downloads?: number;
  weekDownloads?: number;
  start?: string;
  end?: string;
  period?: string;
};

type Library = {
  goldstar?: boolean;
  githubUrl: string;
  ios?: boolean;
  android?: boolean;
  web?: boolean;
  expoGo?: boolean;
  windows?: boolean;
  macos?: boolean;
  tvos?: boolean;
  visionos?: boolean;
  unmaintained?: boolean;
  dev?: boolean;
  template?: boolean;
  newArchitecture?: boolean;
  github?: GitHubData;
  npm?: NpmData;
  score?: number;
  matchingScoreModifiers?: string[];
  topicSearchString?: string;
  examples?: string[];
  images?: string[];
  npmPkg?: string;
  nameOverride?: string;
  popularity?: number;
  matchScore?: number;
};

const libraries: Library[] = [
  {
    githubUrl: "https://github.com/onubo/react-native-logs",
    ios: true,
    android: true,
    web: true,
    expoGo: true,
    dev: true,
    npmPkg: "react-native-logs",
  },
];

const GITHUB_URL_PATTERN = /^https:\/\/github\.com\/([\w-]+)\/([\w-]+)(\/.*)?$/;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchGithubData = async (
  owner: string,
  repo: string
): Promise<GitHubData> => {
  const { data } = await octokit.repos.get({ owner, repo });
  const topicsResponse = await octokit.repos.getAllTopics({ owner, repo });
  const releasesResponse = await octokit.repos.listReleases({ owner, repo });

  const lastRelease = releasesResponse.data.length
    ? releasesResponse.data[0]
    : null;

  return {
    urls: {
      repo: data.html_url,
      clone: data.clone_url,
      homepage: data.homepage,
    },
    stats: {
      hasIssues: data.has_issues,
      hasWiki: data.has_wiki,
      hasPages: data.has_pages,
      hasDownloads: true,
      hasTopics: topicsResponse.data.names.length > 0,
      updatedAt: data.updated_at,
      createdAt: data.created_at,
      pushedAt: data.pushed_at,
      issues: data.open_issues_count,
      subscribers: data.subscribers_count,
      stars: data.stargazers_count,
      forks: data.forks_count,
    },
    name: data.name,
    fullName: data.full_name,
    description: data?.description,
    topics: topicsResponse.data.names,
    license: data.license && {
      key: data.license.key,
      name: data.license.name,
      spdxId: data.license.spdx_id,
      url: data.license.url,
      id: data.license.node_id,
    },
    lastRelease: lastRelease && {
      name: lastRelease.name,
      tagName: lastRelease.tag_name,
      createdAt: lastRelease.created_at,
      publishedAt: lastRelease.published_at,
      isPrerelease: lastRelease.prerelease,
    },
    hasTypes: data.language === "TypeScript",
    newArchitecture: data.topics.includes("react-native-new-architecture"),
  };
};

const fetchNpmData = async (npmPkg: string): Promise<NpmData> => {
  const url = `https://api.npmjs.org/downloads/point/last-month/${npmPkg}`;
  const response = await fetch(url);
  const downloadData = await response.json();

  const weekUrl = `https://api.npmjs.org/downloads/point/last-week/${npmPkg}`;
  const weekResponse = await fetch(weekUrl);
  const weekDownloadData = await weekResponse.json();

  return {
    downloads: downloadData.downloads,
    weekDownloads: weekDownloadData.downloads,
    start: downloadData.start,
    end: downloadData.end,
    period: "month",
  };
};

const getCombinedPopularity = (data: Library): number => {
  const { subscribers, forks, stars } = data.github?.stats || {};
  const { downloads } = data.npm || {};
  return (
    (subscribers ?? 0) * 20 +
    (forks ?? 0) * 10 +
    (stars ?? 0) +
    (downloads ?? 0) / 100
  );
};

const calculateDirectoryScore = (data: Library): Library => {
  const modifiers = [
    {
      name: "Very popular",
      value: 40,
      condition: (data: Library) => getCombinedPopularity(data) > 10000,
    },
    {
      name: "Popular",
      value: 10,
      condition: (data: Library) => getCombinedPopularity(data) > 2500,
    },
    {
      name: "Recommended",
      value: 20,
      condition: (data: Library) => data.goldstar,
    },
    {
      name: "Lots of open issues",
      value: -20,
      condition: (data: Library) => (data.github?.stats.issues ?? 0) >= 75,
    },
    {
      name: "No license",
      value: -20,
      condition: (data: Library) => !data.github?.license,
    },
    {
      name: "GPL license",
      value: -20,
      condition: (data: Library) => data.github?.license?.key.startsWith("gpl"),
    },
    {
      name: "Recently updated",
      value: 10,
      condition: (data: Library) =>
        new Date(data.github?.stats.updatedAt ?? "") >=
        new Date(Date.now() - 30 * 864e5),
    },
    {
      name: "Not updated recently",
      value: -20,
      condition: (data: Library) =>
        new Date(data.github?.stats.updatedAt ?? "") <=
        new Date(Date.now() - 180 * 864e5),
    },
  ];

  const minScore = modifiers.reduce(
    (acc, mod) => (mod.value < 0 ? acc + mod.value : acc),
    0
  );
  const maxScore = modifiers.reduce(
    (acc, mod) => (mod.value > 0 ? acc + mod.value : acc),
    0
  );

  const matchingModifiers = modifiers.filter((mod) => mod.condition(data));
  const rawScore = matchingModifiers.reduce((acc, mod) => acc + mod.value, 0);
  const score = Math.round(
    ((rawScore - minScore) / (maxScore - minScore)) * 100
  );

  return {
    ...data,
    score,
    matchingScoreModifiers: matchingModifiers.map((mod) => mod.name),
  };
};

const calculatePopularityScore = (data: Library): Library => {
  const { downloads, weekDownloads } = data.npm || {};
  const { stars, createdAt } = data.github?.stats || {};
  const unmaintained = data.unmaintained;

  if (!downloads || !weekDownloads) {
    return { ...data, popularity: -1 };
  }

  const popularityGain =
    (weekDownloads - Math.floor(downloads / 4)) / downloads;
  const downloadsPenalty = downloads < 250 ? 0.45 : 0;
  const starsPenalty = (stars ?? 0) < 25 ? 0.1 : 0;
  const unmaintainedPenalty = unmaintained ? 0.25 : 0;
  const freshPackagePenalty =
    Date.now() - new Date(createdAt ?? "") < 6048e5 ? 0.3 : 0;

  const popularity = parseFloat(
    (
      popularityGain -
      downloadsPenalty -
      starsPenalty -
      unmaintainedPenalty -
      freshPackagePenalty
    ).toFixed(3)
  );

  return {
    ...data,
    popularity,
  };
};

const processLibraries = async (libraries: Library[]): Promise<Library[]> => {
  const results: Library[] = [];

  for (const lib of libraries) {
    const match = lib.githubUrl.match(GITHUB_URL_PATTERN);

    if (!match) {
      console.error(`Invalid GitHub URL: ${lib.githubUrl}`);
      continue;
    }

    const [, owner, repo] = match;
    const githubData = await fetchGithubData(owner, repo);
    console.log(`🚀 ~ processLibraries ~ githubData:`, githubData);
    let npmData: NpmData = {};

    if (lib.npmPkg) {
      npmData = await fetchNpmData(lib.npmPkg);
      console.log(`🚀 ~ processLibraries ~ npmData:`, npmData);
    }

    let data: Library = {
      ...lib,
      github: githubData,
      npm: npmData,
      topicSearchString: githubData.topics?.join(" ") ?? "",
    };

    data = calculateDirectoryScore(data);
    data = calculatePopularityScore(data);

    console.log(`🚀 ~ processLibraries ~ data after calculation:`, data);
    results.push(data);
    await sleep(500); // Rate limiting
  }

  return results;
};

const saveResults = (data: Library[], filePath: string): void => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export const updateLibraryData = async (): Promise<void> => {
  const processedLibraries = await processLibraries(libraries);
  saveResults(
    processedLibraries,
    path.join(__dirname, "processed-libraries.json")
  );
  console.log("Data processing complete.");
};

// Example usage
updateLibraryData().catch(console.error);
