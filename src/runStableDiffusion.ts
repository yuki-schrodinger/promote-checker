import { DataProvider, DataSet } from "./internal/dataTransformer";
import { handleT2IRequest } from "./stable-diffusion/network";
import fs from "fs";
import { multiTraitsToPrompt } from "./stable-diffusion/prompt";
import {
  SD_API_GLOBAL_TEXT_TO_IMAGE,
  SD_API_INNER1_TEXT_TO_IMAGE,
  SD_API_INNER2_TEXT_TO_IMAGE,
} from "./stable-diffusion/config";

const globalProvider = new DataProvider();

const execute = async () => {
  await mainProcess();
  console.log("All tasks finished!");
};

const mainProcess = async () => {
  await globalProvider.prepareData();
  const data = globalProvider.data;
  console.log(`Total ${data.length} main subjects found.`);
  fs.mkdirSync(`./raw`, { recursive: true });
  for (let i = 0; i < data.length; i++) {
    await onMainSubject(data[i]);
  }
};

const onMainSubject = async (dataSet: DataSet) => {
  console.warn(`Now deal with ${dataSet.mainSubject}...`);
  const { mainSubject, words, length } = dataSet;
  fs.mkdirSync(`./raw/${mainSubject}`, { recursive: true });
  for (let index = 0; index < length; index += 2) {
    const word1 = words[index];
    const word2 = index + 1 === length ? words[index] : words[index + 1];
    const path1 = `./raw/${mainSubject}/${word1.replace(/\s/g, "-")}-${
      index + 1
    }`;
    const path2 = `./raw/${mainSubject}/${word2.replace(/\s/g, "-")}-${
      index + 2
    }`;
    if (fs.existsSync(path1) || fs.existsSync(path2)) {
      console.warn(
        `Skip ${mainSubject} - trait ${word1}, ${word2} : ${
          index + 1
        }/${length}`
      );
      continue;
    }
    fs.mkdirSync(path1, {
      recursive: true,
    });
    fs.mkdirSync(path2, {
      recursive: true,
    });
    await waitForCertainTime(3 * 1000);
    try {
      const prompt1 = multiTraitsToPrompt([
        { traitType: mainSubject, value: word1 },
      ]);
      const prompt2 = multiTraitsToPrompt([
        { traitType: mainSubject, value: word2 },
      ]);
      await Promise.all([
        onCommand({
          prompt: prompt1,
          mainSubject,
          trait: word1,
          index,
          mode: "global",
          amount: length,
          path: path1,
          apiPath: SD_API_GLOBAL_TEXT_TO_IMAGE,
        }),
        onCommand({
          prompt: prompt2,
          mainSubject,
          trait: word1,
          index,
          mode: "global",
          amount: length,
          path: path2,
          apiPath: SD_API_GLOBAL_TEXT_TO_IMAGE,
        }),
        onCommand({
          prompt: prompt1,
          mainSubject,
          trait: word1,
          index,
          mode: "inner",
          amount: length,
          path: path1,
          apiPath: SD_API_INNER1_TEXT_TO_IMAGE,
        }),
        onCommand({
          prompt: prompt2,
          mainSubject,
          trait: word2,
          index: index + 1,
          mode: "inner",
          amount: length,
          path: path2,
          apiPath: SD_API_INNER2_TEXT_TO_IMAGE,
        }),
      ]);
    } catch (e) {
      console.error(
        `Error when dealing with ${mainSubject} - trait ${word1}, ${word2}: ${
          index + 1
        }/${length}`,
        e
      );
    }
  }
};

const onCommand = async (command: {
  prompt: string;
  mainSubject: string;
  trait: string;
  index: number;
  mode: "global" | "inner";
  amount: number;
  path: string;
  apiPath: string;
}) => {
  const { prompt, mainSubject, trait, index, mode, amount, path, apiPath } =
    command;
  try {
    console.log(
      `Start ${mainSubject} - trait ${trait}: ${index + 1}/${amount}`
    );
    const res = await handleT2IRequest(prompt, apiPath);
    onRecord(mainSubject, trait, index, mode, res.images[0], amount, path);
    fs.writeFileSync(
      `${path}/data-${mode}.json`,
      JSON.stringify(
        {
          config: {
            payload: res.payload,
          },
        },
        null,
        "\t"
      )
    );
  } catch (e) {
    console.error(
      `Error when dealing with ${mainSubject} - trait ${trait}: ${
        index + 1
      }/${amount}`,
      e
    );
  }
};

const onRecord = (
  mainSubject: string,
  trait: string,
  index: number,
  mode: "global" | "inner",
  content: string,
  amount: number,
  path: string
) => {
  console.log(
    `Finished ${mainSubject} - trait ${trait}: ${
      index + 1
    }/${amount} mode: ${mode}`
  );
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
