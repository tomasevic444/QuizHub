import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface LiveFinishedViewProps {
  leaderboard: { username: string; score: number }[];
}

export const LiveFinishedView: React.FC<LiveFinishedViewProps> = ({ leaderboard }) => {
  const winner = leaderboard[0];

  return (
    <div className="container mx-auto max-w-2xl text-center animate-in fade-in-0">
      <h1 className="text-4xl font-extrabold text-primary mb-4">Quiz Finished!</h1>
      {winner && (
        <div className="mb-8">
            <Trophy className="h-16 w-16 mx-auto text-yellow-400" />
            <h2 className="text-3xl font-bold mt-2">{winner.username} is the winner!</h2>
            <p className="text-xl text-muted-foreground">with a score of {winner.score}</p>
        </div>
      )}
      <Card>
        <CardHeader>
            <CardTitle>Final Leaderboard</CardTitle>
            <CardDescription>Congratulations to all participants!</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2">
            {leaderboard.map((player, index) => (
              <li key={player.username} className={`flex justify-between p-3 rounded-md ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/50' : 'bg-secondary/30'}`}>
                <span className="font-medium">{index + 1}. {player.username}</span>
                <span className="font-bold">{player.score}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};