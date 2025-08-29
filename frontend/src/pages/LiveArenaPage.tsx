// src/pages/LiveArenaPage.tsx
import { useEffect, useState } from 'react';
import { useSignalR } from '@/context/SignalRContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const LiveArenaPage = () => {
  // Get the connect/disconnect functions and connection status from our context
  const { connect, disconnect, connection, isConnected } = useSignalR();
  const [roomCode, setRoomCode] = useState('');

  // Connect to SignalR when the component mounts
  useEffect(() => {
    connect();

    // Disconnect when the component unmounts (user navigates away)
    return () => {
      disconnect();
    };
  }, [connect, disconnect]); // Dependencies are stable

  // Set up listeners for server messages
  useEffect(() => {
    if (isConnected && connection) {
      connection.on('JoinedRoom', (message) => {
        alert(message); // Simple alert for now
      });
      connection.on('PlayerJoined', (message) => {
        console.log(message); 
      });
    }

    // Clean up listeners when connection changes
    return () => {
      connection?.off('JoinedRoom');
      connection?.off('PlayerJoined');
    }
  }, [isConnected, connection]);
  
  const handleJoinRoom = () => {
    if (connection && roomCode) {
      // 'invoke' calls a method on the server-side Hub
      connection.invoke('JoinRoom', roomCode)
        .catch(err => console.error('Error joining room:', err));
    }
  };

  if (!isConnected) {
    return <div>Connecting to the Live Arena...</div>;
  }

  return (
    <div className="container mx-auto">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Join Live Quiz</CardTitle>
          <CardDescription>Enter the room code provided by the host to join a live quiz session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input 
            placeholder="Enter Room Code" 
            value={roomCode} 
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          />
          <Button onClick={handleJoinRoom} className="w-full" disabled={!roomCode}>
            Join Room
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveArenaPage;