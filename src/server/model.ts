export interface TextToImageRequest {
  traits: Array<{ traitType: string; value: string }>;
  // negative_prompt?: string;
  // steps?: number;
  // batch_size?: number;
  // width?: number;
  // height?: number;
  // n_iter?: 1;
  // seed?: number;
  // sampler_index?: "DPM++ 2M Karras" | string;
  // sd_model_checkpoint?:
  //   | "revAnimated_v122.safetensors"
  //   | "sd_xl_base_1.0_0.9vae"
  //   | string;
  mode?: "standard" | "SG";
}
