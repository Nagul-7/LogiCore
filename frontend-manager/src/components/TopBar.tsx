import { Search, Bell, Menu } from "lucide-react";

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 shrink-0">
      <button onClick={onMenuClick} className="lg:hidden mr-3 text-foreground">
        <Menu size={22} />
      </button>
      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:flex items-center bg-secondary rounded-lg px-3 h-9 w-52">
          <Search size={16} className="text-muted-foreground mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>

        <button className="relative text-muted-foreground hover:text-foreground">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-semibold">
            3
          </span>
        </button>

        <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-semibold">
          PM
        </div>
      </div>
    </header>
  );
}
