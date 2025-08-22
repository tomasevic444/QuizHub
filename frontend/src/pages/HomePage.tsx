// src/pages/HomePage.tsx

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getQuizzes } from '@/api/quizService';
import { QuizCard } from '@/components/quiz/QuizCard';
import { Skeleton } from '@/components/ui/skeleton';
import { QuizFilterBar } from '@/components/quiz/QuizFilterBar';
import type { QuizFilters } from '@/api/quizService';

const HomePage = () => {
  const [filters, setFilters] = useState<QuizFilters>({});

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

  return (
    <div className="container mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Available Quizzes</h2>
        </div>
        <QuizFilterBar filters={filters} onFilterChange={setFilters} />
        {isLoading ? (
          <SkeletonGrid />
        ) : isError ? (
          <div className="text-destructive">Failed to load quizzes. Please try again.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes && quizzes.length > 0 ? (
              quizzes.map((quiz) => <QuizCard key={quiz.id} quiz={quiz} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground">No quizzes found matching your criteria.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;