
import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole } from './types';
import Layout from './components/Layout';
import Login from './views/Login';
import StudentDashboard from './views/StudentDashboard';
import ExaminerDashboard from './views/ExaminerDashboard';
import AdminDashboard from './views/AdminDashboard';

const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Layout><Login /></Layout>;
  }

  const renderDashboard = () => {
    switch (currentUser.role) {
      case UserRole.STUDENT:
        return <StudentDashboard />;
      case UserRole.EXAMINER:
        return <ExaminerDashboard />;
      case UserRole.ADMIN:
        return <AdminDashboard />;
      default:
        return <Login />;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
