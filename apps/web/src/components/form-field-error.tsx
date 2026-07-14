interface FormFieldErrorProps {
  id: string;
  message?: string;
}

export function FormFieldError({ id, message }: FormFieldErrorProps) {
  if (!message) return null;
  return (
    <p className="mt-1 text-sm text-destructive" id={id} role="alert">
      {message}
    </p>
  );
}
