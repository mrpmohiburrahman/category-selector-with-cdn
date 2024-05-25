import { splitJsonFileIntoChunks } from "./organizeJson/divideJson";
import { removeDuplicates } from "./organizeJson/removeDuplicate";
import { setCategory } from "./setCategory/setCategory";
import { updateLibraryData } from "./updateLibraryData/updateLibraryData";

removeDuplicates().catch(console.error);
// setCategory().catch(console.error);
// updateLibraryData().catch(console.error);
// splitJsonFileIntoChunks()
