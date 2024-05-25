import { existsSync, readFileSync } from "fs";
import { processedFilePath } from "./setCategory";

export function loadProcessedLibraries(): Set<string> {
  if (existsSync(processedFilePath)) {
    const processedData: { libraries: string[] } = JSON.parse(
      readFileSync(processedFilePath, "utf8")
    );
    return new Set(processedData.libraries);
  }
  return new Set();
}
