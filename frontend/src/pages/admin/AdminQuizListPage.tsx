import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuizzesForAdmin, deleteQuiz } from '@/api/adminService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Play, ListChecks } from 'lucide-react';
import { QuizFormDialog } from '@/components/admin/QuizFormDialog';
import { useState, useEffect } from 'react';
import { type Quiz } from '@/interfaces/quiz.interfaces';
import { Link } from 'react-router-dom';
import { useSignalR } from '@/context/SignalRContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { type LivePlayer, type LiveQuestion, type QuestionResultPayload } from '@/interfaces/livequiz.interfaces';

const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
};

const AdminQuizListPage = () => {
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
    const [formKey, setFormKey] = useState(0);

    const { connection, connect, disconnect } = useSignalR();
    const [isLobbyOpen, setIsLobbyOpen] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [players, setPlayers] = useState<LivePlayer[]>([]);
    
    const [gameState, setGameState] = useState<'lobby' | 'in-progress' | 'finished'>('lobby');
    const [currentQuestion, setCurrentQuestion] = useState<LiveQuestion | null>(null);
    const [resultData, setResultData] = useState<QuestionResultPayload | null>(null);

    useEffect(() => { 
        connect(); 
        return () => { disconnect(); } 
    }, [connect, disconnect]);

    useEffect(() => {
        if (connection) {
            connection.on("RoomCreated", (code: string) => {
                setRoomCode(code);
                setGameState('lobby');
                setIsLobbyOpen(true);
            });
            connection.on("UpdatePlayerList", (playerList: LivePlayer[]) => setPlayers(playerList));
            connection.on("Error", (errorMessage: string) => alert(`Error: ${errorMessage}`));
            
            connection.on("ReceiveNewQuestion", (question: LiveQuestion) => {
                setCurrentQuestion(question);
                setResultData(null); 
                setGameState('in-progress');
            });

            connection.on('ShowQuestionResult', (payload: QuestionResultPayload) => {
                setResultData(payload);
            });

            connection.on('QuizFinished', (leaderboard: { username: string; score: number }[]) => {
                setResultData({ correctOptionIds: [], leaderboard });
                setGameState('finished');
            });

            return () => {
                connection.off("RoomCreated");
                connection.off("UpdatePlayerList");
                connection.off("Error");
                connection.off("ReceiveNewQuestion");
                connection.off('ShowQuestionResult');
                connection.off('QuizFinished');
            }
        }
    }, [connection]);

    const { data: quizzes, isLoading } = useQuery({ queryKey: ['adminQuizzes'], queryFn: getQuizzesForAdmin });
    const deleteMutation = useMutation({ mutationFn: deleteQuiz, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminQuizzes'] }) });

    const handleEdit = (quiz: Quiz) => { setEditingQuiz(quiz); setFormKey(p => p + 1); setIsFormOpen(true); };
    const handleAddNew = () => { setEditingQuiz(null); setFormKey(p => p + 1); setIsFormOpen(true); };
    
    const handleHostQuiz = (quizId: number) => {
        setRoomCode("");
        setPlayers([]);
        setResultData(null);
        setCurrentQuestion(null);
        setGameState('lobby');
        connection?.invoke("AdminCreateRoom", quizId).catch(err => console.error("Error hosting quiz:", err));
    };

    const handleStartQuiz = () => {
        console.log("handleStartQuiz CALLED!");
        if (connection && roomCode) {
            connection.invoke("AdminStartQuiz", roomCode).catch(err => console.error("Error starting quiz:", err));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Manage Quizzes</h2>
                <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New Quiz</Button>
            </div>

            <QuizFormDialog key={formKey} isOpen={isFormOpen} setIsOpen={setIsFormOpen} quiz={editingQuiz} />

            <Dialog open={isLobbyOpen} onOpenChange={setIsLobbyOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Live Quiz Lobby & Monitor</DialogTitle>
                    </DialogHeader>

                    {gameState === 'lobby' && (
                        <div className="space-y-4">
                            <DialogDescription>Share this code with players to join.</DialogDescription>
                            <div className="text-center py-4"><p className="text-5xl font-bold tracking-widest bg-muted rounded-md p-4">{roomCode}</p></div>
                            <div>
                                <h3 className="font-semibold mb-2">Players Joined ({players.length}):</h3>
                                {players.length > 0 ? 
                                    <ul className="list-disc pl-5 max-h-32 overflow-y-auto">{players.map((p) => <li key={p.connectionId}>{p.username}</li>)}</ul>
                                    : <p className="text-sm text-muted-foreground">Waiting for players...</p>
                                }
                            </div>
                            <div className='pt-4'>
                                <Button onClick={handleStartQuiz} className="w-full" disabled={players.length === 0}>Start Quiz for Everyone</Button>
                            </div>
                        </div>
                    )}
                    
                    {(gameState === 'in-progress' || gameState === 'finished') && (
                        <div className="mt-4 space-y-4">
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {gameState === 'in-progress' ? `Question in Progress...` : `Quiz Finished!`}
                                </h3>
                                {currentQuestion && gameState === 'in-progress' && <p className="text-sm text-muted-foreground">{currentQuestion.text}</p>}
                            </div>
                            {resultData && (
                                <div>
                                    <h4 className="font-semibold mb-2">Live Leaderboard</h4>
                                    <ol className="space-y-1 max-h-48 overflow-y-auto">
                                    {resultData.leaderboard.map((p, i) => (
                                        <li key={p.username} className="flex justify-between text-sm p-2 rounded-md bg-muted/50">
                                            <span>{i + 1}. {p.username}</span>
                                            <span className="font-bold">{p.score}</span>
                                        </li>
                                    ))}
                                    </ol>
                                </div>
                            )}
                            {gameState === 'finished' && <Button onClick={() => setIsLobbyOpen(false)} className="w-full mt-4">Close Monitor</Button>}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="border rounded-lg">
                <Table>
                     <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Difficulty</TableHead>
                            <TableHead># Questions</TableHead><TableHead>Time Limit</TableHead><TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={6}>Loading...</TableCell></TableRow> :
                            quizzes?.map((quiz) => (
                                <TableRow key={quiz.id}>
                                    <TableCell className="font-medium">{quiz.title}</TableCell><TableCell>{quiz.categoryName}</TableCell>
                                    <TableCell>{quiz.difficulty}</TableCell><TableCell>{quiz.numberOfQuestions}</TableCell>
                                    <TableCell>{formatTime(quiz.timeLimitInSeconds)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" title="Host Live Quiz" onClick={() => handleHostQuiz(quiz.id)}><Play className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" title="Manage Questions" asChild><Link to={`/admin/quizzes/${quiz.id}/questions`}><ListChecks className="h-4 w-4" /></Link></Button>
                                        <Button variant="ghost" size="icon" title="Edit Quiz" onClick={() => handleEdit(quiz)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" title="Delete Quiz" onClick={() => deleteMutation.mutate(quiz.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminQuizListPage;