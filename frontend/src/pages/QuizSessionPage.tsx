// src/pages/QuizSessionPage.tsx
import { useState, useEffect} from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getQuizForTaker } from '@/api/quizService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock } from 'lucide-react'; 
import { QuestionDisplay } from '@/components/quiz/QuestionDisplay';


const QuizSessionPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const quizId = parseInt(id!, 10);

    // 1. STATE MANAGEMENT
    // Index of the current question being displayed
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // State to hold all the user's answers. Maps questionId -> answer
    const [userAnswers, setUserAnswers] = useState<Map<number, any>>(new Map());
    // State for the countdown timer
    const [timeLeft, setTimeLeft] = useState(0);

    // 2. DATA FETCHING
    const { data: quiz, isLoading, isError } = useQuery({
        queryKey: ['quizTaker', quizId],
        queryFn: () => getQuizForTaker(quizId),
        enabled: !isNaN(quizId),
        staleTime: Infinity,
        gcTime: 0,
    });

    useEffect(() => {
        if (quiz) {
            // When the 'quiz' data arrives, set the initial time left.
            setTimeLeft(quiz.timeLimitInSeconds);
        }
    }, [quiz]);
    // 3. TIMER LOGIC
    useEffect(() => {
        // If time is up or quiz isn't loaded, do nothing
        if (timeLeft <= 0 || !quiz) return;

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(timerId);
    }, [timeLeft, quiz]);

    // Effect to handle automatic submission when time runs out
    useEffect(() => {
        if (timeLeft === 0 && quiz) {
            // handleSubmitQuiz(); // will implement this later
        }
    }, [timeLeft, quiz]);


    // 4. HANDLER FUNCTIONS
    const handleNextQuestion = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    // This function will be passed to the QuestionDisplay component
    const handleAnswerChange = (questionId: number, answer: any) => {
        const newAnswers = new Map(userAnswers);
        newAnswers.set(questionId, answer);
        setUserAnswers(newAnswers);
    };

    const handleSubmitQuiz = () => {
        // Implement the API call to submit the quiz here 
        console.log("Submitting quiz with answers:", Object.fromEntries(userAnswers));
        // navigate(`/quiz/${quizId}/results`); // Navigate to results page after submission
    }

    // 5. RENDER LOGIC
    if (isLoading || !quiz) {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Show a more detailed skeleton to match the layout */}
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
                <div className={`flex items-center gap-2 font-semibold p-2 rounded-md ${timeLeft < 60 ? 'text-destructive animate-pulse' : ''}`}>
                    <Clock className="h-6 w-6" />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
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
                <Button variant="outline" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
                    Previous
                </Button>
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                    <Button variant="destructive" onClick={handleSubmitQuiz}>
                        Submit Quiz
                    </Button>
                ) : (
                    <Button onClick={handleNextQuestion}>
                        Next
                    </Button>
                )}
            </div>
        </div>
    );
};

export default QuizSessionPage;