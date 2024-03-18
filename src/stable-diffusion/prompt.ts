import { createPrompt } from "../internal/createPrompt.js";
import * as promptConfig from "../../config/config.json";

/**
 * used to convert traits to prompt, please remember stable-diffusion's API will only accept 1 prompt
 * @param traits
 * @returns
 */
export const traitsToPrompt = (mainSubject: string, traits: string): string => {
  return createPrompt(promptConfig, [
    { traitType: mainSubject, value: traits },
  ]);
};
