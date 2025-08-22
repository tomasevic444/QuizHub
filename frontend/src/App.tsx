// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Import all page components
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import QuizDetailPage from './pages/QuizDetailPage';
import QuizSessionPage from './pages/QuizSessionPage';
import QuizResultsPage from './pages/QuizResultsPage';
import MyResultsPage from './pages/MyResultsPage';
import MyResultDetailPage from './pages/MyResultDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminQuizListPage from './pages/admin/AdminQuizListPage';
import AdminQuestionListPage from './pages/admin/AdminQuestionListPage';
import AdminCategoryListPage from './pages/admin/AdminCategoryListPage';
import AdminResultsPage from './pages/admin/AdminResultsPage';

// Import Route protectors
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/quiz/:id" element={<QuizDetailPage />} />
        <Route path="/quiz/:id/session" element={<QuizSessionPage />} />
        <Route path="/quiz/results/:attemptId" element={<QuizResultsPage />} />
        
        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-results" element={<MyResultsPage />} />
          <Route path="/my-results/:attemptId" element={<MyResultDetailPage />} />
        </Route>
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="results" element={<AdminResultsPage />} />
          <Route path="categories" element={<AdminCategoryListPage />} />
          <Route path="quizzes" element={<AdminQuizListPage />} />
          <Route path="quizzes/:quizId/questions" element={<AdminQuestionListPage />} />
        </Route>
        
        {/* Catch-all 404 Route */}
        <Route path="*" element={<h2>404: Page Not Found</h2>} />
      </Routes>
    </Layout>
  );
}

export default App;