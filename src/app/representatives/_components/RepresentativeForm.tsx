'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Representative } from '@prisma/client';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
    area: z.string().optional(),
});

type RepresentativeFormValues = z.infer<typeof formSchema>;

interface RepresentativeFormProps {
    onSuccess: () => void;
    initialData?: Representative | null;
}

const saveRepresentative = async ({ data, id }: { data: RepresentativeFormValues; id?: string }) => {
    const url = id ? `/api/representatives/${id}` : '/api/representatives';
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save representative');
    }
    return response.json();
};

export function RepresentativeForm({ onSuccess, initialData }: RepresentativeFormProps) {
    const queryClient = useQueryClient();
    const isEditing = !!initialData;

    const form = useForm<RepresentativeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            phone: initialData?.phone || '',
            area: initialData?.area || '',
        },
    });

    const mutation = useMutation({
        mutationFn: (data: RepresentativeFormValues) => saveRepresentative({ data, id: initialData?.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['representatives'] });
            if (!isEditing) form.reset();
            toast.success(isEditing ? 'Representative updated successfully' : 'Representative created successfully');
            onSuccess();
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to save representative');
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
                    {mutation.isPending ? 'Saving...' : isEditing ? 'Update Representative' : 'Save Representative'}
                </Button>
            </form>
        </Form>
    );
}
