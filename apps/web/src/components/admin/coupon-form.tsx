'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface CouponFormProps {
  coupon?: {
    id: string;
    code: string;
    description: string | null;
    discount_type: string;
    discount_value: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    max_uses: number | null;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
  };
}

export function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);

    const body = {
      code: (formData.get('code') as string).trim().toUpperCase(),
      description: (formData.get('description') as string).trim() || null,
      discount_type: formData.get('discount_type') as string,
      discount_value: Number(formData.get('discount_value')),
      min_order_amount: Number(formData.get('min_order_amount') || 0),
      max_discount_amount: formData.get('max_discount_amount')
        ? Number(formData.get('max_discount_amount'))
        : null,
      max_uses: formData.get('max_uses') ? Number(formData.get('max_uses')) : null,
      starts_at: (formData.get('starts_at') as string) || null,
      expires_at: (formData.get('expires_at') as string) || null,
      is_active: formData.get('is_active') === 'on',
    };

    if (!body.code) {
      setError('Coupon code is required.');
      return;
    }
    if (body.discount_value <= 0) {
      setError('Discount value must be greater than 0.');
      return;
    }

    startTransition(async () => {
      try {
        const url = coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons';
        const method = coupon ? 'PATCH' : 'POST';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to save coupon.');
        }
        router.push('/admin/coupons');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{coupon ? 'Edit Coupon' : 'Create Coupon'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="code">
              Coupon Code *
            </label>
            <Input
              defaultValue={coupon?.code ?? ''}
              id="code"
              name="code"
              placeholder="SAVE20"
              className="font-mono uppercase"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="description">
              Description
            </label>
            <Input
              defaultValue={coupon?.description ?? ''}
              id="description"
              name="description"
              placeholder="20% off your order"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="discount_type">
              Discount Type *
            </label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              defaultValue={coupon?.discount_type ?? 'percentage'}
              id="discount_type"
              name="discount_type"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount ($)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="discount_value">
              Discount Value *
            </label>
            <Input
              defaultValue={coupon?.discount_value ?? ''}
              id="discount_value"
              name="discount_value"
              placeholder="20"
              step="0.01"
              type="number"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="min_order_amount">
              Min Order Amount ($)
            </label>
            <Input
              defaultValue={coupon?.min_order_amount ?? 0}
              id="min_order_amount"
              name="min_order_amount"
              placeholder="0"
              step="0.01"
              type="number"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="max_discount_amount">
              Max Discount Cap ($)
            </label>
            <Input
              defaultValue={coupon?.max_discount_amount ?? ''}
              id="max_discount_amount"
              name="max_discount_amount"
              placeholder="Optional"
              step="0.01"
              type="number"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="max_uses">
              Max Uses
            </label>
            <Input
              defaultValue={coupon?.max_uses ?? ''}
              id="max_uses"
              name="max_uses"
              placeholder="Unlimited"
              type="number"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                className="size-4 rounded accent-primary"
                defaultChecked={coupon?.is_active ?? true}
                name="is_active"
                type="checkbox"
              />
              Active
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="starts_at">
              Valid From
            </label>
            <Input
              defaultValue={coupon?.starts_at?.slice(0, 16) ?? ''}
              id="starts_at"
              name="starts_at"
              type="datetime-local"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="expires_at">
              Expires At
            </label>
            <Input
              defaultValue={coupon?.expires_at?.slice(0, 16) ?? ''}
              id="expires_at"
              name="expires_at"
              type="datetime-local"
            />
          </div>

          {error && (
            <p className="col-span-full text-sm font-medium text-destructive">{error}</p>
          )}

          <div className="col-span-full flex gap-3 pt-2">
            <Button disabled={isPending} type="submit">
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {coupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
            <Button
              onClick={() => router.push('/admin/coupons')}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
