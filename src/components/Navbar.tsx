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
import { useMenuItems, userMenu } from "@/utils/constants";
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
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const dispatch: AppDispatch = useDispatch();

  const {
    data: user,
    error,
    status,
  } = useSelector((state: RootState) => state.user);
  const menuItems = useMenuItems()
  const { t } = useTranslation("common");
  const translatedUserMenu = userMenu.map((group) => ({
    ...group,
    title: t(`user_menu.groups.${group.title}`, { defaultValue: group.title }),
    menu: group.menu.map((item) => ({
      ...item,
      name: item.i18nKey ? t(item.i18nKey) : item.name,
    })),
  }));

  React.useEffect(() => {
    if (status == "idle") {
      dispatch(getCurrentUser());
    }
  }, [status, dispatch]);

  return (
    <nav className="backdrop-blur-md z-50 bg-card/80 shadow fixed w-full">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 3xl:px-0">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2 flex xl:hidden">
              <Sidebar />
            </div>
            <a href="/dashboard" className="mr-5">
              <div className="flex items-center select-none gap-1">
                {/* <Image src={logoIcon.src} alt="logo-icon" width={30} height={30} className="w-5 h-auto -mt-1" /> */}
                <img src={logo.src} alt="logo" className="w-32 h-auto" />
              </div>
            </a>
          </div>
          <div className="hidden xl:flex xl:flex-row">
            {menuItems.map((menuItem, index) => (
              <MenuItem key={index} menuItem={menuItem} />
            ))}
          </div>
          <div className="">
            <div className="ml-4 flex items-center md:ml-6">
              <DropdownMenuPaper
                /* @ts-ignore */
                title={t("navigation.notifications")}
              >
                <CardDemo />
              </DropdownMenuPaper>

              {/* Profile dropdown */}
              <div className="relative ml-3">
                <DropdownMenuCard
                  email={user?.email}
                  name={user?.username}
                  menuGroup={translatedUserMenu}
                >
                  <div>
                    <button
                      type="button"
                      className="relative z-[999] flex max-w-xs items-center rounded-full bg-card text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                      id="user-menu-button"
                      aria-expanded="false"
                      aria-haspopup="true"
                    >
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">{t("navigation.open_user_menu")}</span>
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.img ? user.img : profile.src}
                        alt={t("user_menu.profile_picture_alt")}
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
              <span className="sr-only">{t("navigation.open_main_menu")}</span>
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
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors dark:hover:bg-primary/15 hover:bg-slate-200/80  hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
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
  const { t } = useTranslation("common");
  const [open, setOpen] = React.useState(false);

  return (
    <NavigationMenu
      value={open ? "item" : ""}
      onValueChange={(val) => setOpen(val === "item")}
    >
      <NavigationMenuList>
        <NavigationMenuItem value="item">
          {menuItem.link && (
            <NavigationMenuLink
              href={menuItem.link}
              className={cn(navigationMenuTriggerStyle(), "first-letter:capitalize")}
            >
              {t(`navigation.groups.${menuItem.name}`)}
            </NavigationMenuLink>
          )}
          {menuItem.menu && (
            <>
              <NavigationMenuTrigger
                className="bg-transparent capitalize"
                onClick={() => setOpen((prev) => !prev)}
                onPointerMove={(e) => e.preventDefault()}
                onPointerLeave={(e) => e.preventDefault()}
              >
                {t(`navigation.groups.${menuItem.name}`)}
              </NavigationMenuTrigger>
              <NavigationMenuContent
                onPointerEnter={(e) => e.preventDefault()}
                onPointerLeave={(e) => e.preventDefault()}
              >
                <ul className="p-2 md:min-w-[100px] select-none lg:min-w-[200px]">
                  {menuItem.menu.map((component) => (
                    <ListItem
                      key={component.text}
                      title={component.text}
                      href={component.link}
                      onClick={() => setOpen(false)}
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