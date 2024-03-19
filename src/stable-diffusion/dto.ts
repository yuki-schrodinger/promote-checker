export interface GenerateImageRequest {
  prompt: string;
  negative_prompt: string;
  steps: number;
  batch_size: number;
  width: number;
  height: number;
  n_iter: 1;
  sampler_index: "DPM++ 2M Karras" | string;
  sd_model_checkpoint?:
    | "revAnimated_v122.safetensors"
    | "sd_xl_base_1.0_0.9vae"
    | string;
}

export interface GenerateImageResponse {
  images: Array<string>;
  parameters: any;
  info: string;
}

export type Loc = string | number;

export interface GeneralError {
  detail: {
    loc: Array<Loc>;
    msg: string;
    type: string;
  }[];
}
