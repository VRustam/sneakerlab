'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { checkoutAction } from '@/app/actions/checkout';
import { FormFieldError } from '@/components/form-field-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatPrice } from '@/lib/catalog/catalog-format';
import { checkoutSchema, type CheckoutFormValues } from '@/lib/commerce/checkout-validation';

interface CheckoutFormProps {
  defaultValues: Pick<CheckoutFormValues, 'customerName' | 'customerEmail'>;
  idempotencyKey: string;
  itemCount: number;
  subtotal: number;
}

export function CheckoutForm({
  defaultValues,
  idempotencyKey,
  itemCount,
  subtotal,
}: CheckoutFormProps) {
  const [isPending, startTransition] = useTransition();
  const [submissionError, setSubmissionError] = useState<string>();
  const { formState, handleSubmit, register } = useForm<CheckoutFormValues>({
    defaultValues: {
      ...defaultValues,
      addressLine1: '',
      addressLine2: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
      idempotencyKey,
    },
    resolver: zodResolver(checkoutSchema) as Resolver<CheckoutFormValues>,
  });
  const { errors } = formState;

  function onSubmit(values: CheckoutFormValues) {
    setSubmissionError(undefined);
    startTransition(async () => {
      const formData = new FormData();
      for (const [key, value] of Object.entries(values)) formData.set(key, value ?? '');
      const result = await checkoutAction(formData);
      if (result?.error) setSubmissionError(result.error);
    });
  }

  return (
    <form
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-6 rounded-xl border border-border bg-card p-5 sm:p-7">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
            Demo checkout
          </p>
          <h2 className="mt-2 text-2xl font-bold">Delivery details</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            No real payment will be charged. Final pricing and stock are calculated in the database.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <CheckoutField
            error={errors.customerName?.message}
            label="Contact name"
            name="customerName"
            register={register}
          />
          <CheckoutField
            error={errors.customerEmail?.message}
            label="Email address"
            name="customerEmail"
            register={register}
            type="email"
          />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <CheckoutField
            className="sm:col-span-2"
            error={errors.addressLine1?.message}
            label="Address line 1"
            name="addressLine1"
            register={register}
          />
          <CheckoutField
            className="sm:col-span-2"
            error={errors.addressLine2?.message}
            label="Address line 2 (optional)"
            name="addressLine2"
            register={register}
          />
          <CheckoutField
            error={errors.city?.message}
            label="City"
            name="city"
            register={register}
          />
          <CheckoutField
            error={errors.region?.message}
            label="State or region"
            name="region"
            register={register}
          />
          <CheckoutField
            error={errors.postalCode?.message}
            label="Postal code"
            name="postalCode"
            register={register}
          />
          <CheckoutField
            error={errors.country?.message}
            label="Country"
            name="country"
            register={register}
          />
        </div>
        <input type="hidden" {...register('idempotencyKey')} />
        {submissionError ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {submissionError}
          </p>
        ) : null}
      </div>
      <aside className="space-y-5 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold">Order summary</h2>
        <p className="text-sm text-muted-foreground">
          {itemCount} item{itemCount === 1 ? '' : 's'} · shipping included
        </p>
        <div className="space-y-3 border-y border-border py-4 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </p>
          <p className="flex justify-between">
            <span>Demo shipping</span>
            <span>Free</span>
          </p>
          <p className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </p>
        </div>
        <Button className="w-full" disabled={isPending} size="lg" type="submit">
          {isPending ? 'Placing demo order…' : 'Place demo order'}
        </Button>
        <p className="text-xs leading-5 text-muted-foreground">
          Submitting once creates one order for this checkout identifier. Refreshing cannot charge
          you or create a duplicate demo order.
        </p>
      </aside>
    </form>
  );
}

interface CheckoutFieldProps {
  name: keyof CheckoutFormValues;
  label: string;
  type?: string;
  className?: string;
  error?: string;
  register: ReturnType<typeof useForm<CheckoutFormValues>>['register'];
}

function CheckoutField({
  name,
  label,
  type = 'text',
  className,
  error,
  register,
}: CheckoutFieldProps) {
  const id = `checkout-${name}`;
  return (
    <div className={className}>
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <Input
        aria-describedby={error ? `${id}-error` : undefined}
        id={id}
        type={type}
        {...register(name)}
      />
      <FormFieldError id={`${id}-error`} message={error} />
    </div>
  );
}
