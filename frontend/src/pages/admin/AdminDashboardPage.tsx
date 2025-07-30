// src/pages/admin/AdminDashboardPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { FileText, Layers, Users } from 'lucide-react'; 

const AdminDashboardPage = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                
                {/* Card for Managing Quizzes */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">Manage Quizzes</CardTitle>
                        <FileText className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Create, view, edit, and delete quizzes and their questions.
                        </p>
                        <Link to="/admin/quizzes" className="text-primary font-semibold mt-4 block">Go to Quizzes →</Link>
                    </CardContent>
                </Card>

                {/* Card for Managing Categories */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">Manage Categories</CardTitle>
                        <Layers className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Add, edit, and delete quiz categories.
                        </p>
                        <Link to="/admin/categories" className="text-primary font-semibold mt-4 block">Go to Categories →</Link>
                    </CardContent>
                </Card>
                
                {/* Placeholder card for a  User Management */}
                <Card className="hover:shadow-lg transition-shadow opacity-50 cursor-not-allowed">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">View User Results</CardTitle>
                        <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Browse results for all users across all quizzes.
                        </p>
                        <span className="text-gray-400 font-semibold mt-4 block">Coming Soon</span>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
};

export default AdminDashboardPage;