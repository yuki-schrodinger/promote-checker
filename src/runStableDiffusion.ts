import { DataProvider, DataSet } from "./internal/dataTransformer";
import { handleT2IRequest } from "./stable-diffusion/network";
import fs from "fs";
import { multiTraitsToPrompt } from "./stable-diffusion/prompt";
import {
  INNER_SD_TEXT2IMG_API_POOL,
  SD_API_GLOBAL_TEXT_TO_IMAGE,
} from "./stable-diffusion/config";

const globalProvider = new DataProvider();
const MAX_POOL_SIZE = 1;

const execute = async () => {
  await mainProcess();
  console.log("All tasks finished!");
};

export interface Img2ImgProps {
  traits: Array<{ traitType: string; value: string }>;
}

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
  for (let index = 0; index < length; index += MAX_POOL_SIZE) {
    const now = Date.now();
    const randomMachineUrl = INNER_SD_TEXT2IMG_API_POOL.sort(
      () => Math.random() - 0.5
    ).slice(0, MAX_POOL_SIZE);

    await waitForCertainTime(5 * 1000);
    const stepWords = words.slice(index, index + MAX_POOL_SIZE);
    console.warn(
      `Now deal with ${mainSubject} - trait ${stepWords}: ${index + 1} ~ ${
        index + stepWords.length + 1
      } / ${length}`
    );
    const promises: any[] = [];
    stepWords.forEach((_, i) => {
      const path = `./raw/${mainSubject}/${stepWords[i].replace(/\s/g, "")}`;
      fs.mkdirSync(path, { recursive: true });
      promises.push(
        onCommand({
          prompt: multiTraitsToPrompt([
            { traitType: mainSubject, value: stepWords[i] },
          ]),
          mainSubject,
          trait: stepWords[i],
          index: index + i,
          mode: "inner",
          amount: length,
          path,
          apiPath: randomMachineUrl[i],
        })
      );
      promises.push(
        onCommand({
          prompt: multiTraitsToPrompt([
            { traitType: mainSubject, value: stepWords[i] },
          ]),
          mainSubject,
          trait: stepWords[i],
          index: index + i,
          mode: "global",
          amount: length,
          path,
          apiPath: SD_API_GLOBAL_TEXT_TO_IMAGE,
        })
      );
    });
    await Promise.all(promises);
    console.log(`Time cost: ${Date.now() - now}ms`);
    try {
    } catch (e) {
      console.error(
        `Error when dealing with ${mainSubject} - trait ${stepWords}: ${
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
