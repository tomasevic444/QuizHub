// src/App.tsx
import { Routes, Route} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout'; 
import { useQuery } from '@tanstack/react-query';
import { getQuizzes } from './api/quizService';
import { QuizCard } from './components/quiz/QuizCard';
import { Skeleton } from './components/ui/skeleton';


function HomePage() {
  const { data: quizzes, isLoading, isError } = useQuery({
    queryKey: ['quizzes'],
    queryFn: getQuizzes,
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
      <h2 className="text-3xl font-bold tracking-tight">Available Quizzes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes?.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </div>
  );
}


function App() {

  return (

    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<h2>404: Page Not Found</h2>} />
      </Routes>
    </Layout>
  );
}

export default App;