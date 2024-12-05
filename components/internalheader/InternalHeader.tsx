import React from 'react';
import { UserCircle2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InternalHeader() {
  return (
    <header className="flex items-center justify-between w-full max-h-24 ">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded-md hover:bg-accent hover:text-accent-foreground">
            Lorem ipsum
            <ChevronDown className="w-4 h-4 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="start">
          <DropdownMenuLabel>GPT Models</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              GPT
            </DropdownMenuItem>
            <DropdownMenuItem>
              GPT 2
            </DropdownMenuItem>
            <DropdownMenuItem>
              GPT 3
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="hidden items-center">
        <button className="p-2 rounded-full hover:bg-accent ">
          <UserCircle2 className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
} 