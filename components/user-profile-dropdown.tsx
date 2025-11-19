"use client";

import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  HelpCircle,
  Sparkles,
} from "lucide-react";

export function UserProfileDropdown() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();

  const userInitials = user?.fullName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0].toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full min-h-[44px] min-w-[44px]"
          aria-label="User profile"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.fullName || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => router.push("/dashboard")}
        >
          <Sparkles className="h-4 w-4" />
          <span>Dashboard</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => router.push("/settings?tab=profile")}
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => router.push("/pricing")}
        >
          <CreditCard className="h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer gap-2"
          onClick={() => window.open("https://docs.campusgtm.com", "_blank")}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer gap-2 text-destructive focus:text-destructive"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
