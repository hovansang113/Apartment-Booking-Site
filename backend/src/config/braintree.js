const braintree = require('braintree');

// BRAINTREE_ENVIRONMENT: 'sandbox' (dev/test, mac dinh) hoac 'production'
// (tien that). Luon mac dinh sandbox neu bien nay thieu/go sai - an toan
// tuong tu SEO_ALLOW_INDEXING, tranh vo tinh chay giao dich that luc dev.
const isProduction = process.env.BRAINTREE_ENVIRONMENT === 'production';

const gateway = new braintree.BraintreeGateway({
  environment: isProduction ? braintree.Environment.Production : braintree.Environment.Sandbox,
  merchantId: process.env.BRAINTREE_MERCHANT_ID,
  publicKey: process.env.BRAINTREE_PUBLIC_KEY,
  privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});

module.exports = gateway;
