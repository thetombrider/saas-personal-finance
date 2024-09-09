import { NextApiRequest, NextApiResponse } from 'next';
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import getConfig from 'next/config';
import { toast } from 'react-hot-toast';
import { exchangePublicToken } from '@/lib/plaidService';

const { publicRuntimeConfig } = getConfig();

const configuration = new Configuration({
  basePath: PlaidEnvironments[publicRuntimeConfig.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

export async function POST(req: Request) {
  const { public_token } = await req.json();

  try {
    const exchangeResponse = await exchangePublicToken(public_token);
    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    console.log('Access Token:', accessToken);

    return new Response(JSON.stringify({ message: 'Access token obtained successfully', accessToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    return new Response(JSON.stringify({ error: 'Failed to exchange token' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}