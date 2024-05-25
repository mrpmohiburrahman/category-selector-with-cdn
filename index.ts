import { writeFileSync, readFileSync } from "fs";
import { select } from "inquirer-select-pro";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in an ES module context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define types
type raw_items_types = { libraries: Library[]; total: number };
export type Category = "dev" | "ui" | "monetization" | "other"; // Add any other predefined strings as needed
export type Library = {
  category?: Category[];
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
  github?: {
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
    license: {
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
  npm?: {
    downloads?: number;
    weekDownloads?: number;
    start?: string;
    end?: string;
    period?: string;
  };
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

const green = "\x1b[32m";
const underline = "\x1b[4m";
const reset = "\x1b[0m";

async function main() {
  const filePath = path.join(__dirname, "libraries.json");
  const rawItems: raw_items_types = JSON.parse(readFileSync(filePath, "utf8"));

  for (const library of rawItems.libraries) {
    if (library.topicSearchString) {
      const topicCategories = library.topicSearchString.split(" ");
      const existingCategories = new Set(library.category || []);
      const availableCategories = topicCategories.filter(
        (category) => !existingCategories.has(category)
      );

      // If no new categories are available, skip to the next library
      if (availableCategories.length === 0) {
        console.log("All categories from topicSearchString already added.");
        continue;
      }

      const libraryName =
        library.github?.fullName || library.npmPkg || "Unknown";
      const selectedCategory = await select({
        message: `Select a category to add for ${green}${underline}${libraryName}${reset}${
          existingCategories.size > 0
            ? `:\n\nExisting categories:\n${Array.from(existingCategories).join(
                "\n"
              )}`
            : ""
        }:`,
        options: availableCategories.map((category) => ({
          name: category,
          value: category,
        })),
      });

      library.category = library.category || [];
      library.category.push(selectedCategory);

      writeFileSync(filePath, JSON.stringify(rawItems, null, 2));
      console.log("Updated library:", library);
    } else {
      console.log("No topicSearchString available for this library.");
    }
  }
}

main().catch(console.error);
