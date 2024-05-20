const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

// const isValidUrl = (urlString) => {
//   try {
//     return Boolean(new URL(urlString));
//   } catch (e) {
//     return false;
//   }
// };

const isValidUrl = (urlString) => {
  let url;
  try {
    url = new URL(urlString);
  } catch (e) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

const isEmpty = (value) => {
  const isValEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'object' &&
      Object.keys(value).length === 0 &&
      value === null) ||
    (typeof value === 'string' && value.trim().length === 0);

  return isValEmpty;
};

const utilities = {
  validateEmail: validateEmail,
  isValidUrl: isValidUrl,
  isEmpty: isEmpty,
};

export default utilities;
