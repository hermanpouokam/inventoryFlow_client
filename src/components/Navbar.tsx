/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useMenuItems, menuTranslate, userMenu } from "@/utils/constants";
import { DropdownMenuCard } from "@/components/DropdownMenuCard";
import { DropdownMenuPaper } from "@/components/DropdownMenuPaper";
import CardDemo from "./notificationCard";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { getCurrentUser } from "@/redux/userSlicer";
import profile from "@/assets/img/user.png";
import logo from "@/assets/img/logo.png";
import Sidebar from "./sidebar";

export default function Navbar() {
  const dispatch: AppDispatch = useDispatch();

  const {
    data: user,
    error,
    status,
  } = useSelector((state: RootState) => state.user);
  const menuItems = useMenuItems()
  React.useEffect(() => {
    if (status == "idle") {
      dispatch(getCurrentUser());
    }
  }, [status, dispatch]);
  return (
    <nav className="backdrop-blur-md z-[999] bg-white/30 shadow fixed w-full">
      <div className="mx-auto max-w-screen-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 flex xl:hidden">
              <Sidebar />
            </div>
            <a href="/dashboard" className="mr-5">
              <div className="flex-shrink-0 select-none">
                <img src={logo.src} alt="logo" className="w-32 h-auto" />
              </div>
            </a>
          </div>
          <div className="hidden  xl:flex xl:flex-row">
            {menuItems.map((menuItem, index) => (
              <MenuItem key={index} menuItem={menuItem} />
            ))}
          </div>
          <div className="">
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenuPaper
                /* @ts-ignore */
                title={"Notifications"}
              >
                <CardDemo />
              </DropdownMenuPaper>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <DropdownMenuCard
                  email={user?.email}
                  name={user?.username}
                  menuGroup={userMenu}
                >
                  <div>
                    <button
                      type="button"
                      className="relative z-[999] flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.img ? user.img : profile.src}
                        alt="user profile picture"
                      />
                    </button>
                  </div>
                </DropdownMenuCard>
              </div>
            </div>
          </div>
          <div className="-mr-2 hidden">
            {/* Mobile menu button */}
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="absolute -inset-0.5" />
              <span className="sr-only">Open main menu</span>
              {/* Menu open: "hidden", Menu closed: "block" */}
              <svg
                className="block h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              {/* Menu open: "block", Menu closed: "hidden" */}
              <svg
                className="hidden h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm select-none font-medium leading-none">
            {title}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

const MenuItem = ({ menuItem }: { menuItem: Menu }) => {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          {menuItem.link && (
            <NavigationMenuLink
              href={menuItem.link}
              className={cn(navigationMenuTriggerStyle(), "first-letter:uppercase")}
            >
              {menuTranslate[menuItem.name]}
            </NavigationMenuLink>
          )}
          {menuItem.menu && (
            <>
              <NavigationMenuTrigger className="bg-transparent capitalize">
                {menuTranslate[menuItem.name]}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="p-2 md:min-w-[100px] select-none lg:min-w-[200px] ">
                  {menuItem.menu.map((component) => (
                    <ListItem
                      key={component.text}
                      title={component.text}
                      href={component.link}
                    />
                  ))}
                </ul>
              </NavigationMenuContent>
            </>
          )}
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};
