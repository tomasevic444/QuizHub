// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getQuizzes } from './api/quizService';
import { QuizCard } from './components/quiz/QuizCard';
import { Skeleton } from './components/ui/skeleton';
import { QuizFilterBar } from './components/quiz/QuizFilterBar';
import type { QuizFilters } from './api/quizService';
import QuizDetailPage from './pages/QuizDetailPage';
import QuizSessionPage from './pages/QuizSessionPage';
import QuizResultsPage from './pages/QuizResultsPage';
import MyResultsPage from './pages/MyResultsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import LeaderboardPage from './pages/LeaderboardPage';
import { AdminRoute } from './components/AdminRoute';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminQuizListPage from './pages/admin/AdminQuizListPage';
import AdminQuestionListPage from './pages/admin/AdminQuestionListPage';

function HomePage() {
  // 1. Create a state to hold the current filters
  const [filters, setFilters] = useState<QuizFilters>({});

  // 2. Pass the filters to useQuery. 
  // The queryKey must include the filters so react-query refetches when they change.
  const { data: quizzes, isLoading, isError } = useQuery({
    queryKey: ['quizzes', filters],
    queryFn: () => getQuizzes(filters),
  });


  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[125px] w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) {
    return <SkeletonGrid />;
  }

  if (isError) {
    return <div className="text-red-500">Failed to load quizzes. Please try again later.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Available Quizzes</h2>
      </div>

      {/* 3. Render the filter bar and pass down the state and handler */}
      <QuizFilterBar filters={filters} onFilterChange={setFilters} />

      {isLoading && <SkeletonGrid />}
      {isError && <div className="text-destructive">Failed to load quizzes. Please try again.</div>}

      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes && quizzes.length > 0 ? (
            quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No quizzes found matching your criteria.</p>
          )}
        </div>
      )}
    </div>
  );
}


function App() {
  return (
    <Layout>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/my-results" element={<MyResultsPage />} />
        </Route>
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="quizzes" element={<AdminQuizListPage />} />
          <Route path="quizzes/:quizId/questions" element={<AdminQuestionListPage />} />
        </Route>
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:id" element={<QuizDetailPage />} />
        <Route path="/quiz/:id/session" element={<QuizSessionPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<h2>404: Page Not Found</h2>} />
        <Route path="/quiz/results/:attemptId" element={<QuizResultsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;