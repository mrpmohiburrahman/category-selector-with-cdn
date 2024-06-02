import { categorizeLibraries } from "./organizeJson/categorizeLibraries";
import { splitJsonFileIntoChunks } from "./organizeJson/divideJson";
import { mergeDuplicatesForASingleFile } from "./organizeJson/mergeDuplicatesForAsinglefile";
import { removeDuplicates } from "./organizeJson/removeDuplicate";
import { removeDuplicatesAndMergeCategories } from "./organizeJson/removeDuplicatesAndMergeCategories";
import { ensureUniqueItems } from "./organizeJson/removeDuplicatesWithin";
import { processLibraries } from "./setCategory/processLibraries";
import { setCategory } from "./setCategory/setCategory";
import { updateLibraryData } from "./updateLibraryData/updateLibraryData";
// mergeDuplicatesForASingleFile();
// categorizeLibraries().catch(console.error);
//
// removeDuplicatesAndMergeCategories().catch(console.error);
// removeDuplicates().catch(console.error);
// ensureUniqueItems();
// setCategory().catch(console.error);
// processLibraries().catch(console.error);
// updateLibraryData().catch(console.error);
splitJsonFileIntoChunks();
