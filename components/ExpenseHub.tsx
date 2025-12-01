import React from 'react';
import { Card, Button } from './UI';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';
import { ExpenseStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const mockReports = [
  { id: '1', date: '2023-10-20', reportNumber: 'ER-10245', memo: 'Client Visit - NYC', total: 450.25, status: ExpenseStatus.APPROVED },
  { id: '2', date: '2023-10-18', reportNumber: 'ER-10244', memo: 'Office Supplies', total: 85.00, status: ExpenseStatus.PAID },
  { id: '3', date: '2023-10-15', reportNumber: 'ER-10243', memo: 'Team Lunch Q3', total: 120.50, status: ExpenseStatus.SUBMITTED },
  { id: '4', date: '2023-10-10', reportNumber: 'ER-10242', memo: 'Uber to Airport', total: 45.00, status: ExpenseStatus.DRAFT },
];

const chartData = [
    { name: 'Travel', amount: 1200 },
    { name: 'Meals', amount: 450 },
    { name: 'Supplies', amount: 200 },
    { name: 'Services', amount: 800 },
];

export const ExpenseHub = () => {
  const navigate = useNavigate();

  const getStatusBadge = (status: ExpenseStatus) => {
    switch(status) {
        case ExpenseStatus.APPROVED: return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">APPROVED</span>;
        case ExpenseStatus.PAID: return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">PAID</span>;
        case ExpenseStatus.SUBMITTED: return <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold">SUBMITTED</span>;
        case ExpenseStatus.DRAFT: return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">DRAFT</span>;
        default: return null;
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-light text-gray-800">My Expense Reports</h1>
            <div className="flex gap-3">
                 <Button variant="outline">Create Authorization</Button>
                 <Button onClick={() => navigate('/expenses/create')}>
                    <Plus size={18} /> Create Expense Report
                 </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="min-h-[400px]">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h2 className="font-medium text-gray-700 flex items-center gap-2">
                            <FileText size={18} /> Recent Reports
                        </h2>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Date</th>
                                    <th className="px-6 py-3 font-medium">Report #</th>
                                    <th className="px-6 py-3 font-medium">Memo</th>
                                    <th className="px-6 py-3 font-medium text-right">Total</th>
                                    <th className="px-6 py-3 font-medium text-center">Status</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {mockReports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 group">
                                        <td className="px-6 py-4 text-gray-600">{report.date}</td>
                                        <td className="px-6 py-4 font-medium text-gray-800">{report.reportNumber}</td>
                                        <td className="px-6 py-4 text-gray-600">{report.memo}</td>
                                        <td className="px-6 py-4 text-right font-medium text-gray-800">${report.total.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">{getStatusBadge(report.status)}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1 hover:bg-gray-200 rounded-full text-gray-400 hover:text-blue-600 transition-colors">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="p-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BarChart3 size={16} /> Spend by Category (YTD)
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#005cb9' : '#66a3ff'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-4 bg-orange-50 border-l-4 border-orange-400 flex gap-3">
                    <AlertCircle className="text-orange-500 shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-orange-800 text-sm">Action Required</h4>
                        <p className="text-sm text-orange-700 mt-1">
                            You have 2 transactions from your corporate card that need to be expensed.
                        </p>
                        <button className="text-xs font-bold text-orange-800 mt-2 underline hover:text-orange-950">
                            Import Transactions
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    </div>
  );
};
