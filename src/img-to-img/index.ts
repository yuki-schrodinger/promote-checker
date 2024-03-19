import { exec } from "child_process";
import http from "http";
import url from "url";
import { failBack, successBack } from "../server";
import fs from "fs";
import { Img2ImgAPIProps, Img2ImgProps } from "./dto";
import { multiTraitsToPrompt } from "../stable-diffusion/prompt";
import { sendPostRequest } from "../internal/request";
import {
  SD_BASE_URL_INNER1,
  SD_BASE_URL_INNER2,
} from "../stable-diffusion/config";

const terminalRunner = async (command: string) => {
  return new Promise((resolve, reject) => {
    exec(command, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`error: ${error.message}`);
        throw error;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        throw stderr;
      }
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
};

const port = Number(process.env.THAT_PORT) || 3002;

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
      const { traits } = JSON.parse(body) as Img2ImgAPIProps;
      if (!(traits.length > 0)) {
        return failBack(res, "traits field are required.");
      }
      const prompt = multiTraitsToPrompt(traits);
      if (!prompt) {
        return failBack(res, "Error when dealing with prompt.");
      }
      const command = `python3 ../../py-src/main.py ${encodeURIComponent(
        JSON.stringify({
          traits,
        })
      )}`;
      terminalRunner(command);
      if (!fs.existsSync("../../py-src/output.png")) {
        return failBack(
          res,
          "Error when dealing with run command request: no img."
        );
      }
      const img = fs.readFileSync("../../py-src/output.png", "base64");
      const response = await sendPostRequest(determineDynamicUrl(), {
        prompt,
        steps: 20,
        sampler_name: "DPM++ 2M Karras",
        cfg_scale: 7,
        seed: 1,
        height: 1024,
        width: 1024,
        init_images: [img],
      } as Img2ImgProps);
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
  const now = Date.now();
  return `${now % 2 === 1 ? SD_BASE_URL_INNER1 : SD_BASE_URL_INNER2}:786${
    now % 4
  }/sdapi/v1/img2img`;
};

server.listen(port);
