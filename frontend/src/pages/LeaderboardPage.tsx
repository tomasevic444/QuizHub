// src/pages/LeaderboardPage.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getQuizzes, getLeaderboard } from '@/api/quizService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// Helper to format time
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

const LeaderboardPage = () => {
    // State to hold the ID of the selected quiz
    const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);

    // Query 1: Fetch all quizzes to populate the dropdown
    const { data: quizzes, isLoading: isLoadingQuizzes } = useQuery({
        queryKey: ['quizzes', {}], // Use empty filter object to get all
        queryFn: () => getQuizzes({}),
    });

    // Query 2: Fetch the leaderboard for the selected quiz
    // This query will only run if selectedQuizId is not null
    const { data: leaderboard, isLoading: isLoadingLeaderboard } = useQuery({
        queryKey: ['leaderboard', selectedQuizId],
        queryFn: () => getLeaderboard(selectedQuizId!),
        enabled: selectedQuizId !== null, // Crucial part!
    });

    return (
        <div className="container mx-auto space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Global Leaderboard</h2>

            <div className="max-w-md">
                <Select onValueChange={(value) => setSelectedQuizId(Number(value))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a quiz to view its leaderboard" />
                    </SelectTrigger>
                    <SelectContent>
                        {isLoadingQuizzes ? (
                            <SelectItem value="loading" disabled>Loading quizzes...</SelectItem>
                        ) : (
                            quizzes?.map((quiz) => (
                                <SelectItem key={quiz.id} value={quiz.id.toString()}>
                                    {quiz.title}
                                </SelectItem>
                            ))
                        )}
                    </SelectContent>
                </Select>
            </div>
            
            {selectedQuizId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Players</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingLeaderboard ? (
                            <div className="space-y-2">
                                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Rank</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Time</TableHead>
                                        <TableHead className="text-right">Score</TableHead>
                                        <TableHead className="text-right">Percentage</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {leaderboard && leaderboard.length > 0 ? (
                                        leaderboard.map((entry) => (
                                            <TableRow key={entry.rank}>
                                                <TableCell className="font-bold text-lg">{entry.rank}</TableCell>
                                                <TableCell>{entry.username}</TableCell>
                                                <TableCell>{formatTime(entry.timeTakenInSeconds)}</TableCell>
                                                <TableCell className="text-right font-semibold">{entry.score}</TableCell>
                                                <TableCell className="text-right font-semibold">{Math.round(entry.percentage)}%</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No results yet for this quiz. Be the first!</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default LeaderboardPage;