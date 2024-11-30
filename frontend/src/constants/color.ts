export const COLORS = {
    primary: {
        purple: '#6D5BD0',
        blue: '#4B71C6',
    },
    status: {
        green: '#22C55E',
        red: '#EF4444',
        yellow: '#F59E0B',
    },
    graph: {
        events: ['#6D5BD0', '#4B71C6', '#22C55E', '#F59E0B', '#EF4444'],
        line: {
            start: '#6D5BD0',
            end: '#4B71C6',
        },
        background: {
            start: 'rgba(109, 91, 208, 0.1)',
            end: 'rgba(75, 113, 198, 0.05)',
        },
    },
    background: {
        dark: '#F9FAFB',
        card: '#FFFFFF',
        input: '#E5E7EB',
    },
    text: {
        primary: '#111827',
        secondary: '#6B7280',
        muted: '#9CA3AF',
    },
} as const;

export type ColorKey = keyof typeof COLORS;

export const EVENT_COLORS = [
    '#6D5BD0', // Purple
    '#4B71C6', // Blue
    '#22C55E', // Green
    '#F59E0B', // Yellow
    '#EF4444'  // Red
] as const;