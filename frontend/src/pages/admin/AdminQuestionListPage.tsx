// src/pages/admin/AdminQuestionListPage.tsx

import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getQuestionsForQuiz } from '@/api/adminService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, ArrowLeft } from 'lucide-react';

const AdminQuestionListPage = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const id = Number(quizId);

    const { data: questions, isLoading } = useQuery({
        queryKey: ['adminQuestions', id],
        queryFn: () => getQuestionsForQuiz(id),
        enabled: !isNaN(id),
    });

    return (
        <div className="space-y-6">
            <Link to="/admin/quizzes" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
            </Link>

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Manage Questions</h2>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Question
                </Button>
            </div>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Question Text</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead># Options</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5}>Loading questions...</TableCell></TableRow>
                        ) : questions && questions.length > 0 ? (
                            questions.map((q) => (
                                <TableRow key={q.id}>
                                    <TableCell className="font-medium max-w-sm truncate">{q.text}</TableCell>
                                    <TableCell>{q.type}</TableCell>
                                    <TableCell>{q.options.length}</TableCell>
                                    <TableCell>{q.points}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5} className="text-center">No questions found for this quiz. Add one!</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminQuestionListPage;