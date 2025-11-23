import fs from "fs";

export const readSecret = (filePath: string) => {
  try {
    return fs.readFileSync(filePath, "utf-8").trim();
  } catch (err) {
    return undefined;
  }
};
