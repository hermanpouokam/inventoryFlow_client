//@ts-nocheck
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { ReactNode } from "react";

export function DropdownMenuCard({
  children,
  menuGroup,
  name,
  email,
}: Readonly<{
  children: ReactNode;
  menuGroup: DropdownMenuProps[];
  name: string | null | undefined;
  email: string | null | undefined;
}>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-[300px] mr-3">
        {name && (
          <>
            <DropdownMenuLabel>
              {name} <br />
              <span className="text-[.75rem] w-3/4 font-light text-slate-600 -mt-8 truncate ">
                {email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {menuGroup.map((menu) => {
          return (
            <DropdownMenuGroup key={menu.title}>
              {menu.menu.map((sub) => {
                //@ts-ignore
                const Icon: React.Component = sub.icon;
                if (sub.menu) {
                  return (
                    <DropdownMenuSub key={sub.link}>
                      <DropdownMenuSubTrigger>
                        {/* @ts-ignore */}
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{sub.name}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        {sub.menu.map((item) => {
                          const SubIcon = item.icon;
                          return (
                            <DropdownMenuSubContent key={item.link}>
                              <DropdownMenuItem>
                                {/* @ts-ignore */}
                                <SubIcon className="mr-2 h-4 w-4" />
                                <span>{item.text}</span>
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          );
                        })}
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  );
                } else {
                  return (
                    <React.Fragment key={sub.link}>
                      {sub.name == "Se déconnecter" && (
                        <DropdownMenuSeparator />
                      )}
                      <DropdownMenuItem
                        onClick={sub.onClick}
                        className={
                          sub.name == "Se déconnecter" &&
                          "text-red-500 hover:bg-red-400 hover:text-white"
                        }
                      >
                        {/* @ts-ignore */}
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{sub.name}</span>
                      </DropdownMenuItem>
                    </React.Fragment>
                  );
                }
              })}
            </DropdownMenuGroup>
          );
        })}
        {/* <DropdownMenuSeparator /> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
