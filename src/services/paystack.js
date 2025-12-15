const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Check if we have valid Paystack keys
const USE_MOCK = !PAYSTACK_SECRET_KEY || PAYSTACK_SECRET_KEY.includes('xxxxx');

const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Mock payment storage (in production, this would be in database)
const mockPayments = new Map();

// Initialize a transaction
exports.initializeTransaction = async ({ email, amount, reference, callback_url, metadata }) => {
  // Use mock mode if no valid keys
  if (USE_MOCK) {
    console.log('Using MOCK Paystack mode');
    mockPayments.set(reference, {
      email,
      amount,
      reference,
      metadata,
      status: 'pending',
    });

    // Return mock authorization URL that goes to our mock payment page
    return {
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: `${process.env.FRONTEND_URL}/mock-payment?reference=${reference}&amount=${amount}&callback=${encodeURIComponent(callback_url)}`,
        access_code: 'mock_' + reference,
        reference: reference,
      },
    };
  }

  try {
    const response = await paystackAPI.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Paystack expects amount in pesewas
      reference,
      callback_url,
      currency: 'GHS',
      channels: ['mobile_money', 'card'], // Enable both Mobile Money and Card
      metadata,
    });
    return response.data;
  } catch (error) {
    console.error('Paystack initialize error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
};

// Verify a transaction
exports.verifyTransaction = async (reference) => {
  // Use mock mode if no valid keys
  if (USE_MOCK) {
    const payment = mockPayments.get(reference);
    if (payment) {
      // Mark as successful
      payment.status = 'success';
      return {
        status: true,
        message: 'Verification successful',
        data: {
          status: 'success',
          reference: reference,
          amount: payment.amount * 100,
          metadata: payment.metadata,
          channel: 'mobile_money',
          authorization: {
            bank: 'MTN Mobile Money',
          },
        },
      };
    }
    throw new Error('Transaction not found');
  }

  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    return response.data;
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
};

// List banks (for bank transfers)
exports.listBanks = async () => {
  if (USE_MOCK) {
    return { status: true, data: [] };
  }

  try {
    const response = await paystackAPI.get('/bank?country=ghana');
    return response.data;
  } catch (error) {
    console.error('Paystack list banks error:', error.response?.data || error.message);
    throw new Error('Failed to fetch banks');
  }
};
