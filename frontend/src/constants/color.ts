export const COLORS = {
    primary: {
        purple: '#8B5CF6',
        blue: '#3B82F6',
    },
    status: {
        green: '#10B981',
        red: '#EF4444',
        yellow: '#F59E0B',
    },
    graph: {
        events: ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        line: {
            start: '#8B5CF6',
            end: '#3B82F6',
        },
        background: {
            start: 'rgba(139, 92, 246, 0.15)',
            end: 'rgba(59, 130, 246, 0.05)',
        },
    },
    background: {
        dark: '#111827',
        card: '#1F2937',
        input: '#374151',
    },
    text: {
        primary: '#F9FAFB',
        secondary: '#9CA3AF',
        muted: '#6B7280',
    },
} as const;

export type ColorKey = keyof typeof COLORS;

// constants/colors.ts
export const EVENT_COLORS = [
    '#8B5CF6', // Purple
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444'  // Red
] as const;
