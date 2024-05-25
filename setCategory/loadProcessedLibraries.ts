import { existsSync, readFileSync } from "fs";

import path from "path";
export const processedFilePath = path.join(
  __dirname,
  "processedLibraries.json"
);
export function loadProcessedLibraries(): Set<string> {
  if (existsSync(processedFilePath)) {
    const processedData: { libraries: string[] } = JSON.parse(
      readFileSync(processedFilePath, "utf8")
    );
    return new Set(processedData.libraries);
  }
  return new Set();
}
