// src/pages/LiveArenaPage.tsx

import { useEffect, useState } from 'react';
import { useSignalR } from '@/context/SignalRContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LivePlayer {
    connectionId: string;
    username: string;
    score: number;
}

const LiveArenaPage = () => {
    const { connect, disconnect, connection, isConnected } = useSignalR();
    const [roomCode, setRoomCode] = useState('');
    const [error, setError] = useState<string | null>(null);

    // State for the lobby view
    const [isInLobby, setIsInLobby] = useState(false);
    const [players, setPlayers] = useState<LivePlayer[]>([]);
    const [quizTitle, setQuizTitle] = useState("");

    // Connect to SignalR when the component mounts
    useEffect(() => {
        connect();
        // Disconnect when the component unmounts
        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    // Set up listeners for server messages
    useEffect(() => {
        if (isConnected && connection) {
            connection.on('JoinedSuccess', (title: string) => {
                setQuizTitle(title);
                setIsInLobby(true);
                setError(null);
            });
            connection.on('UpdatePlayerList', (playerList: LivePlayer[]) => {
                setPlayers(playerList);
            });
            connection.on('Error', (errorMessage: string) => {
                setError(errorMessage);
            });

            // Cleanup listeners
            return () => {
                connection.off('JoinedSuccess');
                connection.off('UpdatePlayerList');
                connection.off('Error');
            }
        }
    }, [isConnected, connection]);

    const handleJoinRoom = () => {
        setError(null);
        if (connection && roomCode) {
            connection.invoke('JoinRoom', roomCode.toUpperCase())
                .catch(err => {
                    console.error('Error joining room:', err);
                    setError("Could not join the room. Please check the code and try again.");
                });
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
    
    // Lobby View
    if (isInLobby) {
        return (
            <div className="container mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold">Welcome to the lobby for:</h2>
                <h1 className="text-4xl font-extrabold text-primary mb-6">{quizTitle}</h1>
                <p className="text-xl text-muted-foreground mb-8">Waiting for the host to start the quiz...</p>
                <Card>
                    <CardHeader>
                        <CardTitle>Players in Lobby ({players.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {players.map((p) => (
                                <li key={p.connectionId} className="text-lg font-medium bg-secondary/20 p-2 rounded-md">
                                    {p.username}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Join Room View
    return (
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
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        maxLength={4}
                        className="text-center text-2xl tracking-[1em] font-bold"
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