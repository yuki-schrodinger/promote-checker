export interface CreateExperimentConfig {
  experimentId: string;
  submitterName: string;
  noOfSamples: number;
  experimentDetails: string;
  traitsFile: string;
  createPromptFile: string;
  configFile: string;
  submittedDate: string;
  status: string;
  comments: string[];
}

export interface CreateExperimentResult {
  job_id: string;
}

/**
 * {
  "experimentDetails": "Test for 9 traits",
  "experimentId": "3CUtb05IHbHFVK0",
  "status": "Success",
  "submittedDate": 1710487826,
  "submitterName": "Faizal"
}
 */

export type GetExperimentListResult = Array<GetExperimentListResultItem>;
export interface GetExperimentListResultItem {
  experimentDetails: string;
  experimentId: string;
  status: string;
  submittedDate: number;
  submitterName: string;
}

/**
 * {
  "user": "Yuki-Test",
  "descriptionPrefix": "",
  "amount": 10,
  "extraAmount": 20,
  "mode": "standard",
}
 */

export interface CreatePromptConfig {
  user: string;
  descriptionPrefix: string;
  amount: number;
  extraAmount: number;
  mode: "standard" | "ignoreAwait" | string;
}
