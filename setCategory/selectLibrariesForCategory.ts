import { select } from "inquirer-select-pro";
import { Library } from "../types";
import { green, reset, underline } from "./setCategory";
import { fetchCategoryData } from "./fetchCategoryData";

export async function selectLibrariesForCategory(
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
