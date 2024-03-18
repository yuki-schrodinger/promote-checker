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

export type GetExperimentListResult = Array<GetExperimentListResultItem>;
export interface GetExperimentListResultItem {
  experimentDetails: string;
  experimentId: string;
  status: string;
  submittedDate: number;
  submitterName: string;
}

export interface CreatePromptConfig {
  user: string;
  descriptionPrefix: string;
  amount: number;
  extraAmount: number;
  mode: "standard" | "ignoreAwait" | string;
}

export type PromptCreationConfig = {
  id: string;
  version: string;
  prefix: string;
  suffix: string;
};
