export interface TextToImageRequest {
  mainSubject: string;
  traits: string;
  negative_prompt?: string;
  steps?: number;
  batch_size?: number;
  width?: number;
  height?: number;
  n_iter?: 1;
  sampler_index?: "DPM++ 2M Karras" | string;
}
