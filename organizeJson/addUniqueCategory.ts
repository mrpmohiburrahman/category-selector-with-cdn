import * as fs from "fs";
import * as path from "path";
import { Library } from "../types";
import { fileURLToPath } from "url";
import * as readline from "readline";

const green = "\x1b[32m";
const underline = "\x1b[4m";
const reset = "\x1b[0m";

// Helper function to get __dirname in ES module scope
const getDirName = (metaUrl: string) => {
  const __filename = fileURLToPath(metaUrl);
  return path.dirname(__filename);
};

// Function to prompt user for input
const promptUser = (query: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans: string) => {
      rl.close();
      resolve(ans);
    })
  );
};

// Main function to process libraries and add unique category
export const addUniqueCategory = async () => {
  // @ts-ignore
  const __dirname = getDirName(import.meta.url);

  const combinedFileName = "combinedFromChunks.json";
  const combinedFilePath = path.join(__dirname, "..", "data", combinedFileName);
  const rawData = fs.readFileSync(combinedFilePath, "utf-8");
  const libraries: Library[] = JSON.parse(rawData);

  const uniqueCategoryFileName = "uniqueCategoryToLib.json";
  const uniqueCategoryFilePath = path.join(
    __dirname,
    "..",
    "data",
    uniqueCategoryFileName
  );

  let uniqueCategories: { [key: string]: string[] } = {};

  // Read existing unique categories file if it exists
  if (fs.existsSync(uniqueCategoryFilePath)) {
    const uniqueCategoryData = fs.readFileSync(uniqueCategoryFilePath, "utf-8");
    uniqueCategories = JSON.parse(uniqueCategoryData);
  }

  for (let i = 0; i < libraries.length; i++) {
    const library = libraries[i];

    // Skip if the library already has a uniqueCategory
    if (library.uniqueCategory) {
      console.log(
        `Skipping library ${underline}${i + 1}/${
          libraries.length
        }${reset} ${green}${underline}${
          library.githubUrl
        }${reset} as it already has a unique category: ${green}${underline}${
          library.uniqueCategory
        }${reset}`
      );
      continue;
    }

    console.log(`Library ${underline}${i + 1}/${libraries.length}${reset}:`);
    console.log(`GitHub URL: ${green}${underline}${library.githubUrl}${reset}`);
    console.log(
      `Current Categories:${underline} ${
        library.category?.join(", ") || "None"
      }${reset}`
    );

    const uniqueCategory = await promptUser(
      "Enter a unique category for this library: "
    );

    // Skip if the user pressed enter without typing anything
    if (!uniqueCategory.trim()) {
      console.log(
        `No unique category entered. Skipping library  ${underline}${i + 1}/${
          libraries.length
        }${reset}: ${underline}${library.githubUrl}${reset}`
      );
      continue;
    }

    library["uniqueCategory"] = uniqueCategory;

    if (uniqueCategories[uniqueCategory]) {
      uniqueCategories[uniqueCategory].push(library.githubUrl);
    } else {
      uniqueCategories[uniqueCategory] = [library.githubUrl];
    }

    // Write updated unique categories to uniqueCategoryToLib.json
    fs.writeFileSync(
      uniqueCategoryFilePath,
      JSON.stringify(uniqueCategories, null, 2)
    );

    // Write updated library to combinedFromChunks.json
    fs.writeFileSync(combinedFilePath, JSON.stringify(libraries, null, 2));

    console.log(
      `Added unique category: ${green}${underline}${uniqueCategory}${reset}`
    );
    console.log("-------------------------------------");
  }

  console.log("All libraries have been updated with unique categories.");
};

// Example usage
// addUniqueCategory();
