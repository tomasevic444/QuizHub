import { useState, useEffect } from 'react';
import type { LiveQuestion } from '@/interfaces/livequiz.interfaces';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input'; 

interface LiveAnswerPayload {
    optionIds?: number[];
    textAnswer?: string;
}

interface LiveQuizViewProps {
    question: LiveQuestion;
    onAnswerSubmit: (answer: LiveAnswerPayload) => void;
}

export const LiveQuizView: React.FC<LiveQuizViewProps> = ({ question, onAnswerSubmit }) => {
    const [timeLeft, setTimeLeft] = useState(question.timeLimit);
    const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
    const [textAnswer, setTextAnswer] = useState(''); 
    const [isAnswered, setIsAnswered] = useState(false);


    useEffect(() => {
        setTimeLeft(question.timeLimit);
        setSelectedAnswers([]);
        setTextAnswer(''); 
        setIsAnswered(false);

        const timer = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    clearInterval(timer);
                    onAnswerSubmit({}); 
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [question]);

    const handleAnswerClick = (optionId: number) => {
        if (question.type === 'SingleChoice' || question.type === 'TrueFalse') {
            setSelectedAnswers([optionId]);
        } else {
            setSelectedAnswers(prev => 
                prev.includes(optionId) 
                    ? prev.filter(id => id !== optionId) 
                    : [...prev, optionId]
            );
        }
    };
    
    const handleSubmit = () => {
        if (isAnswered) return;
        setIsAnswered(true);

        let payload: LiveAnswerPayload = {};
        if (question.type === 'FillInTheBlank') {
            payload = { textAnswer: textAnswer.trim() };
        } else {
            payload = { optionIds: selectedAnswers };
        }
        onAnswerSubmit(payload);
    };

    const renderAnswerField = () => {
        if (question.type === 'FillInTheBlank') {
            return (
                <Input
                    placeholder="Type your answer here..."
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    disabled={isAnswered}
                    className="text-lg"
                />
            );
        }

        //  SingleChoice, MultipleChoice, TrueFalse
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map(opt => (
                    <Button
                        key={opt.id}
                        variant={selectedAnswers.includes(opt.id) ? 'default' : 'outline'}
                        onClick={() => handleAnswerClick(opt.id)}
                        disabled={isAnswered}
                        className="h-auto py-4 text-wrap"
                    >
                        {opt.text}
                    </Button>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-4xl mx-auto space-y-4">
            <Progress value={(timeLeft / question.timeLimit) * 100} className="w-full h-3" />
            <p className="text-center font-bold text-2xl">{timeLeft}</p>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{question.text}</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderAnswerField()}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={isAnswered || (selectedAnswers.length === 0 && textAnswer.trim() === '')}>
                    {isAnswered ? 'Waiting for next question...' : 'Submit Answer'}
                </Button>
            </div>
        </div>
    );
};