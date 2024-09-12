import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';
import { supabase } from '@/lib/supabaseClient';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

// Remove any custom User-Agent setting
delete configuration.baseOptions?.headers?.['User-Agent'];

export const plaidClient = new PlaidApi(configuration);

// Function to create link token
export const createLinkToken = async (userId: string) => {
  console.log(`Creating link token for user ID: ${userId}`);
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: 'Finance App',
      products: [Products.Transactions],
      country_codes: [CountryCode.It],
      language: 'en',
    });
    console.log('Link token created:', response.data.link_token);
    return response.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    if (error instanceof Error && 'response' in error && 
        typeof error.response === 'object' && error.response !== null && 
        'data' in error.response) {
      console.error('Plaid API error:', error.response.data);
    }
    throw error;
  }
};

// Function to exchange public token
export const exchangePublicToken = async (publicToken: string, userId: string) => {
  console.log('Exchanging public token:', publicToken, 'for user:', userId);
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    console.log('Public token exchanged:', response.data);
    
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    await saveAccessToken(userId, response.data.access_token, response.data.item_id);
    
    return response;
  } catch (error) {
    console.error('Error in exchangePublicToken:', error);
    if (error instanceof Error && 'response' in error && typeof error.response === 'object' && error.response !== null) {
      console.error('Plaid API error:', (error.response as { data: unknown }).data);
    }
    throw error;
  }
};

const saveAccessToken = async (userId: string, accessToken: string, itemId: string) => {
  console.log('Saving access token for user:', userId);
  try {
    const { error } = await supabase
      .from('plaid_items')
      .upsert({ user_id: userId, access_token: accessToken, item_id: itemId });

    if (error) {
      console.error('Error saving access token:', error);
      throw error;
    }
    console.log('Access token saved successfully');
  } catch (error) {
    console.error('Error in saveAccessToken:', error);
    throw error;
  }
};

// Function to fetch transactions
export const fetchTransactions = async (access_token: string) => {
  console.log('Fetching transactions with access token:', access_token);
  try {
    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: '2023-01-01',
      end_date: '2023-12-31',
    });
    console.log('Transactions fetched:', response.data.transactions);
    return response.data.transactions;
  } catch (error) {
    console.error('Error fetching transactions from Plaid:', error);
    throw error; // Rethrow to handle it in the calling function
  }
}

console.log('Plaid Environment:', process.env.PLAID_ENV);
console.log('Plaid Client ID:', process.env.PLAID_CLIENT_ID ? 'Set' : 'Not set');
console.log('Plaid Secret:', process.env.PLAID_SECRET ? 'Set' : 'Not set');