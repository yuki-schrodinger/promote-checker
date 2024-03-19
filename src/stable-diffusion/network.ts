import { sendPostRequest } from "../internal/request";
import { SD_API_TEXT_TO_IMAGE } from "./config";
import { GenerateImageRequest, GenerateImageResponse } from "./dto";

export const handleT2IRequest = async (
  prompt: string
): Promise<GenerateImageResponse> => {
  const payload: GenerateImageRequest = {
    prompt,
    negative_prompt: "NSFW", // As we all know, it's Not Safe For Work =)
    steps: 20,
    batch_size: 1,
    width: 512,
    height: 512,
    n_iter: 1,
    sampler_index: "DPM++ 2M Karras",
    // sd_model_checkpoint: "sd_xl_base_1.0_0.9vae",
  };
  console.log("payload:", JSON.stringify(payload));
  return await sendPostRequest(SD_API_TEXT_TO_IMAGE, payload);
};
