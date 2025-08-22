// src/components/quiz/QuizResultDisplay.tsx
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { QuizResult } from '@/interfaces/quiz.interfaces';
import { CheckCircle, XCircle } from 'lucide-react';

interface QuizResultDisplayProps {
  result: QuizResult;
}

export const QuizResultDisplay: React.FC<QuizResultDisplayProps> = ({ result }) => {
  const percentage = Math.round((result.correctCount / result.totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-3xl">Quiz Results</CardTitle>
                <CardDescription>Here's how you did!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-center">
                    <p className="text-lg font-medium">Your Score</p>
                    <p className="text-6xl font-bold text-primary">{percentage}%</p>
                    <p className="text-muted-foreground">
                        You answered {result.correctCount} out of {result.totalQuestions} questions correctly.
                    </p>
                </div>
                <div className="flex justify-center">
                    <Button asChild>
                        <Link to="/">Back to Quizzes</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>

        <div className="border p-4 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Detailed Breakdown</h3>
            <Accordion type="single" collapsible className="w-full">
                {result.results.map((res, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className={`flex justify-between items-center text-left ${res.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            <div className="flex items-center gap-2">
                                {res.isCorrect ? <CheckCircle className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
                                <span>{res.questionText}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2 pl-8">
                            <div>
                                <p className="font-semibold">Your Answer(s):</p>
                                <ul className="list-disc pl-5 text-muted-foreground">
                                    {res.userAnswers.length > 0 ? res.userAnswers.map((ua, i) => <li key={i}>{ua}</li>) : <li>No answer provided</li>}
                                </ul>
                            </div>
                            {!res.isCorrect && (
                                <div>
                                    <p className="font-semibold">Correct Answer(s):</p>
                                    <ul className="list-disc pl-5 text-green-600">
                                       {res.correctAnswers.map((ca, i) => <li key={i}>{ca}</li>)}
                                    </ul>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    </div>
  );
};