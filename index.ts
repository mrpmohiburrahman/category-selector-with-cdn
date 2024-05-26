import { splitJsonFileIntoChunks } from "./organizeJson/divideJson";
import { removeDuplicates } from "./organizeJson/removeDuplicate";
import { ensureUniqueItems } from "./organizeJson/removeDuplicatesWithin";
import { processLibraries } from "./setCategory/processLibraries";
import { setCategory } from "./setCategory/setCategory";
import { updateLibraryData } from "./updateLibraryData/updateLibraryData";
// removeDuplicates().catch(console.error);
// ensureUniqueItems();
setCategory().catch(console.error);
// processLibraries().catch(console.error);
// updateLibraryData().catch(console.error);
// splitJsonFileIntoChunks()
