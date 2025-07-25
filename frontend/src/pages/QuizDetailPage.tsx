// src/pages/QuizDetailPage.tsx
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getQuizForTaker } from '@/api/quizService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, HelpCircle, Star } from 'lucide-react';

const QuizDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const quizId = parseInt(id!, 10);

    // Fetch the quiz details
    // We only need basic details here, not the full taker view yet.
    // For now, we'll use the taker view, but this could be optimized later.
    const { data: quiz, isLoading, isError } = useQuery({
        queryKey: ['quiz', quizId],
        queryFn: () => getQuizForTaker(quizId),
        enabled: !isNaN(quizId), // only run query if id is a valid number
    });

    if (isLoading) {
        return <Skeleton className="w-full h-64" />;
    }

    if (isError || !quiz) {
        return <div>Error loading quiz, or quiz not found.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl">{quiz.title}</CardTitle>
                    <CardDescription>Get ready to test your knowledge!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                            <HelpCircle className="mx-auto h-8 w-8 mb-2 text-primary" />
                            <p className="font-bold">{quiz.questions.length} Questions</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <Clock className="mx-auto h-8 w-8 mb-2 text-primary" />
                            <p className="font-bold">{Math.floor(quiz.timeLimitInSeconds / 60)} Minutes</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <Star className="mx-auto h-8 w-8 mb-2 text-primary" />
                            <p className="font-bold">{quiz.questions.reduce((acc, q) => acc + q.points, 0)} Total Points</p>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button size="lg" asChild>
                            <Link to={`/quiz/${quiz.id}/session`}>Begin Quiz</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuizDetailPage;