import { RadioTower } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-border/40 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
        <RadioTower className="h-8 w-8 text-accent" />
        <h1 className="text-2xl font-bold ml-4 tracking-tight">DroneWatch</h1>
      </div>
    </header>
  );
}
