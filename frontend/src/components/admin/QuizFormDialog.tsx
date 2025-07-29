// src/components/admin/QuizFormDialog.tsx

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

import { getCategories } from '@/api/quizService';
import { createQuiz, updateQuiz } from '@/api/adminService';
import type { AdminQuizUpsert } from '@/api/adminService';
import type { Quiz, Category } from '@/interfaces/quiz.interfaces';


const formSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    timeLimitInSeconds: z.coerce.number().min(30, { message: "Time limit must be at least 30 seconds." }),
    categoryId: z.coerce.number().min(1, { message: "You must select a category." }),
});

type QuizFormData = z.input<typeof formSchema>;

interface QuizFormDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    quiz?: Quiz | null;
}

export const QuizFormDialog: React.FC<QuizFormDialogProps> = ({ isOpen, setIsOpen, quiz }) => {
    const queryClient = useQueryClient();
    const isEditMode = !!quiz;

    const { data: categories } = useQuery<Category[]>({
        queryKey: ['categories'],
        queryFn: getCategories,
    });

    const { control, handleSubmit, reset, formState: { errors } } = useForm<QuizFormData>({
        resolver: zodResolver(formSchema),
                defaultValues: {
            title: "",
            description: "",
            difficulty: "Easy",
            timeLimitInSeconds: 300,
            categoryId: undefined
        }
    });

        React.useEffect(() => {
        // We only want to take action when the dialog is opened.
        if (isOpen) {
            if (quiz) {
                // EDIT MODE: If a quiz object is passed, populate the form with its data.
                reset({
                    title: quiz.title,
                    description: quiz.description,
                    difficulty: quiz.difficulty,
                    timeLimitInSeconds: quiz.timeLimitInSeconds,
                    categoryId: quiz.categoryId,
                });
            } else {
                // CREATE MODE: If no quiz object is passed, reset to the default values.
                // This is the crucial part that was not firing correctly before.
                reset(); // This resets the form to the 'defaultValues' defined in useForm.
            }
        }
    }, [isOpen, quiz, reset]);

    const mutation = useMutation<unknown, Error, AdminQuizUpsert>({
        mutationFn: (data) => isEditMode ? updateQuiz(quiz!.id, data) : createQuiz(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminQuizzes'] });
            setIsOpen(false);
        },
        onError: (error) => {
            alert(`Failed to save quiz: ${error.message}`);
        }
    });

    const onSubmit: SubmitHandler<QuizFormData> = (data) => {
        mutation.mutate(data as AdminQuizUpsert);
    };

    

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    {/* Title */}
                    <div className='space-y-2'>
                        <Label htmlFor="title">Title</Label>
                        <Controller name="title" control={control} render={({ field }) => <Input id="title" {...field} />} />
                        {errors.title && <p className="text-sm font-medium text-destructive">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className='space-y-2'>
                        <Label htmlFor="description">Description</Label>
                        <Controller name="description" control={control} render={({ field }) => <Textarea id="description" {...field} />} />
                        {errors.description && <p className="text-sm font-medium text-destructive">{errors.description.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Difficulty */}
                        <div className='space-y-2'>
                            <Label>Difficulty</Label>
                            <Controller
                                name="difficulty"
                                control={control}
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.difficulty && <p className="text-sm font-medium text-destructive">{errors.difficulty.message}</p>}
                        </div>

                        {/* Category */}
                        <div className='space-y-2'>
                            <Label>Category</Label>
                            <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value ? String(field.value) : ''}>
                            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                            <SelectContent>
                                {categories?.map(cat => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                            {errors.categoryId && <p className="text-sm font-medium text-destructive">{errors.categoryId.message}</p>}
                        </div>
                    </div>

                    {/* Time Limit Controller */}
            <div className='space-y-2'>
                <Label htmlFor="timeLimitInSeconds">Time Limit (seconds)</Label>
                <Controller
                    name="timeLimitInSeconds"
                    control={control}
                    render={({ field }) => (
                        <Input id="timeLimitInSeconds"
                                    type="number"
                                    {...field}  value={field.value as number | string | undefined}/>
                    )}
                />
                {errors.timeLimitInSeconds && <p className="text-sm font-medium text-destructive">{errors.timeLimitInSeconds.message}</p>}
            </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save Quiz'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};