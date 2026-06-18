import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { BellRing, Check } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTranslation } from "react-i18next"

type CardProps = React.ComponentProps<typeof Card>

export default function CardDemo({ className, ...props }: CardProps) {
    const { t } = useTranslation("common")

    const notifications: Notification[] = []



    return (
        <div className={cn("w-[380px] z-50 border-none", className)} {...props}>
            <CardHeader>
                <CardTitle>{t("notifications.title")}</CardTitle>
                <CardDescription>{t("notifications.unread_count", { count: notifications.length })}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 -mt-4">
                <div className=" flex items-center space-x-2 rounded-md border p-2">
                    <BellRing />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {t("notifications.push_title")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t("notifications.push_description")}
                        </p>
                    </div>
                    <Switch />
                </div>
                <div className="max-h-[250px] transition-all overflow-auto mt-2 scrollbar">
                    {
                        notifications.length > 0 ?
                            notifications.map((notification, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                                >
                                    <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold leading-none">
                                            {notification.title}
                                        </p>
                                        <p className="text-[12px] font-medium line-clamp-2 text-muted-foreground leading-none">
                                            {notification.description}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {notification.time}
                                        </p>
                                    </div>
                                </div>
                            ))
                            :
                            <div className="text-scenter">{t("notifications.empty")}</div>
                    }
                </div>
            </CardContent>
            <CardFooter>
                <Button disabled={notifications.length > 0 ? false : true} className="w-full">
                    <Check className="mr-2 h-4 w-4" /> {t("notifications.mark_all_read")}
                </Button>
            </CardFooter>
        </div>
    )
}
