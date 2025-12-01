import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ExpenseHub } from './components/ExpenseHub';
import { CreateReportWizard } from './components/CreateReportWizard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpenseHub />} />
          <Route path="/expenses/create" element={<CreateReportWizard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
