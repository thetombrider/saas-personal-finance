import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(req: Request) {
  try {
    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'user-id' }, // Replace with actual user ID
      client_name: 'Finance App',
      products: ["transactions"],
      country_codes: ["IT"],
      language: 'en',
    });

    return new Response(JSON.stringify({ link_token: createTokenResponse.data.link_token }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating link token:', error);
    return new Response(JSON.stringify({ message: 'Error creating link token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
