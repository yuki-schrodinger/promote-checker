import { DataProvider, DataSet } from "./internal/dataTransformer";
import { handleT2IRequest } from "./stable-diffusion/network";
import fs from "fs";
import {
  multiTraitsToPrompt,
  singleTraitsToPrompt,
} from "./stable-diffusion/prompt";

const globalProvider = new DataProvider();

const execute = async () => {
  await mainProcess();
  console.log("All tasks finished!");
};

const mainProcess = async () => {
  await globalProvider.prepareData();
  const data = globalProvider.data;
  console.log(`Total ${data.length} main subjects found.`);
  fs.mkdirSync(`../raw`, { recursive: true });
  for (let i = 0; i < data.length; i++) {
    await onMainSubject(data[i]);
  }
};

const onMainSubject = async (dataSet: DataSet) => {
  console.warn(`Now deal with ${dataSet.mainSubject}...`);
  const { mainSubject, words, length } = dataSet;
  fs.mkdirSync(`../raw/${mainSubject}`, { recursive: true });
  for (let index = 0; index < length; index++) {
    const word = words[index];
    const path = `../raw/${mainSubject}/${word}-${index + 1}`;
    if (fs.existsSync(path)) {
      console.warn(
        `Skip ${mainSubject} - trait ${word}: ${index + 1}/${length}`
      );
      continue;
    }
    fs.mkdirSync(path, {
      recursive: true,
    });
    await waitForCertainTime(500);
    try {
      const wordsSG = singleTraitsToPrompt(mainSubject, word);
      const resSG = await handleT2IRequest(wordsSG);
      onRecord(mainSubject, word, index, "SG", resSG.images[0], length);
      const wordsSD = multiTraitsToPrompt([
        { traitType: mainSubject, value: word },
      ]);
      const resSD = await handleT2IRequest(wordsSD);
      onRecord(mainSubject, word, index, "SD", resSD.images[0], length);
      fs.writeFileSync(
        `${path}/data.json`,
        JSON.stringify({
          prompts: {
            wordsSG,
            wordsSD,
          },
        })
      );
    } catch (e) {
      console.error(
        `Error when dealing with ${mainSubject} - trait ${word}: ${
          index + 1
        }/${length}`,
        e
      );
    }
  }
};

const onRecord = (
  mainSubject: string,
  trait: string,
  index: number,
  mode: "SG" | "SD",
  content: string,
  amount: number
) => {
  console.log(
    `Finished ${mainSubject} - trait ${trait}: ${
      index + 1
    }/${amount} mode: ${mode}`
  );
  const path = `../raw/${mainSubject}/${trait}-${index + 1}`;
  fs.writeFileSync(`${path}/${mode}.png`, base64ToFileContent(content));
};

const base64ToFileContent = (base64: string) => {
  // let parts = base64.split(";base64,");
  // let raw = globalThis.atob(parts[1]);
  // let rawLength = raw.length;
  // let uInt8Array = new Uint8Array(rawLength);
  // for (let i = 0; i < rawLength; ++i) {
  //   uInt8Array[i] = raw.charCodeAt(i);
  // }
  // return Buffer.from(uInt8Array);
  return Buffer.from(base64, "base64");
};

const waitForCertainTime = (time: number = 15 * 1000) => {
  return new Promise<void>((resolve, _) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

execute();
