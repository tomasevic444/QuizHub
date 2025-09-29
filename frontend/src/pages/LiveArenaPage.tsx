// src/pages/LiveArenaPage.tsx

import { useEffect, useState } from 'react';
import { useSignalR } from '@/context/SignalRContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { type LivePlayer, type LiveQuestion, type QuestionResultPayload } from '@/interfaces/livequiz.interfaces';
import { LiveQuizView } from '@/components/quiz/LiveQuizView';
import { LiveResultView } from '@/components/quiz/LiveResultView';
import { LiveFinishedView } from '@/components/quiz/LiveFinishedView';

interface LiveAnswerPayload {
    optionIds?: number[];
    textAnswer?: string;
}
const LiveArenaPage = () => {
    const { connect, disconnect, connection, isConnected } = useSignalR();
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    const [gameState, setGameState] = useState<'joining' | 'lobby' | 'in-progress' | 'showing-result' | 'finished'>('joining');
    const [players, setPlayers] = useState<LivePlayer[]>([]);
    const [quizTitle, setQuizTitle] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState<LiveQuestion | null>(null);
    const [resultData, setResultData] = useState<QuestionResultPayload | null>(null);
    const [finalLeaderboard, setFinalLeaderboard] = useState<{ username: string; score: number }[]>([]);

    useEffect(() => {
        connect();
        return () => { disconnect(); };
    }, [connect, disconnect]);

    useEffect(() => {
        if (isConnected && connection) {
            
            console.log("Setting up SignalR listeners (This should happen only once per connection).");
            
            const handleReceiveNewQuestion = (question: LiveQuestion) => {
                console.log("!!! FRONTEND RECEIVED: ReceiveNewQuestion !!!", question);
                setCurrentQuestion(question);
                setResultData(null);
                setError(null);
                setGameState('in-progress');
            };
            
            const handleShowQuestionResult = (payload: QuestionResultPayload) => {
                console.log("!!! FRONTEND RECEIVED: ShowQuestionResult !!!", payload);
                setResultData(payload);
                setGameState('showing-result');
            };

            const handleQuizFinished = (leaderboard: { username: string; score: number }[]) => {
                console.log("!!! FRONTEND RECEIVED: QuizFinished !!!", leaderboard);
                setFinalLeaderboard(leaderboard);
                setGameState('finished');
            };
            
            const handleJoinedSuccess = (title: string) => {
                setQuizTitle(title);
                setGameState('lobby');
                setError(null);
            };

            const handleUpdatePlayerList = (list: LivePlayer[]) => setPlayers(list);
            const handleError = (msg: string) => setError(msg);
            const handleAnswerAcknowledged = () => console.log("Server acknowledged the answer.");
            
            connection.on('ReceiveNewQuestion', handleReceiveNewQuestion);
            connection.on('ShowQuestionResult', handleShowQuestionResult);
            connection.on('QuizFinished', handleQuizFinished);
            connection.on('JoinedSuccess', handleJoinedSuccess);
            connection.on('UpdatePlayerList', handleUpdatePlayerList);
            connection.on('Error', handleError);
            connection.on('AnswerAcknowledged', handleAnswerAcknowledged);
            
            return () => {
                console.log("Cleaning up SignalR listeners.");
                connection.off('ReceiveNewQuestion', handleReceiveNewQuestion);
                connection.off('ShowQuestionResult', handleShowQuestionResult);
                connection.off('QuizFinished', handleQuizFinished);
                connection.off('JoinedSuccess', handleJoinedSuccess);
                connection.off('UpdatePlayerList', handleUpdatePlayerList);
                connection.off('Error', handleError);
                connection.off('AnswerAcknowledged');
            };
        }
    }, [isConnected, connection]); 

    const handleJoinRoom = () => {
        setError(null);
        if (connection && roomCode) {
            connection.invoke('JoinRoom', roomCode.toUpperCase())
                .catch(() => setError("Could not join the room. Check the code."));
        }
    };
    
    const handleAnswerSubmit = (answer: LiveAnswerPayload) => {
        if (connection && roomCode) {
            connection.invoke("PlayerSubmitAnswer", roomCode, answer);
        }
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Connecting to the Live Arena...</p>
            </div>
        );
    }
    
    if (gameState === 'finished') {
        return <LiveFinishedView leaderboard={finalLeaderboard} />;
    }

    if (gameState === 'showing-result' && resultData && currentQuestion) {
        return <LiveResultView result={resultData} question={currentQuestion} />;
    }

    if (gameState === 'in-progress' && currentQuestion) {
        return <LiveQuizView question={currentQuestion} onAnswerSubmit={handleAnswerSubmit} />;
    }
    
    if (gameState === 'lobby') {
        return (
             <div className="container mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold">Welcome to the lobby for:</h2>
                <h1 className="text-4xl font-extrabold text-primary mb-6">{quizTitle}</h1>
                <p className="text-xl text-muted-foreground mb-8">Waiting for the host to start the quiz...</p>
                <Card>
                    <CardHeader><CardTitle>Players in Lobby ({players.length})</CardTitle></CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {players.map((p) => <li key={p.connectionId} className="text-lg font-medium bg-secondary/20 p-2 rounded-md">{p.username}</li>)}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return ( // Default view is 'joining'
        <div className="container mx-auto">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Join Live Quiz</CardTitle>
                    <CardDescription>Enter the room code provided by the host to join a live quiz session.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Enter 4-Digit Room Code"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value)}
                        maxLength={4}
                        className="text-center text-2xl tracking-[1em] font-bold uppercase"
                    />
                    {error && <p className="text-destructive text-sm font-medium">{error}</p>}
                    <Button onClick={handleJoinRoom} className="w-full" disabled={roomCode.length !== 4}>
                        Join Room
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default LiveArenaPage;