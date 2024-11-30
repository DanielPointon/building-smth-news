// types/navbar.ts
export interface NavbarProps {
    onHistoryClick: () => void;
    className: string;
    onGlobalClick?: () => void;
    onExplorerClick?: () => void;
}