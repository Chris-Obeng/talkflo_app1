# Dodo Payments Documentation

## Perform Platform-specific Setup for React Native SDK
After installing the SDK, platform-specific configurations are required for iOS and Android. These steps ensure proper linking and build processes for your native application.

**SOURCE:** https://context7_llms

**LANGUAGE:** bash
```bash
cd ios && pod install && npm run ios
```

**LANGUAGE:** bash
```bash
npm run android
```

---

## Clone and Setup Dodo Payments Next.js Boilerplate
Commands to clone the Dodo Payments Next.js minimal boilerplate repository from GitHub, navigate into the project directory, and install its necessary dependencies using npm. This provides a quick and efficient starting point for integration.

**SOURCE:** https://context7_llms

**LANGUAGE:** bash
```bash
git clone https://github.com/dodopayments/dodo-nextjs-minimal-boilerplate
cd dodo-nextjs-minimal-boilerplate
npm install
```

---

## Install Go SDK for Dodo Payments
This snippet provides the go get command to install the official Dodo Payments SDK for Go applications. It offers a clean and idiomatic Go interface with strongly typed responses.

**SOURCE:** https://context7_llms

**LANGUAGE:** bash
```bash
go get github.com/dodopayments/dodopayments-go
```

---

## Install Localtunnel Globally
Install the localtunnel command-line interface globally using npm, making it accessible from any directory on your system. This requires Node.js to be installed.

**SOURCE:** https://localtunnel.github.io/www/

**LANGUAGE:** bash
```bash
npm install -g localtunnel
```

---

## Example: Subscription Request with Allowed Payment Methods
This JSON example illustrates a subscription creation request, specifying the `product_id`, `customer_id`, and a restricted list of `allowed_payment_method_types` like credit, SEPA, and iDEAL.

**SOURCE:** https://context7_llms

**LANGUAGE:** json
```json
{
  "product_id": "prod_123",
  "customer_id": "cust_456",
  "allowed_payment_method_types": [
    "credit",
    "sepa",
    "ideal"
  ]
}
```

---

## Start Development Server for Testing
Command to start the local development server, typically used for testing web applications built with frameworks like Next.js, React, or Vue.js. This allows developers to preview and test their integration locally before deployment.

**SOURCE:** https://context7_llms

**LANGUAGE:** bash
```bash
npm run dev
```

---

## Example API Response for Subscription Creation
An example JSON structure returned after a successful subscription creation, including client secret, customer details, metadata, payment link, recurring amount, and subscription ID.

**SOURCE:** https://context7_llms

**LANGUAGE:** json
```json
{
  "client_secret": "<string>",
  "customer": {
    "customer_id": "<string>",
    "email": "<string>",
    "name": "<string>"
  },
  "metadata": {},
  "payment_link": "<string>",
  "recurring_pre_tax_amount": 1,
  "subscription_id": "<string>"
}
```

---

## Install Dodo Payments Checkout SDK
Instructions for installing the Dodo Payments Checkout SDK using npm, yarn, or pnpm package managers. This is the first step to set up the development environment for integrating the SDK into your project.

**SOURCE:** https://context7_llms

**LANGUAGE:** bash
```bash
# Using npm
npm install dodopayments-checkout

# Using yarn
yarn add dodopayments-checkout

# Using pnpm
pnpm add dodopayments-checkout
```

---

## Create Dynamic Payment Link using DodoPayments SDKs and API
This snippet demonstrates how to create a dynamic one-time payment link using the DodoPayments SDKs for Node.js, Python, and Go, as well as a direct API call example using Next.js. It shows how to initialize the client, construct the payment request body with customer, billing, and product cart details, and ensure `payment_link` is set to `true` to receive a payment link. The examples cover client initialization, payment creation, and handling the response.

**SOURCE:** https://context7_llms

**LANGUAGE:** javascript
```javascript
import DodoPayments from 'dodopayments';

const client = new DodoPayments({
bearerToken: process.env['DODO_PAYMENTS_API_KEY'], // This is the default and can be omitted
});

async function main() {
const payment = await client.payments.create({
payment_link: true,
billing: { city: 'city', country: 'AF', state: 'state', street: 'street', zipcode: 0 },
customer: { email: 'email@email.com', name: 'name' },
product_cart: [{ product_id: 'product_id', quantity: 0 }],
});

console.log(payment.payment_id);
}

main();
```

---

## Install Node.js SDK for Dodo Payments
This snippet provides the npm command to install the official Dodo Payments SDK for Node.js applications. It enables integration with the Dodo Payments API using a promise-based interface.

**SOURCE:** https://context7_llms

**LANGUAGE:** bash
```bash
npm install dodopayments