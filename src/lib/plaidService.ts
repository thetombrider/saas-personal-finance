import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Function to create link token
export const createLinkToken = async (userId: string) => {
  console.log(`Creating link token for user ID: ${userId}`);
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Finance App',
    products: [Products.Transactions],
    country_codes: [CountryCode.It],
    language: 'en',
  });
  console.log('Link token created:', response.data.link_token);
  return response;
};

// Function to exchange public token
export const exchangePublicToken = async (publicToken: string) => {
  console.log('Exchanging public token:', publicToken);
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  console.log('Public token exchanged:', response.data);
  return response;
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