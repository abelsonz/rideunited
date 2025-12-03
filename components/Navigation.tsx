import { Button } from './ui/button';
import { Lock, Image, User, LogOut, Map, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import logo from 'figma:asset/83d0917cf2593b3c51096e2542a4919957b4c8f9.png';

interface NavigationProps {
  onLaunchCreator: () => void;
  onAdminClick?: () => void;
  onMediaClick?: () => void;
  user?: any;
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onMyRoutesClick?: () => void;
  onSettingsClick?: () => void;
}

export function Navigation({ 
  onLaunchCreator, 
  onAdminClick, 
  onMediaClick,
  user,
  onLoginClick,
  onLogoutClick,
  onMyRoutesClick,
  onSettingsClick
}: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-8">
          <div className="flex items-center gap-2">
            <a href="https://zachabelson.com" className="flex-shrink-0 cursor-pointer">
              <img src={logo} alt="Ride United" className="h-8 sm:h-10" />
            </a>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 w-auto justify-end">
            <Button 
              className="bg-[#10B981] hover:bg-[#059669] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm px-3 py-1 h-8 sm:h-9"
              onClick={onLaunchCreator}
            >
              Route Creator
            </Button>

            {user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                      <AvatarFallback className="bg-[#10B981] text-white">
                        {user.email?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onMyRoutesClick} className="cursor-pointer">
                    <Map className="mr-2 h-4 w-4" />
                    <span>My Routes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSettingsClick} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogoutClick} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                className="bg-[#10B981] hover:bg-[#059669] text-white w-auto font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm px-3 py-1 h-8 sm:h-9"
                onClick={onLoginClick}
              >
                Log In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}