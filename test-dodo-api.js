// Simple test script to verify Dodo Payments API
const DodoPayments = require('dodopayments');

const client = new DodoPayments({
  bearerToken: 'HkjDs73y4wVzS-nJ.4FG_OqXN3GJc0-CKQnwjzOI_im1TfOOm9vHXlSKUOuOY2zxW',
});

async function testAPI() {
  try {
    console.log('Testing Dodo Payments API...');
    
    // Test 1: List products
    console.log('\n1. Testing product listing...');
    const products = await client.products.list();
    console.log('Products found:', products.items.length);
    products.items.forEach(product => {
      console.log(`- ${product.name} (${product.product_id}): $${product.price/100}`);
    });
    
    // Test 2: Create a test subscription
    console.log('\n2. Testing subscription creation...');
    const subscription = await client.subscriptions.create({
      product_id: 'pdt_ssoVhz9zhE5Tvo4NzqLb5', // Monthly plan
      customer: {
        email: 'test@example.com',
        name: 'Test User',
      },
      billing: {
        city: 'San Francisco',
        country: 'US',
        state: 'CA',
        street: '123 Main St',
        zipcode: 94102,
      },
      payment_link: true,
      return_url: 'http://localhost:5173/success',
      metadata: {
        userId: 'test-user-123',
      },
      quantity: 1,
    });
    
    console.log('Subscription created successfully!');
    console.log('Subscription ID:', subscription.subscription_id);
    console.log('Payment Link:', subscription.payment_link);
    
  } catch (error) {
    console.error('API Test Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testAPI();