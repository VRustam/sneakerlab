interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="max-w-3xl space-y-3">
      {eyebrow ? (
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      ) : null}
      <h1 className="text-4xl font-black tracking-[-0.045em] text-balance sm:text-6xl">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
    </header>
  );
}
