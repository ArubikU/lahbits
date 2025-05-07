'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { API_URLS, poster } from '@/hooks/use-api';
import { TaskGenerationResponse } from '@/lib/ai-client';
import { Stat } from '@/types';
import { SelectGroup } from '@radix-ui/react-select';
import { useState } from 'react';

interface TaskGeneratorModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    stats: Stat[];
    uploadTasks: (tasks: TaskGenerationResponse[]) => Promise<void>;
    statsByCategory: Record<string, Stat[]>;
}

export default function TaskGeneratorModal({
    open,
    setOpen,
    stats,
    uploadTasks,
    statsByCategory,
}: TaskGeneratorModalProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [tasks, setTasks] = useState<TaskGenerationResponse[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 1;

    const handleGenerate = async () => {
        if (!prompt) return;
        setLoading(true);
        await generateTasksFromPrompt(prompt);
        setLoading(false);
    };

    const updateTask = (index: number, field: keyof TaskGenerationResponse, value: string | number) => {
        const updated = [...tasks];
        (updated[index] as any)[field] = value;
        setTasks(updated);
    };

    const deleteTask = (index: number) => {
        const updated = [...tasks];
        updated.splice(index, 1);
        setTasks(updated);
    };

    const generateTasksFromPrompt = async (prompt: string) => {
        try {
            const data = await poster(API_URLS.AI.GENERATE, { objectbody: { prompt, stats } });
            if (data.success) {
                const generatedTasks = data.result.map((task: any) => ({
                    title: task.title,
                    description: task.description,
                    xp_reward: task.xp_reward,
                    stat_id: task.stat_id,
                    deadline: task.deadline,
                }));
                setTasks(generatedTasks);
            } else {
                console.error('Error generando tareas', data.message);
            }
        } catch (error) {
            console.error('Error generando tareas', error);
        }
    };

    const paginatedTasks = tasks.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-full sm:max-w-3xl p-4 sm:p-6 bg-gray-800 shadow-lg border border-gray-700 rounded-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-100">Generar Tareas con IA</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <Textarea
                        placeholder="Describe qué actividades quieres convertir en tareas..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={loading}
                        className="min-h-[100px] sm:min-h-[120px] resize-none bg-gray-700 border border-gray-600 rounded-lg focus:border-green-500 focus:ring focus:ring-green-500 text-gray-100"
                    />
                    <Button
                        onClick={handleGenerate}
                        disabled={loading || !prompt}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {loading ? 'Generando...' : 'Generar Tareas'}
                    </Button>
                </div>

                {tasks.length > 0 && (
                    <div className="mt-6">
                        <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
                            {paginatedTasks.map((task, idx) => (
                                <div
                                    key={idx}
                                    className="relative rounded-lg border border-gray-600 bg-gray-700 p-4 sm:p-5 shadow-md"
                                >
                                    <button
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-400 transition"
                                        onClick={() => deleteTask((currentPage - 1) * tasksPerPage + idx)}
                                    >
                                        ✕
                                    </button>
                                    <div className="flex flex-col gap-3">
                                        <Input
                                            value={task.title}
                                            onChange={(e) => updateTask((currentPage - 1) * tasksPerPage + idx, 'title', e.target.value)}
                                            placeholder="Título"
                                            className="bg-gray-800 border border-gray-600 rounded-lg text-gray-100"
                                        />
                                        <Textarea
                                            value={task.description}
                                            onChange={(e) => updateTask((currentPage - 1) * tasksPerPage + idx, 'description', e.target.value)}
                                            placeholder="Descripción"
                                            className="resize-none bg-gray-800 border border-gray-600 rounded-lg text-gray-100"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                value={task.xp_reward}
                                                type="number"
                                                onChange={(e) => updateTask((currentPage - 1) * tasksPerPage + idx, 'xp_reward', Number(e.target.value))}
                                                placeholder="XP"
                                                className="bg-gray-800 border border-gray-600 rounded-lg text-gray-100"
                                            />
                                            <Select
                                                value={task.stat_id.toString()}
                                                onValueChange={(value) => updateTask((currentPage - 1) * tasksPerPage + idx, 'stat_id', Number(value))}
                                            >
                                                <SelectTrigger className="bg-gray-800 border border-gray-600 rounded-lg text-gray-100">
                                                    <SelectValue placeholder="Stat" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-800 border border-gray-600 rounded-lg">
                                                    {Object.entries(statsByCategory).map(([category, stats]) => (
                                                        <SelectGroup key={category}>
                                                            {category}
                                                            {stats.map((stat) => (
                                                                <SelectItem key={stat.id} value={stat.id.toString()}>
                                                                    {stat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Input
                                            value={task.deadline}
                                            onChange={(e) => updateTask((currentPage - 1) * tasksPerPage + idx, 'deadline', e.target.value)}
                                            placeholder="Fecha límite (YYYY-MM-DD)"
                                            type="date"
                                            className="bg-gray-800 border border-gray-600 rounded-lg text-gray-100"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <Button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="py-1 px-3 text-sm bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg"
                            >
                                Anterior
                            </Button>
                            <span className="text-gray-100 text-sm">
                                Tarea {currentPage} de {Math.ceil(tasks.length / tasksPerPage)}
                            </span>
                            <Button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(tasks.length / tasksPerPage)))}
                                disabled={currentPage === Math.ceil(tasks.length / tasksPerPage)}
                                className="py-1 px-3 text-sm bg-gray-700 hover:bg-gray-600 text-gray-100 rounded-lg"
                            >
                                Siguiente
                            </Button>
                        </div>
                    </div>
                )}

                <DialogFooter className="mt-8">
                    {tasks.length > 0 && (
                        <Button
                            onClick={() => uploadTasks(tasks)}
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                        >
                            Subir Todas
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
