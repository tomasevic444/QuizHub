// src/pages/admin/AdminResultsPage.tsx

import { useQuery } from '@tanstack/react-query';
import { getAllResults } from '@/api/adminService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const AdminResultsPage = () => {
    const { data: results, isLoading, isError } = useQuery({
        queryKey: ['allAdminResults'],
        queryFn: getAllResults,
    });

    return (
        <div className="container mx-auto space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">All User Results</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Quiz Attempt History</CardTitle>
                    <CardDescription>A log of all quizzes taken by users on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Quiz</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                // Show skeleton loaders while data is being fetched
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-1/2" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-1/4 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : isError ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-destructive">Failed to load results.</TableCell>
                                </TableRow>
                            ) : results && results.length > 0 ? (
                                results.map((result) => (
                                    <TableRow key={result.attemptId}>
                                        <TableCell className="font-medium">{result.quizTitle}</TableCell>
                                        <TableCell>{result.username}</TableCell>
                                        <TableCell>{new Date(result.attemptedAt).toLocaleString()}</TableCell>
                                        <TableCell className="text-right font-semibold">{result.score}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">No quiz attempts have been made yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminResultsPage;