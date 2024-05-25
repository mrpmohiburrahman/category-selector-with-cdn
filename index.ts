import { writeFileSync, readFileSync } from "fs";
import { select } from "inquirer-select-pro";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in an ES module context
// @ts-ignore
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

async function main() {
  const filePath = path.join(__dirname, "libraries.json");
  const rawItems: raw_items_types = JSON.parse(readFileSync(filePath, "utf8"));

  const categories = new Set<string>();

  rawItems.libraries.forEach((library) => {
    console.log("npmPkg:", library.npmPkg);
    if (library.topicSearchString) {
      const topicCategories = library.topicSearchString.split(" ");
      topicCategories.forEach((category) => categories.add(category));
    }
  });

  const categoryArray = Array.from(categories);
  const options = [
    ...rawItems.libraries.map((library) => ({
      name: library.github?.fullName || library.npmPkg || "Unknown",
      value: library,
    })),
    ...categoryArray.map((category) => ({
      name: category,
      value: category,
    })),
  ];

  // Use inquirer-select-pro to select an option
  const selected = await select({
    message: "Select a library or a category:",
    options,
  });

  if (typeof selected !== "string") {
    const selectedLibrary = selected as Library;
    const selectedCategory = await select({
      message: "Select a category to add:",
      options: categoryArray.map((category) => ({
        name: category,
        value: category,
      })),
    });

    selectedLibrary.category = selectedLibrary.category || [];
    selectedLibrary.category.push(selectedCategory);

    writeFileSync(filePath, JSON.stringify(rawItems, null, 2));
    console.log("Updated library:", selectedLibrary);
  }
}

main().catch(console.error);

// import { argv } from "node:process";
// import { writeFile, readFileSync, existsSync } from "fs";
// import {
//   filterLocalData,
//   filterRemoteData,
//   remoteData,
//   top100Films,
// } from "./sampleData";
// import { SelectProps, select } from "inquirer-select-pro";
// import path from "path";
// import { fileURLToPath } from "url";

// // Get the directory name in an ES module context
// // @ts-ignore
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// function createDemo<Value, Multiple extends boolean = true>(
//   baseProps: SelectProps<Value, Multiple>
// ) {
//   return async (
//     props: Partial<SelectProps<Value, Multiple>>,
//     demoName: string
//   ) => {
//     const answer = await select<Value, Multiple>({
//       ...baseProps,
//       ...props,
//     });
//     console.log(answer);

//     // Define the file path
//     const filePath = path.join(__dirname, `${demoName}.json`);

//     // Write the selected data directly to the file
//     writeFile(filePath, JSON.stringify(answer, null, 2), (err) => {
//       if (err) {
//         console.error("Error writing to file:", err);
//       } else {
//         console.log(`Data saved to ${demoName}.json`);
//       }
//     });
//   };
// }

// const options = {
//   local: createDemo({
//     message: "Select all the movies you want to watch:",
//     options: top100Films,
//   }),
//   remote: createDemo({
//     message: "Select all the movies you want to watch:",
//     options: remoteData,
//   }),
//   "filter-remote": createDemo({
//     message: "Select all the movies you want to watch:",
//     options: filterRemoteData,
//   }),
//   "filter-local": createDemo({
//     message: "Select all the movies you want to watch:",
//     options: filterLocalData,
//   }),
// };

// type Demos = keyof typeof options;

// const availableOptions = [
//   "filter",
//   "clearInputWhenSelected",
//   "required",
//   "loop",
//   "multiple",
//   "canToggleAll",
// ];

// let whichDemo: Demos | null;

// const demos = Object.keys(options) as Demos[];
// const flags: any = {};
// for (let index = argv.length - 1; index >= 0; index--) {
//   const arg = argv[index];
//   let g = null;
//   if (demos.indexOf(arg as Demos) >= 0) {
//     whichDemo = arg as Demos;
//     break;
//   } else if ((g = arg.match(/--(\w+)=?(true|false)?/))) {
//     if (availableOptions.includes(g[1])) {
//       flags[g[1]] = g[2] === undefined || g[2] === "true";
//     }
//   }
// }

// // @ts-ignore
// if (!whichDemo) {
//   // @ts-ignore
//   whichDemo = await select({
//     message: "Which demo do you want to run?",
//     multiple: false,
//     options: demos.map((value) => ({
//       name: value,
//       value,
//     })),
//   });
// }
// // @ts-ignore
// options?.[whichDemo as keyof typeof options]?.(flags, whichDemo);
