// src/components/quiz/QuizCard.tsx
import type { Quiz } from '@/interfaces/quiz.interfaces';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';


interface QuizCardProps {
  quiz: Quiz;
}

const difficultyVariantMap: Record<Quiz['difficulty'], 'default' | 'secondary' | 'destructive'> = {
    Easy: 'default',
    Medium: 'secondary',
    Hard: 'destructive'
}

export const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{quiz.title}</CardTitle>
          <Badge variant={difficultyVariantMap[quiz.difficulty]}>
            {quiz.difficulty}
          </Badge>
        </div>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* We can add more info here in the future */}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline">{quiz.categoryName}</Badge>
        <Button>Start Quiz</Button>
      </CardFooter>
    </Card>
  );
};