export interface Img2ImgProps {
  prompt: string;
  steps: number;
  sampler_name: string;
  cfg_scale: number;
  seed: number;
  height: number;
  width: number;
  init_images: string[];
}

export interface Img2ImgResponse {
  images: string[];
  parameters: any;
  info: string;
}

export interface Img2ImgAPIProps {
  traits: Array<{ traitType: string; value: string }>;
  steps?: number;
  sampler_name?: string;
  cfg_scale?: number;
  seed?: number;
  height?: number;
  width?: number;
}
