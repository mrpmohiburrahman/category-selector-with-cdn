import { writeFileSync, readFileSync, existsSync } from "fs";
import { select } from "inquirer-select-pro";
import path from "path";
import axios from "axios"; // Ensure you have axios installed
import { Library } from "../types";

import { fileURLToPath } from "url";
// Get the directory name in an ES module context
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define types
type raw_items_types = { libraries: Library[]; total: number };

const green = "\x1b[32m";
const underline = "\x1b[4m";
const reset = "\x1b[0m";

const processedFilePath = path.join(__dirname, "processedLibraries.json");

function loadProcessedLibraries(): Set<string> {
  if (existsSync(processedFilePath)) {
    const processedData: { libraries: string[] } = JSON.parse(
      readFileSync(processedFilePath, "utf8")
    );
    return new Set(processedData.libraries);
  }
  return new Set();
}

function saveProcessedLibrary(githubUrl: string) {
  const processedLibraries = loadProcessedLibraries();
  processedLibraries.add(githubUrl);
  writeFileSync(
    processedFilePath,
    JSON.stringify({ libraries: Array.from(processedLibraries) }, null, 2)
  );
}

async function fetchCategoryData(category: string): Promise<raw_items_types> {
  try {
    const response = await axios.get(
      `https://reactnative.directory/api/libraries?search=${category}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for category ${category}:`, error);
    return { libraries: [], total: 0 };
  }
}

async function selectLibrariesForCategory(
  category: string
): Promise<Library[]> {
  const categoryData = await fetchCategoryData(category);
  if (categoryData.libraries.length > 0) {
    const selectedLibraries = await select({
      message: `Select libraries for the category ${green}${underline}${category}${reset}:`,
      multiple: true,
      options: categoryData.libraries.map((lib) => ({
        name: `${reset}${green}${underline}${
          lib.npmPkg || "Unknown"
        }${reset} -- ${lib.githubUrl}`,
        value: lib,
      })),
    });

    selectedLibraries.forEach((lib: Library) => {
      lib.category = lib.category || [];
      if (!lib.category.includes(category)) {
        lib.category.push(category);
      }
      lib.category = [...new Set(lib.category)]; // Ensure uniqueness
    });

    return selectedLibraries;
  } else {
    console.log(`No libraries found for category ${category}`);
    return [];
  }
}

export async function setCategory() {
  const filePath = path.join(__dirname, "libraries.json");
  const rawItems: raw_items_types = JSON.parse(readFileSync(filePath, "utf8"));

  const processedLibraries = loadProcessedLibraries();
  const totalLibraries = rawItems.libraries.length;

  for (let i = 0; i < totalLibraries; i++) {
    const library = rawItems.libraries[i];
    const libraryUrl = library.githubUrl;

    if (processedLibraries.has(libraryUrl)) {
      console.log(
        `Library ${
          library.github?.fullName || library.npmPkg || "Unknown"
        } already processed. Skipping.`
      );
      continue;
    }

    // console.log(
    //   `Processing library ${i + 1}/${totalLibraries}: ${
    //     library.github?.fullName
    //   }: ${library.npmPkg}: ${library.githubUrl}`
    // );

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

      const selectedCategories = await select({
        message: `Library ${
          i + 1
        }/${totalLibraries} -- Select categories to add for npm:${green}${underline}${
          library.npmPkg
        }${reset} GH ${green}${underline}${
          library.github?.fullName
        }${reset} ${green}${underline}${library.githubUrl}${reset} ${
          existingCategories.size > 0
            ? `:\n\nExisting categories:${reset}${green}\n${Array.from(
                existingCategories
              ).join("\n")}${reset}\n`
            : ""
        }:`,
        multiple: true,
        options: availableCategories.map((category) => ({
          name: category,
          value: category,
        })),
      });

      library.category = library.category || [];
      library.category.push(...selectedCategories);
      library.category = [...new Set(library.category)]; // Ensure uniqueness

      writeFileSync(filePath, JSON.stringify(rawItems, null, 2));
      console.log(
        "Updated library:",
        library.github?.fullName || library.npmPkg || "Unknown"
      );

      // Fetch data for each newly selected category and select libraries
      for (const category of selectedCategories) {
        const selectedLibraries = await selectLibrariesForCategory(category);

        // Find the selected libraries in the main JSON and update them
        selectedLibraries.forEach((selectedLib) => {
          const existingLibIndex = rawItems.libraries.findIndex(
            (lib) => lib.githubUrl === selectedLib.githubUrl
          );

          if (existingLibIndex !== -1) {
            rawItems.libraries[existingLibIndex] = selectedLib;
          } else {
            rawItems.libraries.push(selectedLib);
          }
        });

        writeFileSync(filePath, JSON.stringify(rawItems, null, 2));
        console.log(`Libraries updated for category ${category}`);
      }

      // Mark the current library as processed
      saveProcessedLibrary(libraryUrl);
    } else {
      console.log("No topicSearchString available for this library.");
    }

    console.log(`Finished processing library ${i + 1}/${totalLibraries}`);
  }
}

// main().catch(console.error);
