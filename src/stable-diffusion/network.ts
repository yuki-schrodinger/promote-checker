import { sendPostRequest } from "../internal/request";
import { GenerateImageRequest, GenerateImageResponse } from "./dto";

export const handleT2IRequest = async (
  prompt: string,
  apiPath: string
): Promise<GenerateImageResponse & { payload: GenerateImageRequest }> => {
  const payload: GenerateImageRequest = {
    prompt,
    negative_prompt: "NSFW", // As we all know, it's Not Safe For Work =)
    steps: 20,
    batch_size: 1,
    width: 512,
    height: 512,
    n_iter: 1,
    sampler_index: "DPM++ 2M Karras",
    sd_model_checkpoint: "revAnimated_v122.safetensors",
  };
  console.log("payload:", JSON.stringify(payload));
  const data = await sendPostRequest(apiPath, payload);
  return Object.assign({}, data, { payload });
};
