'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    area: z.string().optional(),
});

type RepresentativeFormValues = z.infer<typeof formSchema>;

const createRepresentative = async (data: RepresentativeFormValues) => {
    const response = await fetch('/api/representatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create representative');
    }
    return response.json();
}

export function RepresentativeForm({ onSuccess }: { onSuccess: () => void }) {
    const queryClient = useQueryClient();
    const form = useForm<RepresentativeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', phone: '', area: '' },
    });

    const mutation = useMutation({
        mutationFn: createRepresentative,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['representatives'] });
            form.reset();
            onSuccess();
        },
        onError: (error) => {
            console.error('Error:', error.message);
        },
    });

    function onSubmit(data: RepresentativeFormValues) {
        mutation.mutate(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input placeholder="Rep Name" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="123-456-7890" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="area" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Area/Region</FormLabel>
                        <FormControl><Input placeholder="North" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" disabled={mutation.isPending} className="w-full">
                    {mutation.isPending ? 'Saving...' : 'Save Representative'}
                </Button>
            </form>
        </Form>
    );
}
