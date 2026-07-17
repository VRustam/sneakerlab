'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  count: number;
}

interface CategoryBreakdownProps {
  data: CategoryData[];
}

const COLORS = [
  'oklch(0.88 0.19 125)',  // primary green
  'oklch(0.72 0.16 200)',  // blue
  'oklch(0.78 0.15 60)',   // amber
  'oklch(0.68 0.18 310)',  // purple
  'oklch(0.75 0.14 25)',   // coral
  'oklch(0.82 0.12 160)',  // teal
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryData }>;
}) {
  if (!active || !payload || payload.length === 0 || !payload[0]?.payload) return null;
  const data = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
      <p className="text-sm font-semibold">{data.name}</p>
      <p className="text-xs text-muted-foreground">
        {formatCurrency(data.value)} · {data.count} orders
      </p>
    </div>
  );
}

export function CategoryBreakdown({ data }: CategoryBreakdownProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No category data available yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid gap-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block size-3 shrink-0 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-medium">{item.name}</span>
            <span className="text-muted-foreground">{formatCurrency(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
