// /frontend/src/constants/color.ts

export const COLORS = {
    primary: {
        teal: 'rgb(13,118,128)',
        darkBlue: 'rgb(38,42,51)',
    },
    background: {
        main: 'rgb(255,241,229)',
        card: '#FFFFFF',
        dark: 'rgb(38,42,51)',
        section: 'rgb(38,42,51)',
    },
    text: {
        primary: '#1C1E21',
        secondary: '#505A64',
        muted: '#8B919A',
    },
    status: {
        green: '#22C55E',
        red: '#EF4444',
        yellow: '#F59E0B',
    },
    graph: {
        events: ['rgb(13,118,128)', '#4B71C6', '#22C55E', '#F59E0B', '#EF4444'],
        line: {
            start: 'rgb(13,118,128)',
            end: '#4B71C6',
        },
        background: {
            start: 'rgba(13,118,128, 0.1)',
            end: 'rgba(75,113,198, 0.05)',
        },
    },
} as const;