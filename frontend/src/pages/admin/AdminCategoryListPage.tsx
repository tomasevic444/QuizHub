// src/pages/admin/AdminCategoryListPage.tsx

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { getCategories } from '@/api/quizService';
import { createCategory, updateCategory, deleteCategory } from '@/api/adminService';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Category } from '@/interfaces/quiz.interfaces';

const AdminCategoryListPage = () => {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryName, setCategoryName] = useState("");

    const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: getCategories });

    const mutation = useMutation({
        mutationFn: (data: { id?: number; name: string }) => 
            data.id ? updateCategory(data.id, data.name) : createCategory(data.name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsOpen(false);
        },
        onError: (err: any) => alert(err.response?.data?.message || "An error occurred"),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
        onError: (err: any) => alert(err.response?.data?.message || "An error occurred"),
    });

    const handleOpen = (category: Category | null) => {
        setEditingCategory(category);
        setCategoryName(category ? category.name : "");
        setIsOpen(true);
    };

    const handleSubmit = () => {
        mutation.mutate({ id: editingCategory?.id, name: categoryName });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Manage Categories</h2>
                <Button onClick={() => handleOpen(null)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={mutation.isPending}>
                            {mutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow> :
                            categories?.map((cat) => (
                                <TableRow key={cat.id}>
                                    <TableCell>{cat.id}</TableCell>
                                    <TableCell>{cat.name}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpen(cat)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cat.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default AdminCategoryListPage;