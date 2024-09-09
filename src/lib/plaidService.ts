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
  return await plaidClient.linkTokenCreate({
    user: { client_user_id: userId },
    client_name: 'Finance App',
    products: [Products.Transactions],
    country_codes: [CountryCode.It],
    language: 'en',
  });
};

// Function to exchange public token
export const exchangePublicToken = async (publicToken: string) => {
  return await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
};

// Function to fetch transactions
export const fetchTransactions = async (access_token: string) => {
  const response = await plaidClient.transactionsGet({
    access_token,
    start_date: '2023-01-01', // Adjust as needed
    end_date: '2023-12-31', // Adjust as needed
  })
  return response.data.transactions
}