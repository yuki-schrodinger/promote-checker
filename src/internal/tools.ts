import moment from "moment";

export const generateRandomString = (length = 15) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

export const getTodayDateTime = () => {
  const currentDateWithTime = moment();
  const formattedDateTime = currentDateWithTime.format("YYYY-MM-DD HH:mm:ss");
  return formattedDateTime;
};
