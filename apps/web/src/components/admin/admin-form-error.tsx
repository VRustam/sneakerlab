interface AdminFormErrorProps {
  message?: string;
}

export function AdminFormError({ message }: AdminFormErrorProps) {
  if (!message) return null;
  return (
    <div
      className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
      role="alert"
    >
      <p className="font-bold">Please review the form</p>
      <p className="mt-1">{message}</p>
    </div>
  );
}
