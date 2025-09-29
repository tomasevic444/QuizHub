// src/pages/QuizSessionPage.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getQuizForTaker, submitQuiz } from '@/api/quizService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react';
import { QuestionDisplay } from '@/components/quiz/QuestionDisplay';
import type { QuizSubmission } from '@/interfaces/quiz.interfaces';

const QuizSessionPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const quizId = parseInt(id!, 10);

  // 1. STATE MANAGEMENT
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, any>>(new Map());
  const [timeLeft, setTimeLeft] = useState(0);

  // 2. DATA FETCHING
  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ['quizTaker', quizId],
    queryFn: () => getQuizForTaker(quizId),
    enabled: !isNaN(quizId),
    staleTime: Infinity,
    gcTime: 0,
  });

  // 3. EFFECT HOOKS
  useEffect(() => {
    if (quiz) {
      setTimeLeft(quiz.timeLimitInSeconds);
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft <= 0 || !quiz) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, quiz]);

  useEffect(() => {
    if (timeLeft === 1) { // Submit a second before it hits 0 to avoid race conditions
      handleSubmitQuiz();
    }
  }, [timeLeft]);

  // 4. API MUTATION FOR SUBMISSION
  const mutation = useMutation({
    mutationFn: (submission: QuizSubmission) => submitQuiz(quizId, submission),
    onSuccess: (data) => {
      navigate(`/quiz/results/${quizId}`, { state: { result: data } });
    },
    onError: (error) => {
      console.error("Submission failed", error);
      alert("There was an error submitting your quiz. Please try again.");
    },
  });

  // 5. HANDLER FUNCTIONS
  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleAnswerChange = (questionId: number, answer: any) => {
    const newAnswers = new Map(userAnswers);
    newAnswers.set(questionId, answer);
    setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    if (!quiz || mutation.isPending) return;

    const answersPayload = Array.from(userAnswers.entries()).map(([questionId, answer]) => {
      const question = quiz.questions.find((q) => q.id === questionId);
      if (question?.type === 'FillInTheBlank') {
        return { questionId, submittedText: answer || '' };
      }
      if (!answer) return { questionId, selectedOptionIds: [] };
      return { questionId, selectedOptionIds: Array.isArray(answer) ? answer : [answer] };
    });

    const submissionPayload: QuizSubmission = {
      timeTakenInSeconds: quiz.timeLimitInSeconds - timeLeft,
      answers: answersPayload,
    };

    mutation.mutate(submissionPayload);
  };

  const handleEndQuiz = () => {
    if (window.confirm('Are you sure you want to end the quiz?')) {
      handleSubmitQuiz();
    }
  };

  // 6. RENDER LOGIC
  if (isLoading || !quiz) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="w-full h-[300px]" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  // If there's an error after loading, show an error message.
  if (isError) {
    return <div>Error loading quiz session.</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  // This check is a safeguard for an unlikely edge case (e.g., a quiz with no questions).
  if (!currentQuestion) {
    return <div>Quiz has no questions or an error occurred.</div>
  }

  // Format time for display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header: Title and Timer */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div
          className={`flex items-center gap-2 font-semibold p-2 rounded-md ${
            timeLeft < 60 ? 'text-destructive animate-pulse' : ''
          }`}
        >
          <Clock className="h-6 w-6" />
          <span>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <Progress value={progressPercentage} className="w-full" />
        <p className="text-sm text-center mt-2 text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </p>
      </div>

      {/* Question Display Area */}
      <Card>
        <CardHeader>
          <CardTitle>{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionDisplay
            question={currentQuestion}
            userAnswer={userAnswers.get(currentQuestion.id)}
            onAnswerChange={handleAnswerChange}
          />
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={handleEndQuiz}
            disabled={mutation.isPending}
          >
            End Quiz
          </Button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              variant="destructive"
              onClick={handleSubmitQuiz}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>Next</Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizSessionPage;