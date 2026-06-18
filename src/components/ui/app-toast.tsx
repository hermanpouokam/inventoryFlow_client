
import { toast as SonnerToast, Toaster as Sonner } from "sonner";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, CircleAlert, Info, X, XCircle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>
type AppToastProps = {
    variant?: "default" | "success" | "destructive" | "warning";
    title: string;
    description?: string;
    className?: string;
    icon?: ReactNode;
    position?: ToasterProps["position"]
};

const variants = {
    default: "bg-zinc-900 border-zinc-800 text-white",
    success: "bg-emerald-700 border-emerald-600 text-white",
    destructive: "bg-red-600 border-red-600 text-white",
    warning: "bg-yellow-500 border-yellow-500 text-white",
};

export const toast = ({
    variant = "default",
    title,
    description,
    className,
    icon,
    position = "top-right"
}: AppToastProps) => {

    SonnerToast.custom((id) => (
        <div
            className={cn(
                "flex items-start gap-1.5 rounded-lg border px-4 py-3 shadow-lg min-w-[320px]",
                variants[variant],
                className
            )}
        >
            {icon && (
                <div className="mt-1.5 shrink-0">
                    {icon ?
                        icon : variant === 'destructive' ?
                            <XCircle className="size-4" /> :
                            variant === 'success' ?
                                <CheckCircle className="size-4" /> :
                                variant === 'warning' ?
                                    <CircleAlert className="size-4" /> :
                                    <Info className="size-4" />
                    }
                </div>
            )}

            <div className="flex-1">
                <p className="font-semibold">{title}</p>
                {description && (
                    <p className="text-sm font-normal">
                        {description}
                    </p>
                )}
            </div>

            <button
                onClick={() => SonnerToast.dismiss(id)}
                className="text-sm opacity-70 hover:opacity-100"
            >
                <X className="size-3" />
            </button>
        </div>
    ), { position })
};