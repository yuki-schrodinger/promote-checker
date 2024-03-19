import { exec } from "child_process";
import http from "http";
import url from "url";
import { failBack, successBack } from "../server";
import fs from "fs";
import { Img2ImgAPIProps, Img2ImgProps } from "./dto";
import { multiTraitsToPrompt } from "../stable-diffusion/prompt";
import { sendPostRequest } from "../internal/request";
import {
  SD_BASE_URL_GLOBAL,
  SD_BASE_URL_INNER1,
  SD_BASE_URL_INNER2,
} from "../stable-diffusion/config";

const terminalRunner = async (command: string) => {
  return new Promise((resolve, _) => {
    exec(command, (error: any, stdout: any, stderr: any) => {
      try {
        if (error) {
          console.error(`error: ${error.message}`);
          throw error;
        }
        console.log(`stdout: ${stdout}`);
      } catch (ignored) {}
      resolve(stdout);
    });
  });
};

const port = Number(process.env.THAT_PORT) || 3010;

const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url as string, true);
  const { pathname } = queryObject;
  if (pathname !== "/traits-to-image") {
    return failBack(res, "Invalid request path.");
  }
  let body = "";
  req.on("data", (chunk) => {
    body += chunk.toString();
  });
  req.on("end", async () => {
    if (!body) {
      return failBack(res, "Invalid request body.");
    }
    try {
      const {
        traits,
        steps = 20,
        sampler_name = "DPM++ 2M Karras",
        cfg_scale = 7,
        seed = -1,
        height = 1024,
        width = 1024,
      } = JSON.parse(body) as Img2ImgAPIProps;
      if (!(traits.length > 0)) {
        return failBack(res, "traits field are required.");
      }
      const prompt = multiTraitsToPrompt(traits);
      if (!prompt) {
        return failBack(res, "Error when dealing with prompt.");
      }
      const command = `cd ./py-src && python3 ./main.py ${encodeURIComponent(
        JSON.stringify({
          traits,
        })
      )}`;
      terminalRunner(command);
      if (!fs.existsSync("./py-src/output/output.png")) {
        return failBack(
          res,
          "Error when dealing with run command request: no base img."
        );
      }
      const img = fs.readFileSync("./py-src/output/output.png", "base64");
      console.log("img:", img);
      const response = await sendPostRequest(determineDynamicUrl(), {
        prompt,
        steps,
        sampler_name,
        cfg_scale,
        seed,
        height,
        width,
        init_images: [img],
      } as Img2ImgProps);
      console.log("response:", response);
      if (!response.images) {
        return failBack(
          res,
          "Error when dealing with run command request: no images generated."
        );
      }
      return successBack(res, response);
    } catch (e) {
      console.error(e);
      return failBack(res, "Error when dealing with run command request.", e);
    }
  });
});

const determineDynamicUrl = () => {
  return `${SD_BASE_URL_GLOBAL}/img2img`;
  const now = Date.now();
  return `${now % 2 === 1 ? SD_BASE_URL_INNER1 : SD_BASE_URL_INNER2}:786${
    now % 4
  }/sdapi/v1/img2img`;
};

server.listen(port);
