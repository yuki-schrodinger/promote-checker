import { DataProvider, DataSet } from "./internal/dataTransformer";
import { handleT2IRequest } from "./stable-diffusion/network";

const globalProvider = new DataProvider();

const execute = async () => {
  await mainProcess();
  console.log("All tasks finished!");
};

const mainProcess = async () => {
  await globalProvider.prepareData();
  const data = globalProvider.data;
  console.log(`Total ${data.length} main subjects found.`);
  for (let i = 0; i < data.length; i++) {
    await onMainSubject(data[i]);
  }
};

const onMainSubject = async (dataSet: DataSet) => {
  console.warn(`Now deal with ${dataSet.mainSubject}...`);
  const { mainSubject, words, length } = dataSet;
  for (let index = 0; index < length; index++) {
    const word = words[index];
    await waitForCertainTime(5 * 1000);
    try {
      const res = await handleT2IRequest(mainSubject, word);
      console.log(
        `Finished ${mainSubject} - trait ${word}: ${index + 1}/${length}`
      );
      console.log(`Result: ${JSON.stringify(res)}`);
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

const waitForCertainTime = (time: number = 15 * 1000) => {
  return new Promise<void>((resolve, _) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

execute();
