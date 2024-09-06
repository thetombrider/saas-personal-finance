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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const createTokenResponse = await plaidClient.linkTokenCreate({
      user: { client_user_id: 'user-id' }, // Replace with actual user ID
      client_name: 'Your App Name',
      products: [Products.Transactions],
      country_codes: [CountryCode.IT],
      language: 'en',
    });

    res.status(200).json({ link_token: createTokenResponse.data.link_token });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ message: 'Error creating link token' });
  }
}
