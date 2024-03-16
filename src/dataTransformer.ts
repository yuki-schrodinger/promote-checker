import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

const DEFAULT_CSV_FILE_PATH = "../data/words.csv";
export class DataProvider {
  data: Array<DataSet> = [];
  private filePath: string = DEFAULT_CSV_FILE_PATH;
  public DataProvider(filePath: string = DEFAULT_CSV_FILE_PATH) {
    this.filePath = path.join(__dirname, filePath);
  }
  prepareData = async () => {
    const realFilePath = path.join(__dirname, this.filePath);
    const stream = fs.createReadStream(realFilePath, { encoding: "utf8" });
    return await new Promise<void>((resolve, _) => {
      stream.on("data", (raw) => {
        const record: Array<{ [x: string]: string }> = parse(raw, {
          columns: true,
          skip_empty_lines: true,
        });
        const pool = new Map<string, string[]>();
        record.forEach((row) => {
          Object.entries(row).forEach(([key, value]) => {
            if (pool.has(key)) {
              pool.get(key)?.push(value);
            } else {
              pool.set(key, [value]);
            }
          }, pool);
        });
        pool.forEach((value, key) => {
          const mainSubject = key;
          const words = value;
          this.data.push({
            mainSubject,
            words,
            length: words.length,
          });
        });
        return resolve();
      });
    });
  };
}

export type DataSet = {
  mainSubject: string;
  length: number;
  words: Array<string>;
};
