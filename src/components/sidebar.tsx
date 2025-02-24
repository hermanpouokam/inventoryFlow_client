import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import logo from "@/assets/img/logo.png";
import { menuItems, menuTranslate } from "@/utils/constants";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Sidebar() {

  const [open, setOpen] = useState<boolean>(false);

  const pathname = usePathname();
  const basePath = pathname.split("/")[1] || "";
  console.log(basePath);
  const submenuRefs = useRef<(HTMLUListElement | null)[]>([]);

  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);

  useEffect(() => {
    submenuRefs.current.forEach((submenu, index) => {
      if (submenu) {
        if (activeSubmenu === index) {
          submenu.style.maxHeight = submenu.scrollHeight + 100 + "px";
          submenu.style.paddingTop = "10px";
          submenu.style.paddingBottom = "10px";
        } else {
          submenu.style.maxHeight = "0px";
          submenu.style.paddingTop = "0px";
          submenu.style.paddingBottom = "0px";
        }
      }
    });
  }, [activeSubmenu]);

  const handleBtnClicked = (item: Menu, index: number) => {
    if (item.menu) {
      return setActiveSubmenu(activeSubmenu === index ? null : index);
    }
    window.location.assign(item.link);
  };

  useEffect(() => {
    if (open) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className="relative inline-flex items-center justify-center
                       rounded-md p-2 text-gray-700 hover:bg-gray-200
                      hover:text-gray-600 focus:outline-none focus:ring-2
                       focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-200"
        aria-controls="mobile-menu"
        aria-expanded="false"
      >
        <span className="absolute -inset-0.5" />
        <span className="sr-only">Open main menu</span>
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
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "bg-[rgba(0,0,0,.5)] z-[9999] w-screen fixed top-0 left-0 bottom-0 right-0 h-screen"
          )}
        ></div>
      )}
      <div
        className={cn(
          "h-screen overflow-auto scrollbar absolute top-0 z-[999999] left-0 bottom-0 py-5 space-y-5 flex flex-col items-center justify-start -translate-y-3 shadow-[0_3px_10px_rgb(0,0,0,0.2)]  bg-white w-[370px]  transition-transform duration-300 ease-in-out",
          open ? "-translate-x-12" : "-translate-x-[110%]"
        )}
      >
        <img src={logo.src} alt="logo" className="w-32 h-auto" />
        <ul className="space-y-2 w-full px-2 flex-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;

            return (
              <li className="px-1 pl-4">
                <Button
                  variant={"ghost"}
                  onClick={() => handleBtnClicked(item, index)}
                  className={cn(
                    "flex rounded justify-between items-center text-sm hover:text-indigo-700 hover:bg-indigo-100 font-medium text-neutral-800 w-full",
                    basePath.toLowerCase() === item.name.toLowerCase() &&
                      "text-indigo-700 bg-indigo-100"
                  )}
                >
                  <div className="flex gap-2 items-center capitalize justify-between">
                    {Icon && <Icon className={"w-3 h-3"} />}
                    {menuTranslate[item.name]}
                  </div>
                  {item.menu && (
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform duration-150",
                        activeSubmenu == index ? "rotate-180" : "rotate-0"
                      )}
                    />
                  )}
                </Button>

                <ul
                  ref={(el) => {
                    submenuRefs.current[index] = el;
                  }}
                  className={cn(
                    "max-h-0 w-full space-y-2 overflow-hidden transition-all ease-in-out duration-150 pl-8"
                  )}
                >
                  {item.menu?.map((el) => (
                    <li className="w-full ">
                      <a
                        href={el.link}
                        className={cn(
                          "text-sm p-2 w-full block transition font-medium text-muted-foreground hover:bg-indigo-50 hover:text-indigo-700 rounded"
                        )}
                      >
                        {el.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
