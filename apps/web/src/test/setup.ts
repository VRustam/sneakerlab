import '@testing-library/jest-dom/vitest';
import { createElement } from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ fill, priority, ...props }: Record<string, unknown>) => {
    void fill;
    void priority;
    return createElement('img', props);
  },
}));
