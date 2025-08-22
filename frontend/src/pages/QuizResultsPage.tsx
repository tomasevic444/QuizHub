// src/pages/QuizResultsPage.tsx
import { useLocation, Navigate } from 'react-router-dom';
import { QuizResultDisplay } from '@/components/quiz/QuizResultDisplay';

const QuizResultsPage = () => {
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return <Navigate to="/" replace />;
  }
  
  return <QuizResultDisplay result={result} />;
};

export default QuizResultsPage;