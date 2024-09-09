'use client'

import { useState, useEffect } from 'react'
import { ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Configuration, PlaidApi } from 'plaid' // Update import

type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  accountId: string
}

type Account = {
  id: string
  name: string
}

export default function TransactionsPage() {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data for accounts and transactions
  const accounts: Account[] = [
    { id: '1', name: 'Checking Account' },
    { id: '2', name: 'Savings Account' },
    { id: '3', name: 'Credit Card' },
  ]

  const transactions: Transaction[] = [
    { id: '1', date: '2023-05-01', description: 'Grocery Shopping', amount: -120.50, accountId: '1' },
    { id: '2', date: '2023-05-02', description: 'Salary Deposit', amount: 3000, accountId: '1' },
    { id: '3', date: '2023-05-03', description: 'Electric Bill', amount: -85.20, accountId: '1' },
    { id: '4', date: '2023-05-04', description: 'Interest Credit', amount: 5.50, accountId: '2' },
    { id: '5', date: '2023-05-05', description: 'Online Shopping', amount: -65.99, accountId: '3' },
    { id: '6', date: '2023-05-06', description: 'Restaurant Dinner', amount: -89.00, accountId: '3' },
    { id: '7', date: '2023-05-07', description: 'Gas Station', amount: -45.00, accountId: '1' },
    { id: '8', date: '2023-05-08', description: 'Movie Tickets', amount: -30.00, accountId: '3' },
    { id: '9', date: '2023-05-09', description: 'Savings Transfer', amount: -500, accountId: '1' },
    { id: '10', date: '2023-05-09', description: 'Savings Transfer', amount: 500, accountId: '2' },
  ]

  const filteredTransactions = transactions.filter(transaction => 
    (selectedAccounts.length === 0 || selectedAccounts.includes(transaction.accountId)) &&
    (searchTerm === '' || transaction.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => 
      prev.includes(accountId) 
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    )
  }

  const plaidClient = new PlaidApi(new Configuration({ // Initialize Plaid client
    basePath: process.env.PLAID_ENV, // Adjust as needed
    baseOptions: {
      headers: {
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
        'PLAID-SECRET': process.env.PLAID_SECRET,
      },
    },
  }))

  const fetchTransactions = async () => { // New function to fetch transactions
    try {
      const response = await plaidClient.transactionsGet({
        access_token: 'your_access_token', // Replace with your access token
        start_date: '2023-01-01', // Adjust as needed
        end_date: '2023-12-31', // Adjust as needed
      })
      return response.data.transactions // Return fetched transactions
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return [] // Return empty array on error
    }
  }

  useEffect(() => { // Fetch transactions on component mount
    const getTransactions = async () => {
      try {
        const fetchedTransactions = await fetchTransactions()
        // Update your state with fetched transactions here
      } catch (error) {
        console.error('Error in getTransactions:', error)
      }
    }
    getTransactions()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Transactions</h1>
      
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <Label className="flex items-center">
            <span className="mr-2">Filter by account:</span>
          </Label>
          {accounts.map(account => (
            <Button
              key={account.id}
              variant={selectedAccounts.includes(account.id) ? "default" : "outline"}
              onClick={() => handleAccountToggle(account.id)}
            >
              {account.name}
            </Button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{accounts.find(a => a.id === transaction.accountId)?.name}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? (
                        <ArrowUpCircle className="inline-block h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownCircle className="inline-block h-4 w-4 mr-1" />
                      )}
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}