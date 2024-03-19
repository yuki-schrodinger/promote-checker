import http from "http";
import url from "url";
import { TextToImageRequest } from "./model";
import {
  multiTraitsToPrompt,
  singleTraitsToPrompt,
} from "../stable-diffusion/prompt";

const port = Number(process.env.THE_PORT) || 3002;

const server = http.createServer(async (req, res) => {
  const queryObject = url.parse(req.url as string, true);
  const { pathname } = queryObject;
  if (pathname !== "/generate-prompt") {
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
      const { traits = [], mode = "standard" } = JSON.parse(
        body
      ) as unknown as TextToImageRequest;
      if (!(traits.length > 0)) {
        return failBack(res, "traits field are required.");
      }
      const prompt =
        mode === "SG"
          ? singleTraitsToPrompt(traits[0].traitType, traits[0].value)
          : multiTraitsToPrompt(traits);
      if (!prompt) {
        return failBack(res, "Error when dealing with prompt.");
      }
      return successBack(res, { prompt });
    } catch (e) {
      console.error(e);
      return failBack(res, "Error when dealing with text to image request.", e);
    }
  });
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
