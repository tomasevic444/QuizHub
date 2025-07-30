// src/components/admin/QuestionFormDialog.tsx

import React from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, PlusCircle } from 'lucide-react';
import type { Question } from '@/interfaces/question.interfaces';
import type { AdminQuestionUpsert } from '@/api/adminService';

const optionSchema = z.object({
    text: z.string().min(1, { message: "Option text cannot be empty." }),
    isCorrect: z.boolean(),
});

const formSchema = z.object({
    text: z.string().min(5, { message: "Question text must be at least 5 characters." }),
    type: z.enum(['SingleChoice', 'MultipleChoice', 'TrueFalse', 'FillInTheBlank']),
    points: z.coerce.number().min(1, { message: "Points must be at least 1." }),
    options: z.array(optionSchema).min(1, { message: "You must provide at least one option." }),
}).superRefine((data, ctx) => {
    const correctOptionsCount = data.options.filter(opt => opt.isCorrect).length;
    
    if ((data.type === 'SingleChoice' || data.type === 'TrueFalse') && correctOptionsCount !== 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "This type requires exactly one correct answer." });
    }
    if (data.type === 'MultipleChoice' && correctOptionsCount < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "This type requires at least one correct answer." });
    }
    // For FillInTheBlank, at least one correct option is required.
    if (data.type === 'FillInTheBlank' && correctOptionsCount < 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["options"], message: "You must provide at least one correct answer text." });
    }
});

type QuestionFormData = z.infer<typeof formSchema>;

interface QuestionFormDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    question?: Question | null;
    onSubmit: (data: AdminQuestionUpsert) => void;
    isSubmitting: boolean;
}

export const QuestionFormDialog: React.FC<QuestionFormDialogProps> = ({ isOpen, setIsOpen, question, onSubmit, isSubmitting }) => {
    const isEditMode = !!question;

    const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
  resolver: zodResolver(formSchema),
});

    const { fields, append, remove } = useFieldArray({
        control,
        name: "options",
    });

    const questionType = watch('type');

    React.useEffect(() => {
        if (isOpen) {
            if (question) {
                reset(question);
            } else {
                reset({
                    text: "",
                    type: 'SingleChoice',
                    points: 5,
                    options: [{ text: "", isCorrect: true }], 
                });
            }
        }
    }, [isOpen, question, reset]);

    React.useEffect(() => {
        if (questionType === 'TrueFalse') {
            setValue('options', [
                { text: 'True', isCorrect: false },
                { text: 'False', isCorrect: false },
            ]);
        }
    }, [questionType, setValue]);

    const handleFormSubmit = (data: QuestionFormData) => {
  onSubmit(data);
};

    const handleSingleCorrectChange = (selectedIndex: number) => {
        const currentOptions = watch('options');
        const newOptions = currentOptions.map((option, index) => ({
            ...option,
            isCorrect: index === selectedIndex,
        }));
        setValue('options', newOptions, { shouldValidate: true });
    };

   
    const renderSelectionControl = (index: number) => {
        if (questionType === 'SingleChoice' || questionType === 'TrueFalse') {
            return (
                <Controller
                    name={`options.${index}.isCorrect`}
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={() => handleSingleCorrectChange(index)}
                            value={field.value ? String(index) : ""}
                        >
                            <RadioGroupItem value={String(index)} />
                        </RadioGroup>
                    )}
                />
            );
        }
        if (questionType === 'MultipleChoice' || questionType === 'FillInTheBlank') {
            return (
                <Controller
                    name={`options.${index}.isCorrect`}
                    control={control}
                    render={({ field }) => (
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    )}
                />
            );
        }
        return null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Question' : 'Create New Question'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-4 max-h-[80vh] overflow-y-auto pr-6">
                    {/* Main Question Details */}
                    <div className='space-y-2'>
                        <Label>Question Text</Label>
                        <Controller name="text" control={control} render={({ field }) => <Textarea {...field} />} />
                        {errors.text && <p className="text-sm text-destructive">{errors.text.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className='space-y-2'>
                            <Label>Question Type</Label>
                            <Controller name="type" control={control} render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SingleChoice">Single Choice</SelectItem>
                                        <SelectItem value="MultipleChoice">Multiple Choice</SelectItem>
                                        <SelectItem value="TrueFalse">True/False</SelectItem>
                                        <SelectItem value="FillInTheBlank">Fill In The Blank</SelectItem>
                                    </SelectContent>
                                </Select>
                            )} />
                        </div>
                        <div className='space-y-2'>
                            <Label>Points</Label>
                            <Controller
  name="points"
  control={control}
  render={({ field }) => (
    <Input type="number" {...field} value={field.value as number ?? 0} />
  )}
/>
                             {errors.points && <p className="text-sm text-destructive">{errors.points.message}</p>}
                        </div>
                    </div>

                    {/* Dynamic Options Section */}
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">
                            {questionType === 'FillInTheBlank' ? 'Correct Answer Texts' : 'Options'}
                        </Label>
                        {errors.options && <p className="text-sm text-destructive">{errors.options.message || errors.options.root?.message}</p>}
                        
                        <div className="space-y-2 mt-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                                    <Controller name={`options.${index}.text`} control={control} render={({ field }) => (
                                        <Input placeholder={questionType === 'FillInTheBlank' ? 'Enter a correct answer' : `Option ${index + 1}`} {...field} disabled={questionType === 'TrueFalse'} />
                                    )} />
                                    <div className="flex items-center space-x-2">
                                        {renderSelectionControl(index)}
                                        <Label className="text-xs text-muted-foreground">Correct</Label>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={questionType === 'TrueFalse' || fields.length <= 1}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- THIS IS THE FIX --- */}
                    {/* Conditionally render the "Add Option" button */}
                    {(questionType === 'SingleChoice' || questionType === 'MultipleChoice' || questionType === 'FillInTheBlank') && (
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ text: '', isCorrect: false })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> 
                            {questionType === 'FillInTheBlank' ? 'Add another correct text' : 'Add Option'}
                        </Button>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Question'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};