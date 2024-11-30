export interface DataPoint {
    date: string;
    probability: number;
}

export interface Event {
    date: string;
    title: string;
}

export interface GraphTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        dataKey: string;
    }>;
    label?: string;
}

export interface EventLabelProps {
    event: Event;
    color: string;
}

export interface ProbabilityGraphProps {
    data: DataPoint[];
    events: Event[];
}
