// src/pages/admin/AdminQuestionListPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { getQuestionsForQuiz, createQuestion, updateQuestion, deleteQuestion } from '@/api/adminService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import type { Question } from '@/interfaces/question.interfaces';
import { QuestionFormDialog } from '@/components/admin/QuestionFormDialog';
import type { AdminQuestionUpsert } from '@/api/adminService';

const AdminQuestionListPage = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const id = Number(quizId);
    const queryClient = useQueryClient();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [formKey, setFormKey] = useState(0);

    const { data: questions, isLoading } = useQuery({
        queryKey: ['adminQuestions', id],
        queryFn: () => getQuestionsForQuiz(id),
        enabled: !isNaN(id),
    });
    
    const mutation = useMutation<
    unknown, 
    Error,   
    { question: AdminQuestionUpsert; questionId?: number } 
>({
    mutationFn: (data) => 
        data.questionId 
            ? updateQuestion(data.questionId, data.question) 
            : createQuestion(id, data.question),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminQuestions', id] });
        setIsFormOpen(false);
    },
});
    
    const deleteMutation = useMutation({
        mutationFn: deleteQuestion,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminQuestions', id] });
        },
    });

    const handleAddNew = () => {
        setEditingQuestion(null);
        setFormKey(prev => prev + 1);
        setIsFormOpen(true);
    };
    
    const handleEdit = (question: Question) => {
        setEditingQuestion(question);
        setFormKey(prev => prev + 1);
        setIsFormOpen(true);
    };
    
    const handleFormSubmit = (data: AdminQuestionUpsert) => {
        mutation.mutate({ question: data, questionId: editingQuestion?.id });
    };


    return (
        <div className="space-y-6">
            <Link to="/admin/quizzes" className="flex items-center text-sm text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quizzes
            </Link>

            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Manage Questions</h2>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Question
                </Button>
            </div>
            
            <QuestionFormDialog 
                key={formKey}
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                question={editingQuestion}
                onSubmit={handleFormSubmit}
                isSubmitting={mutation.isPending}
            />

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
                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(q)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(q.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            ))
                        ) : (
                            <TableRow><TableCell colSpan={5}>No questions found.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminQuestionListPage;