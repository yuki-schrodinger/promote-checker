import { sendPostRequest } from "../internal/request";
import { SD_API_TEXT_TO_IMAGE } from "./config";
import { GenerateImageRequest, GenerateImageResponse } from "./dto";
import { traitsToPrompt } from "./prompt";

export const handleT2IRequest = async (
  mainSubject: string,
  traits: string
): Promise<GenerateImageResponse> => {
  const prompt = traitsToPrompt(mainSubject, traits);
  const payload: GenerateImageRequest = {
    prompt,
    negative_prompt: "NSFW", // As we all know, it's Not Safe For Work =)
    steps: 20,
    batch_size: 1,
    width: 1024,
    height: 1024,
    n_iter: 1,
    sampler_index: "DPM++ 2M Karras",
  };
  console.log("payload:", JSON.stringify(payload));
  return await sendPostRequest(SD_API_TEXT_TO_IMAGE, payload);
};
