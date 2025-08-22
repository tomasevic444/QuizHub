// src/pages/MyResultDetailPage.tsx

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyResultDetails } from '@/api/userService';
import { QuizResultDisplay } from '@/components/quiz/QuizResultDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const MyResultDetailPage = () => {
    const { attemptId } = useParams<{ attemptId: string }>();
    const id = Number(attemptId);

    const { data: result, isLoading, isError } = useQuery({
        queryKey: ['myResultDetails', id],
        queryFn: () => getMyResultDetails(id),
        enabled: !isNaN(id),
    });

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <Card>
                    <CardHeader className="text-center">
                        <Skeleton className="h-8 w-1/2 mx-auto" />
                        <Skeleton className="h-4 w-1/3 mx-auto mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center">
                            <Skeleton className="h-6 w-1/4 mx-auto" />
                            <Skeleton className="h-20 w-1/3 mx-auto mt-2" />
                            <Skeleton className="h-4 w-1/2 mx-auto mt-2" />
                        </div>
                        <div className="flex justify-center">
                            <Skeleton className="h-10 w-32" />
                        </div>
                    </CardContent>
                </Card>
                <div className="border p-4 rounded-lg">
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !result) {
        return (
            <div className="text-center text-destructive">
                <h2>Error</h2>
                <p>Failed to load the details for this quiz attempt.</p>
                <p>It may not exist or you may not have permission to view it.</p>
            </div>
        );
    }

    return <QuizResultDisplay result={result} />;
};

export default MyResultDetailPage;