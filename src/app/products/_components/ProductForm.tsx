'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Product } from '@prisma/client';

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    sku: z.string().optional(),
    costPrice: z.coerce.number(),
    sellPrice: z.coerce.number().min(0, 'Sell price must be positive'),
    reorderLevel: z.coerce.number(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
    onSuccess: () => void;
    initialData?: Product | null;
}

const saveProduct = async ({ data, id }: { data: ProductFormValues; id?: string }) => {
    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || 'Failed to save product');
        (error as any).details = errorData.details;
        throw error;
    }
    return response.json();
};

export function ProductForm({ onSuccess, initialData }: ProductFormProps) {
    const queryClient = useQueryClient();
    const isEditing = !!initialData;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: initialData?.name || '',
            sku: initialData?.sku || '',
            costPrice: initialData?.costPrice || 0,
            sellPrice: initialData?.sellPrice || 0,
            reorderLevel: initialData?.reorderLevel || 0,
        },
    });

    const mutation = useMutation({
        mutationFn: (data: ProductFormValues) => saveProduct({ data, id: initialData?.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (!isEditing) form.reset();
            toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
            onSuccess();
        },
        onError: (error: any) => {
            const errorMessage = error.details || error.message || 'Failed to save product';
            if (errorMessage.toLowerCase().includes('sku')) {
                form.setError('sku', { message: 'This SKU is already in use. Please use a different one.' });
            } else {
                toast.error(errorMessage);
            }
        },
    });

    function onSubmit(data: ProductFormValues) {
        mutation.mutate(data);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl><Input placeholder="Product Name" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl><Input placeholder="SKU-123" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="costPrice" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="sellPrice" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sell Price</FormLabel>
                        <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="reorderLevel" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reorder Level</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <Button type="submit" disabled={mutation.isPending} className="w-full">
                    {mutation.isPending ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
                </Button>
            </form>
        </Form>
    );
}
