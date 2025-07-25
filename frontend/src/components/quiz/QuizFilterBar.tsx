// src/components/quiz/QuizFilterBar.tsx
import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/quizService';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { QuizFilters } from '@/api/quizService';

interface QuizFilterBarProps {
  filters: QuizFilters;
  onFilterChange: (newFilters: QuizFilters) => void;
}

const difficulties = ['Easy', 'Medium', 'Hard'];

export const QuizFilterBar: React.FC<QuizFilterBarProps> = ({ filters, onFilterChange }) => {
  // Fetch categories for the dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: Infinity, // Categories don't change often, so we can cache them forever
  });

  // Handler functions to update a single filter property
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchTerm: e.target.value });
  };

  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value === 'all' ? undefined : value });
  };

  const handleDifficultyChange = (value: string) => {
    onFilterChange({ ...filters, difficulty: value === 'all' ? undefined : value });
  };

  return (
    <div className="p-4 bg-card rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <Input
                placeholder="Search quizzes..."
                value={filters.searchTerm || ''}
                onChange={handleInputChange}
            />
            
            {/* Category Select */}
            <Select onValueChange={handleCategoryChange} value={filters.category || 'all'}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Difficulty Select */}
            <Select onValueChange={handleDifficultyChange} value={filters.difficulty || 'all'}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter by Difficulty" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    {difficulties.map(diff => (
                        <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  );
};