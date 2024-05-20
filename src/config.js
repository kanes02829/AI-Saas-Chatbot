const dev = {
  baseURL: 'http://localhost:8081/api/',
  landingPageUrl: 'http://localhost:3080',
  stripe: {
    free: 'price_1NEMdAH6D6mILpKsqcl47qyC',
    entry: 'price_1NEMVEH6D6mILpKsl2H8oRQP',
    pro: 'price_1NFoAzH6D6mILpKsPc09hZ03',
  },
};

const prod = {
  baseURL: 'http://localhost:8081/api/',
  landingPageUrl: 'https://app.openaitemplate.com',
  stripe: {
    free: 'price_1NEMdAH6D6mILpKsqcl47qyC',
    entry: 'price_1NEMVEH6D6mILpKsl2H8oRQP',
    pro: 'price_1NFoAzH6D6mILpKsPc09hZ03',
  },
};
// http://contactlly.com/api/
const config = process.env.NODE_ENV === 'development' ? dev : prod;

export default config;
