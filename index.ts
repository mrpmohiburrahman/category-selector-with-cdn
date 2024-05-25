import { splitJsonFileIntoChunks } from "./organizeJson/divideJson";
import { removeDuplicates } from "./organizeJson/removeDuplicate";
import { processLibraries } from "./setCategory/processLibraries";
import { setCategory } from "./setCategory/setCategory";
import { updateLibraryData } from "./updateLibraryData/updateLibraryData";

// removeDuplicates().catch(console.error);
// setCategory().catch(console.error);
processLibraries().catch(console.error);
// updateLibraryData().catch(console.error);
// splitJsonFileIntoChunks()
