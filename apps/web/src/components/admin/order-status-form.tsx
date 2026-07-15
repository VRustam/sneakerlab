'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatusAction } from '@/app/actions/admin';
import { Button } from '@/components/ui/button';
import {
  canTransitionOrderStatus,
  orderStatusValues,
  type AdminOrderStatus,
} from '@/lib/admin/validation';

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: AdminOrderStatus;
}

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<AdminOrderStatus>(currentStatus);
  const [message, setMessage] = useState<string>();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(undefined);
    const formData = new FormData();
    formData.set('orderId', orderId);
    formData.set('status', selected);
    startTransition(async () => {
      const result = await updateOrderStatusAction(formData);
      setMessage(result.error ?? result.success);
    });
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <label className="block text-sm font-semibold" htmlFor="order-status">
        Update status
      </label>
      <div className="flex flex-wrap gap-3">
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          id="order-status"
          onChange={(event) => setSelected(event.target.value as AdminOrderStatus)}
          value={selected}
        >
          {orderStatusValues.map((status) => (
            <option
              disabled={!canTransitionOrderStatus(currentStatus, status)}
              key={status}
              value={status}
            >
              {status}
            </option>
          ))}
        </select>
        <Button disabled={isPending || selected === currentStatus} type="submit">
          {isPending ? 'Updating…' : 'Update status'}
        </Button>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">
        Pending → processing/cancelled; processing → shipped/cancelled; shipped → delivered. Final
        states cannot change.
      </p>
      {message ? (
        <p className="text-sm text-destructive" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
