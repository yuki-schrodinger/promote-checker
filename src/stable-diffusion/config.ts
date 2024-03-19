export const SD_BASE_URL_GLOBAL = "http://fs.iis.pub:13888/sdapi/v1";
export const SD_BASE_URL_INNER1 = "http://34.85.92.223";
export const SD_BASE_URL_INNER2 = "http://34.85.91.91";

export const SD_API_GLOBAL_TEXT_TO_IMAGE = `${SD_BASE_URL_GLOBAL}/txt2img`;

const INNER_SD_TEXT2IMG_API_POOL: string[] = [];

for (let i = 0; i < 4; i++) {
  INNER_SD_TEXT2IMG_API_POOL.push(
    `${SD_BASE_URL_INNER1}:786${i}/sdapi/v1/txt2img`
  );
  INNER_SD_TEXT2IMG_API_POOL.push(
    `${SD_BASE_URL_INNER2}:786${i}/sdapi/v1/txt2img`
  );
}

export { INNER_SD_TEXT2IMG_API_POOL };
