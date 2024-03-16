import needle from "needle";

export const sendGetRequest = async (
  path: string,
  params?: any,
  headers?: any
) => {
  const res = await needle("get", path, params, { headers });
  if (res.statusCode === 200) {
    console.log(res.body);
    return res.body;
  }
  throw new Error(`Error: ${res.statusCode}`);
};

export const sendPostRequest = async (
  path: string,
  body: any,
  headers?: any
) => {
  const res = await needle("post", path, body, { headers });
  if (res.statusCode === 200) {
    console.log(res.body);
    return res.body;
  }
  throw new Error(`Error: ${res.statusCode}`);
};
