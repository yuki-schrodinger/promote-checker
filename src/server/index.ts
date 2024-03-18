import http from "http";
import url from "url";
import { TextToImageRequest } from "./model";
import { sendPostRequest } from "../internal/request";
import { SD_API_TEXT_TO_IMAGE } from "../stable-diffusion/config";
import { traitsToPrompt } from "../stable-diffusion/prompt";

const port = Number(process.env.THE_PORT) || 3002;

const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url as string, true);
  const { pathname } = queryObject;
  if (pathname !== "/traits-to-image") {
    return failBack(res, "Invalid request path.");
  }
  const {
    mainSubject,
    traits,
    negative_prompt = "NSFW",
    steps = 20,
    batch_size = 1,
    width = 1024,
    height = 1024,
    n_iter = 1,
    sampler_index = "DPM++ 2M Karras",
  } = queryObject.query as unknown as TextToImageRequest;
  if (!mainSubject || !traits) {
    return failBack(res, "mainSubject or traits field are required.");
  }
  const prompt = traitsToPrompt(mainSubject, traits);
  if (!prompt) {
    return failBack(res, "Error when dealing with prompt.");
  }
  try {
    const imageRes = await sendPostRequest(SD_API_TEXT_TO_IMAGE, {
      prompt,
      negative_prompt,
      steps,
      batch_size,
      width,
      height,
      n_iter,
      sampler_index,
    });
    return successBack(res, imageRes);
  } catch (e) {
    console.error(e);
    return failBack(res, "Error when dealing with text to image request.", e);
  }
});

const successBack = (res: http.ServerResponse, data: any) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
};

const failBack = (res: http.ServerResponse, reason: string, e?: any) => {
  res.writeHead(403, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ errMsg: reason, error: e }));
};

server.listen(port);
