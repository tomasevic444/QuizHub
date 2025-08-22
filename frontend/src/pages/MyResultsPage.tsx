// src/pages/MyResultsPage.tsx

import { useQuery } from '@tanstack/react-query';
import { getMyResults } from '@/api/userService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const MyResultsPage = () => {
    const { data: results, isLoading, isError } = useQuery({
        queryKey: ['myResults'],
        queryFn: getMyResults,
    });

    const SkeletonRow = () => (
        <TableRow>
            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
            <TableCell><Skeleton className="h-5 w-full" /></TableCell>
            <TableCell><Skeleton className="h-5 w-1/2 ml-auto" /></TableCell>
            <TableCell><Skeleton className="h-5 w-1/4 ml-auto" /></TableCell>
            <TableCell><Skeleton className="h-9 w-[130px] ml-auto" /></TableCell>
        </TableRow>
    );

    return (
        <div className="container mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-6">My Results</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Quiz History</CardTitle>
                    <CardDescription>A record of all the quizzes you have completed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Quiz</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                                <TableHead className="text-right">Percentage</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-destructive">
                                        Failed to load your results.
                                    </TableCell>
                                </TableRow>
                            ) : results && results.length > 0 ? (
                                results.map((result) => (
                                    <TableRow key={result.attemptId}>
                                        <TableCell className="font-medium">{result.quizTitle}</TableCell>
                                        <TableCell>{new Date(result.attemptedAt).toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{result.score} / {result.totalPossibleScore}</TableCell>
                                        <TableCell className="text-right font-semibold">{Math.round(result.percentage)}%</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link to={`/my-results/${result.attemptId}`}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        You haven't completed any quizzes yet.
                                    </TableCell>
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