export type TabRoute = string;

export interface NavigationTab {
  id: TabRoute;
  label: string;
  path: string;
//   icon: React.ComponentType<{ size?: number; className?: string }>;
    icon: any;
}