import { createPrompt } from "../internal/createPrompt.js";
import * as promptConfig from "../../config/config.json";

/**
 * used to convert traits to prompt, please remember SG's API will only accept 1 prompt
 * @param traits
 * @returns
 */
export const singleTraitsToPrompt = (
  mainSubject: string,
  traits: string
): string => {
  return createPrompt(promptConfig, [
    { traitType: mainSubject, value: traits },
  ]);
};

// A cute cat with two hands raised, ((pixel art)), <lora:pixelcat30:0.3>, xxx breed, xxx clothes, xxx background,holo hat, ...

export const multiTraitsToPrompt = (
  traits: Array<{ traitType: string; value: string }>
): string => {
  let prompt =
    "<lora:pixelcat1000lr08b2e8-000002:0.3>, cute cat standing character, ((pixel art)), ";
  traits.forEach((trait) => {
    prompt += `${trait.traitType}:${trait.value}, `;
  });
  return prompt;
};
