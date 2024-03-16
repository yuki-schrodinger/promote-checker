import needle from "needle";

export const sendGetRequest = async (
  path: string,
  params?: any,
  headers?: any
) => {
  const res = await needle("get", path, params, { headers });
  if (res.statusCode === 200) {
    return res.body;
  }
  throw new Error(`Error: ${res.statusCode}`);
};

export const sendPostRequest = async (
  path: string,
  body: any,
  headers?: any
) => {
  const res = await needle("post", path, body, { headers, json: true });
  if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
    return res.body;
  }
  throw new Error(`Error: ${res.statusCode}`);
};
