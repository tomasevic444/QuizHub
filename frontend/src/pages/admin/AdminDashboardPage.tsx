// src/pages/admin/AdminDashboardPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';

const AdminDashboardPage = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Manage Quizzes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Create, view, edit, and delete quizzes and their questions.
                        </p>
                        {/* We will create this page next */}
                        <Link to="/admin/quizzes" className="text-primary font-semibold mt-4 block">Go to Quizzes →</Link>
                    </CardContent>
                </Card>
                {/* We can add more cards here later for categories, users, etc. */}
            </div>
        </div>
    );
};

export default AdminDashboardPage;