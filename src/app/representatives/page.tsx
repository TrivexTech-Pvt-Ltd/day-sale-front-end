'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Representative } from '@prisma/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { RepresentativeForm } from './_components/RepresentativeForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

const getRepresentatives = async (): Promise<Representative[]> => {
    const res = await fetch('/api/representatives');
    if (!res.ok) throw new Error('Failed to fetch representatives');
    return res.json();
};

const deleteRepresentative = async (id: string) => {
    const res = await fetch(`/api/representatives/${id}`, { method: 'DELETE' });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete representative');
    }
    return res.json();
};

export default function RepresentativesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRep, setEditingRep] = useState<Representative | null>(null);
    const [deletingRep, setDeletingRep] = useState<Representative | null>(null);
    const queryClient = useQueryClient();

    const { data: reps, isLoading, error } = useQuery({
        queryKey: ['representatives'],
        queryFn: getRepresentatives,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRepresentative,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['representatives'] });
            toast.success('Representative deleted successfully');
            setDeletingRep(null);
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to delete representative');
            setDeletingRep(null);
        },
    });

    const handleEdit = (rep: Representative) => {
        setEditingRep(rep);
        setIsDialogOpen(true);
    };

    const handleDialogClose = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingRep(null);
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Representatives</h1>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="size-4 mr-2" />
                            Add New Representative
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingRep ? 'Edit Representative' : 'Create a New Representative'}</DialogTitle>
                        </DialogHeader>
                        <RepresentativeForm
                            key={editingRep?.id || 'new'}
                            onSuccess={() => handleDialogClose(false)}
                            initialData={editingRep}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {isLoading && <p>Loading representatives...</p>}
            {error && <p className="text-red-500">Error: {error.message}</p>}

            {reps && (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Area</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reps.map((rep) => (
                                <TableRow key={rep.id}>
                                    <TableCell className="font-medium">{rep.name}</TableCell>
                                    <TableCell>{rep.phone || '—'}</TableCell>
                                    <TableCell>{rep.area || '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon-xs"
                                                onClick={() => handleEdit(rep)}
                                                title="Edit representative"
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon-xs"
                                                onClick={() => setDeletingRep(rep)}
                                                title="Delete representative"
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingRep} onOpenChange={(open) => !open && setDeletingRep(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Representative</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deletingRep?.name}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingRep && deleteMutation.mutate(deletingRep.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
