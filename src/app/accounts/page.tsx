'use client'
import { useState } from 'react'
import { PlusCircle, MinusCircle, CreditCard, DollarSign, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Account = {
  id: string
  name: string
  balance: number
  transactions: Transaction[]
}

type Transaction = {
  id: string
  description: string
  amount: number
  date: string
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      name: 'Checking Account',
      balance: 5000,
      transactions: [
        { id: '1', description: 'Grocery Shopping', amount: -120, date: '2023-04-15' },
        { id: '2', description: 'Salary Deposit', amount: 3000, date: '2023-04-01' },
      ]
    },
    {
      id: '2',
      name: 'Savings Account',
      balance: 10000,
      transactions: [
        { id: '3', description: 'Interest Credit', amount: 50, date: '2023-04-30' },
        { id: '4', description: 'Transfer from Checking', amount: 1000, date: '2023-04-15' },
      ]
    }
  ])

  const [newAccountName, setNewAccountName] = useState('')
  const [newAccountBalance, setNewAccountBalance] = useState('')
  const [selectedAccountId, setSelectedAccountId] = useState('')

  const addAccount = () => {
    if (newAccountName && newAccountBalance) {
      const newAccount: Account = {
        id: (accounts.length + 1).toString(),
        name: newAccountName,
        balance: parseFloat(newAccountBalance),
        transactions: []
      }
      setAccounts([...accounts, newAccount])
      setNewAccountName('')
      setNewAccountBalance('')
    }
  }

  const removeAccount = () => {
    if (selectedAccountId) {
      setAccounts(accounts.filter(account => account.id !== selectedAccountId))
      setSelectedAccountId('')
    }
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
              </div>
            </div>
            <div className="flex items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mr-2">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Account</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new account you'd like to add.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="balance" className="text-right">
                        Balance
                      </Label>
                      <Input
                        id="balance"
                        type="number"
                        value={newAccountBalance}
                        onChange={(e) => setNewAccountBalance(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={addAccount}>Add Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <MinusCircle className="mr-2 h-4 w-4" />
                    Remove Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Remove Account</DialogTitle>
                    <DialogDescription>
                      Select the account you'd like to remove.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="account" className="text-right">
                        Account
                      </Label>
                      <Select onValueChange={setSelectedAccountId} value={selectedAccountId}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select an account" />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map(account => (
                            <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={removeAccount} variant="destructive">Remove Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Aggregated Bank Statement</h2>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total Balance</span>
              <span className="text-2xl font-bold">${totalBalance.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
              {accounts.map(account => (
                <div key={account.id} className="flex justify-between items-center">
                  <span>{account.name}</span>
                  <span className="font-medium">${account.balance.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-6">Individual Accounts</h2>

        <div className="space-y-6">
          {accounts.map(account => (
            <div key={account.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{account.name}</h3>
                <span className="text-2xl font-bold">${account.balance.toLocaleString()}</span>
              </div>
              <h4 className="text-lg font-medium mb-2">Recent Transactions</h4>
              <ul className="space-y-2">
                {account.transactions.map(transaction => (
                  <li key={transaction.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                    <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? (
                        <ArrowUpCircle className="inline-block h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownCircle className="inline-block h-4 w-4 mr-1" />
                      )}
                      ${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}