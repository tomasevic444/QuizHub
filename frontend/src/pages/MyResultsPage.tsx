// src/pages/MyResultsPage.tsx
import { useQuery } from '@tanstack/react-query';
import { getMyResults } from '@/api/userService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const MyResultsPage = () => {
    const { data: results, isLoading, isError } = useQuery({
        queryKey: ['myResults'],
        queryFn: getMyResults,
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (isError) {
        return <div className="text-destructive">Failed to load your results.</div>;
    }

    return (
        <div className="container mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-6">My Results</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Quiz History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quiz</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                                <TableHead className="text-right">Percentage</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results && results.length > 0 ? (
                                results.map((result) => (
                                    <TableRow key={result.attemptId}>
                                        <TableCell className="font-medium">{result.quizTitle}</TableCell>
                                        <TableCell>{new Date(result.attemptedAt).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{result.score} / {result.totalPossibleScore}</TableCell>
                                        <TableCell className="text-right font-semibold">{Math.round(result.percentage)}%</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">You haven't completed any quizzes yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default MyResultsPage;