interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="max-w-2xl space-y-3">
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description ? (
        <p className="text-lg leading-8 text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}
