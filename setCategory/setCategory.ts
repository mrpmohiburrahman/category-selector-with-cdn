import { readFileSync, writeFileSync, readdirSync } from "fs";
import { select } from "inquirer-select-pro";
import path from "path";
import { Library } from "../types"; // Adjust the path according to your project structure
import { fileURLToPath } from "url";
import { loadProcessedLibraries } from "./loadProcessedLibraries";
import { saveProcessedLibrary } from "./saveProcessedLibrary";
import fetchAndSelectLibraries from "./fetchAndSelectLibraries";

// Get the directory name in an ES module context
// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define types
export type raw_items_types = { libraries: Library[]; total: number };

export const green = "\x1b[32m";
export const underline = "\x1b[4m";
export const reset = "\x1b[0m";

export async function setCategory(useChunks: boolean = true) {
  const filePath = path.join(__dirname, "libraries.json");
  const processedLibraries = loadProcessedLibraries();
  const chunksFolderPath = path.join(__dirname, "chunks");

  const processLibraryFile = async (file: string) => {
    const rawItems: raw_items_types = JSON.parse(readFileSync(file, "utf8"));
    console.log(`🚀 ~ processLibraryFile ~ rawItems:`, rawItems.length);
    const totalLibraries = useChunks
      ? rawItems.length
      : rawItems.libraries.length;

    console.log(`🚀 ~ processLibraryFile ~ totalLibraries:`, totalLibraries);
    for (let i = 0; i < totalLibraries; i++) {
      const library = useChunks ? rawItems[i] : rawItems.libraries[i];
      const libraryUrl = library.githubUrl;

      if (processedLibraries.has(libraryUrl)) {
        console.log(
          `Library ${
            library.github?.fullName || library.npmPkg || "Unknown"
          } already processed. Skipping.`
        );
        continue;
      }

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

        writeFileSync(file, JSON.stringify(rawItems, null, 2));
        console.log(
          "Updated library:",
          library.github?.fullName || library.npmPkg || "Unknown"
        );

        // Fetch data for each newly selected category and select libraries
        // await fetchAndSelectLibraries(selectedCategories, rawItems, file);

        // Mark the current library as processed
        saveProcessedLibrary(libraryUrl);
      } else {
        console.log("No topicSearchString available for this library.");
      }

      console.log(`Finished processing library ${i + 1}/${totalLibraries}`);
    }
  };

  if (useChunks) {
    const chunkFiles = readdirSync(chunksFolderPath).filter((file) =>
      file.endsWith(".json")
    );
    for (const chunkFile of chunkFiles) {
      const chunkFilePath = path.join(chunksFolderPath, chunkFile);
      console.log(`🚀 ~ setCategory ~ chunkFilePath:`, chunkFilePath);
      console.log(`🚀 ~ setCategory ~ chunksFolderPath:`, chunksFolderPath);
      await processLibraryFile(chunkFilePath);
    }
  } else {
    await processLibraryFile(filePath);
  }
}

// Example usage
setCategory(true).catch(console.error); // Pass true to use chunk files, false to use single libraries.json file
