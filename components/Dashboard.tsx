import React from 'react';
import { Card } from './UI';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  Briefcase, 
  Heart, 
  DollarSign, 
  Users, 
  ShoppingCart, 
  Calendar,
  Inbox
} from 'lucide-react';
import { DashboardTile } from '../types';

const apps: DashboardTile[] = [
  { id: 'expenses', label: 'Expenses', icon: <CreditCard className="text-white" size={32} />, path: '/expenses' },
  { id: 'favorites', label: 'Favorites', icon: <Heart className="text-white" size={32} />, path: '#' },
  { id: 'career', label: 'Career', icon: <Briefcase className="text-white" size={32} />, path: '#' },
  { id: 'payroll', label: 'Payroll', icon: <DollarSign className="text-white" size={32} />, path: '#' },
  { id: 'absence', label: 'Absence', icon: <Calendar className="text-white" size={32} />, path: '#' },
  { id: 'purchases', label: 'Purchases', icon: <ShoppingCart className="text-white" size={32} />, path: '#' },
  { id: 'benefits', label: 'Benefits', icon: <Users className="text-white" size={32} />, path: '#' },
];

export const Dashboard = () => {
  const getIconBg = (id: string) => {
    switch(id) {
      case 'expenses': return 'bg-blue-600';
      case 'favorites': return 'bg-pink-500';
      case 'payroll': return 'bg-green-600';
      case 'career': return 'bg-purple-600';
      default: return 'bg-indigo-500';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-gray-800">Good Morning, Alex</h1>
          <p className="text-gray-500 mt-1">Ready to manage your day?</p>
        </div>
        <div className="hidden md:block">
            <span className="text-sm text-gray-400">Tuesday, October 24, 2023</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Inbox Widget */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-medium text-gray-700 mb-4 flex items-center gap-2">
                <Inbox size={20} /> Inbox
            </h2>
            <Card className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 flex items-start gap-4 cursor-pointer transition-colors group">
                        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">Expense Report Approval: ER-{1020 + i}</h3>
                            <p className="text-sm text-gray-500 mt-1">Submitted by John Doe • {i} hour{i>1?'s':''} ago</p>
                        </div>
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">Action Required</span>
                    </div>
                ))}
                <div className="p-3 text-center bg-gray-50">
                    <button className="text-sm font-medium text-blue-600 hover:underline">View All Tasks</button>
                </div>
            </Card>
        </div>

        {/* Announcements / Quick Actions (Placeholder) */}
        <div className="hidden lg:block">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Announcements</h2>
            <Card className="p-6 bg-gradient-to-br from-[#005cb9] to-[#004a96] text-white">
                <h3 className="font-bold text-lg mb-2">New Expense Policy</h3>
                <p className="text-sm opacity-90 mb-4">
                    Effective Nov 1st, all meals over $75 require itemized receipts. Please update your compliance knowledge.
                </p>
                <button className="bg-white text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-opacity-90 transition-all">
                    Read Policy
                </button>
            </Card>
        </div>
      </div>

      {/* Apps Grid */}
      <div>
        <h2 className="text-xl font-medium text-gray-700 mb-4">Your Apps</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {apps.map((app) => (
                <Link to={app.path} key={app.id}>
                    <Card className="h-32 flex flex-col items-center justify-center gap-3 hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-md">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconBg(app.id)} shadow-inner`}>
                            {app.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{app.label}</span>
                    </Card>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
