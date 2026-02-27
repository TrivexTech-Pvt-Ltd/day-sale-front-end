'use client';

import { useQuery } from '@tanstack/react-query';
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
import { useState } from 'react';

const getRepresentatives = async (): Promise<Representative[]> => {
    const res = await fetch('/api/representatives');
    if (!res.ok) throw new Error('Failed to fetch representatives');
    return res.json();
};

export default function RepresentativesPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data: reps, isLoading, error } = useQuery({
        queryKey: ['representatives'],
        queryFn: getRepresentatives,
    });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Representatives</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Add New Representative</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create a New Representative</DialogTitle>
                        </DialogHeader>
                        <RepresentativeForm onSuccess={() => setIsDialogOpen(false)} />
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
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reps.map((rep) => (
                                <TableRow key={rep.id}>
                                    <TableCell>{rep.name}</TableCell>
                                    <TableCell>{rep.phone || 'N/A'}</TableCell>
                                    <TableCell>{rep.area || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
