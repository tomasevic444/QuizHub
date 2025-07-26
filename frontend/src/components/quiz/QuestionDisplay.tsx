// src/components/quiz/QuestionDisplay.tsx
import type { QuizTakerQuestion } from '@/interfaces/quiz.interfaces';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface QuestionDisplayProps {
  question: QuizTakerQuestion;
  userAnswer: any;
  onAnswerChange: (questionId: number, answer: any) => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, userAnswer, onAnswerChange }) => {
  
  const renderQuestionType = () => {
    switch (question.type) {
      case 'SingleChoice':
      case 'TrueFalse':
        return (
          <RadioGroup
            onValueChange={(value) => onAnswerChange(question.id, parseInt(value))}
            value={userAnswer?.toString()}
          >
            {question.options.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id.toString()} id={`q${question.id}-o${option.id}`} />
                <Label htmlFor={`q${question.id}-o${option.id}`}>{option.text}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'MultipleChoice':
        const handleMultiChoiceChange = (optionId: number, checked: boolean) => {
          const currentAnswers: Set<number> = userAnswer ? new Set(userAnswer) : new Set();
          if (checked) {
            currentAnswers.add(optionId);
          } else {
            currentAnswers.delete(optionId);
          }
          onAnswerChange(question.id, Array.from(currentAnswers));
        };
        return (
          <div className="space-y-2">
            {question.options.map(option => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`q${question.id}-o${option.id}`}
                  checked={userAnswer?.includes(option.id)}
                  onCheckedChange={(checked) => handleMultiChoiceChange(option.id, !!checked)}
                />
                <Label htmlFor={`q${question.id}-o${option.id}`}>{option.text}</Label>
              </div>
            ))}
          </div>
        );
        
      case 'FillInTheBlank':
        return (
          <Input
            type="text"
            placeholder="Type your answer here..."
            value={userAnswer || ''}
            onChange={(e) => onAnswerChange(question.id, e.target.value)}
          />
        );

      default:
        return <div>Unsupported question type.</div>;
    }
  };

  return <div className="space-y-4">{renderQuestionType()}</div>;
};