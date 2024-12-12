export const logger = {
  info: (identifier: string, message: string) => {
    console.log(getFormattedDate(), `[${identifier}]`, "[INFO] -", message);
  },
  error: (identifier: string, message: string) => {
    console.log(getFormattedDate(), `[${identifier}]`, "[ERROR] -", message);
  },
};

function getFormattedDate(date = new Date()) {
  return date.toISOString();
}
