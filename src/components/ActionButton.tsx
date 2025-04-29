import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EllipsisVertical, LucideIcon } from "lucide-react";

interface Action {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  visible?: boolean;
}

interface ActionsDropdownProps {
  actions: Action[];
}

const ActionsDropdown: React.FC<ActionsDropdownProps> = ({ actions }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions
          .filter((action) => action.visible !== false)
          .map((action, index) => (
            <DropdownMenuItem
              key={index}
              className="justify-between"
              onClick={action.onClick}
            >
              {action.label}
              {action.icon && <action.icon className="mr-3" size={14} />}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionsDropdown;
