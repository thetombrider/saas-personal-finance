'use client'
import { useState } from 'react'
import { DollarSign, CreditCard, Wallet, ArrowDownCircle, ArrowUpCircle, PiggyBank, LayoutDashboard, CreditCard as CardIcon, Menu } from 'lucide-react'

export default function Component() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Mock data for the dashboard
  const financialData = {
    accountBalance: 15000,
    income: 5000,
    expenses: 3500,
    savings: 1500,
    recentTransactions: [
      { id: 1, description: 'Grocery Shopping', amount: -120, date: '2023-04-15' },
      { id: 2, description: 'Salary Deposit', amount: 5000, date: '2023-04-01' },
      { id: 3, description: 'Electric Bill', amount: -85, date: '2023-04-10' },
      { id: 4, description: 'Online Shopping', amount: -65, date: '2023-04-13' },
      { id: 5, description: 'Freelance Payment', amount: 1000, date: '2023-04-20' },
    ],
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white w-64 h-full flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static fixed z-30`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Finance App</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <a href="/" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md p-2">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <a href="/accounts" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md p-2">
                <CardIcon className="h-5 w-5" />
                <span>Accounts</span>
              </a>
            </li>
            <li>
              <a href="/transactions" className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded-md p-2">
                <CreditCard className="h-5 w-5" />
                <span>Transactions</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-semibold text-gray-800">Personal Finance Dashboard</h1>
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
                <Menu className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card 
                title="Account Balance" 
                amount={financialData.accountBalance} 
                icon={<PiggyBank className="h-6 w-6" />}
                className="md:col-span-2 bg-blue-50"
              />
              <Card title="Income" amount={financialData.income} icon={<DollarSign className="h-6 w-6" />} />
              <Card title="Expenses" amount={financialData.expenses} icon={<CreditCard className="h-6 w-6" />} />
              <Card 
                title="Savings" 
                amount={financialData.savings} 
                icon={<Wallet className="h-6 w-6" />}
                className="md:col-span-2"
              />
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Transactions</h2>
              <ul className="space-y-4">
                {financialData.recentTransactions.map((transaction) => (
                  <li key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{transaction.description}</p>
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
          </div>
        </main>
      </div>
    </div>
  )
}

interface CardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  className?: string;
}

function Card({ title, amount, icon, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">${amount.toLocaleString()}</p>
    </div>
  )
}