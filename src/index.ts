import { API_CREATE_EXPERIMENT, API_GET_EXPERIMENTS } from "./config";
import { DataProvider, DataSet } from "./dataTransformer";
import { sendGetRequest, sendPostRequest } from "./request";
import * as userConfig from "../config/core.json";
import * as rawConfig from "../config/config.json";
import fs from "fs";

import {
  CreateExperimentConfig,
  CreatePromptConfig,
  GetExperimentListResult,
} from "./dto";
import { generateRandomString, getTodayDateTime } from "./tools";
import path from "path";

const taskConfig: CreatePromptConfig = userConfig;

const taskConfigPath = path.join(__dirname, "../config/createPrompt.js");
const taskConfigContent = fs.readFileSync(taskConfigPath, "utf8");

const assertConfig = () => {
  if (!taskConfig.user) {
    throw new Error("User is not defined");
  }
  if (!(taskConfig.amount > 0)) {
    throw new Error("Amount is not acceptable");
  }
};

const globalProvider = new DataProvider();

const execute = async () => {
  assertConfig();
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
  const { amount, extraAmount, user, mode } = taskConfig;
  const taskNum =
    Math.floor(dataSet.length / amount) + (dataSet.length % amount > 0 ? 1 : 0);
  for (let i = 0; i < taskNum; i++) {
    const experimentId = generateRandomString();
    const start = i * amount;
    const end = (i + 1) * amount;
    const words = dataSet.words.slice(start, end);
    const traits: any = {};
    traits[dataSet.mainSubject] = words;
    const payload: CreateExperimentConfig = {
      experimentId,
      submitterName: user,
      noOfSamples: words.length + extraAmount,
      experimentDetails: `Test ${i + 1} / ${amount} for ${dataSet.mainSubject}`,
      traitsFile: JSON.stringify(traits),
      status: "SUBMITTED",
      submittedDate: getTodayDateTime(),
      comments: [],
      createPromptFile: taskConfigContent,
      configFile: JSON.stringify(rawConfig),
    };
    try {
      await sendPostRequest(API_CREATE_EXPERIMENT, payload);
      console.log(
        `Experiment ${experimentId} : ${
          i + 1
        } / ${taskNum} created successfully!`
      );
      console.log("Waiting for the experiment to finish...");
      mode === "ignoreAwait"
        ? await waitForCertainTime(3000)
        : await makeSureExperimentFinished(experimentId);
    } catch (e) {
      console.error("error when trying to create experiment: ", e);
      console.error("task: ", `start: ${start}, end: ${end}`);
      console.error(
        "this task will be skipped, make sure to check it later. the data is : " +
          JSON.stringify(traits)
      );
    }
  }
};

const makeSureExperimentFinished = async (
  experimentId: string,
  expireTime: number = 2 * 60 * 1000
) => {
  const expirePromise = new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      console.log(
        `Await experiment expired:  max ${expireTime} ms. Now to the next one.`
      );
      resolve();
    }, expireTime);
  });
  const checkPromise = new Promise<void>(async (resolve, reject) => {
    while (true) {
      await waitForCertainTime(5000);
      const res = (await sendGetRequest(
        API_GET_EXPERIMENTS
      )) as GetExperimentListResult;
      const found = res.find((item: any) => item.experimentId === experimentId);
      if (found && found.status === "Success") {
        console.log(`Experiment ${experimentId} finished.`);
        await waitForCertainTime(1000);
        resolve();
        break;
      }
    }
  });
  await Promise.race([expirePromise, checkPromise]);
};

const waitForCertainTime = (time: number = 15 * 1000) => {
  return new Promise<void>((resolve, _) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

execute();
