import type { LiveQuestion, QuestionResultPayload } from "@/interfaces/livequiz.interfaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface LiveResultViewProps {
  question: LiveQuestion;
  result: QuestionResultPayload;
}

export const LiveResultView: React.FC<LiveResultViewProps> = ({ question, result }) => {
  return (
    <div className="container mx-auto max-w-4xl animate-in fade-in-0">
      <h2 className="text-center text-2xl font-bold mb-4">Results for the last question:</h2>
      <p className="text-center text-muted-foreground text-xl mb-6">{question.text}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader><CardTitle>Correct Answers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {question.options.map(opt => {
                const isCorrect = result.correctOptionIds.includes(opt.id);
                return isCorrect ? (
                  <div key={opt.id} className="flex items-center p-3 bg-green-100 dark:bg-green-900/50 rounded-md">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <span>{opt.text}</span>
                  </div>
                ) : null;
              })}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>Live Leaderboard</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {result.leaderboard.slice(0, 5).map((player, index) => (
                  <li key={player.username} className="flex justify-between p-2 bg-secondary/30 rounded-md">
                    <span>{index + 1}. {player.username}</span>
                    <span className="font-bold">{player.score}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
      <p className="text-center mt-8 text-lg font-semibold animate-pulse">Next question coming up...</p>
    </div>
  );
};