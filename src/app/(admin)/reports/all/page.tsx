'use client'

import CardBodyContent from '@/components/CardContent'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableDemo } from '@/components/TableComponent'
import { instance } from '@/components/fetch'
import { useTranslation } from 'react-i18next'
import { useQueryState } from 'nuqs'
import { ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Backdrop, CircularProgress } from '@mui/material'
import {
    MessageSquare,
    MapPin,
    User,
    Image as ImageIcon,
    Calendar,
    X,
    ExternalLink,
    Loader2,
    Filter,
    Eye,
} from 'lucide-react'
import * as React from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { motion, AnimatePresence } from "framer-motion"
import { DateRangePicker } from '@/components/DateRangePicker'
import SelectPopover from '@/components/SelectPopover'
import { datesData } from '@/utils/constants'
import { usePermission } from '@/context/PermissionContext'
import { RootState } from '@/redux/store'
import moment from 'moment'
import { fetchClients } from '@/redux/clients'
import { fetchSalesPoints } from '@/redux/salesPointsSlicer'
import { useDispatch, useSelector } from "react-redux";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SalesPoint {
    id: number
    name: string
}

interface Complaint {
    sales_point_address: string
    id: string
    sales_point: number
    sales_point_name: string
    client_code: string
    message: string
    image_1_key: string | null
    image_2_key: string | null
    image_1_url: string | null
    image_2_url: string | null
    created_at: string
}

// ── Hook données ──────────────────────────────────────────────────────────────
// Le fetch ne se déclenche QU'AU MONTAGE puis manuellement via `reload()`
// (bouton "Rechercher"). Changer un filtre ne provoque jamais d'appel API tout
// seul. `filtersRef` garantit que `reload()` utilise toujours les filtres
// actuellement sélectionnés au moment du clic (pas une fermeture obsolète).
function useComplaints(filters: Record<string, string>) {
    const [complaints, setComplaints] = React.useState<Complaint[]>([])
    const [loading, setLoading] = React.useState(true)

    const filtersRef = React.useRef(filters)
    filtersRef.current = filters

    const load = React.useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            Object.entries(filtersRef.current).forEach(([k, v]) => { if (v) params.set(k, v) })
            const res = await instance.get(`/complaints/?${params.toString()}`, { withCredentials: true })
            setComplaints(res.data.results ?? res.data)
        } catch {
            setComplaints([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Chargement initial uniquement — pas de dépendance sur les filtres
    React.useEffect(() => { load() }, [load])

    return { complaints, loading, setLoading, reload: load }
}

// ── Popup détail ──────────────────────────────────────────────────────────────

function ComplaintDetailPanel({
    complaint,
    onClose,
}: {
    complaint: Complaint
    onClose: () => void
}) {
    const { t } = useTranslation('common')
    const [detail, setDetail] = React.useState<Complaint>(complaint)
    const [loadingUrls, setLoadingUrls] = React.useState(false)
    const [imgOpen, setImgOpen] = React.useState<string | null>(null)
    React.useEffect(() => {
        setLoadingUrls(true)
        instance
            .get(`/complaints/${complaint.id}/`, { withCredentials: true })
            .then(r => setDetail(r.data))
            .catch(() => { })
            .finally(() => setLoadingUrls(false))
    }, [complaint.id])

    const images = [detail.image_1_url, detail.image_2_url].filter(Boolean) as string[]

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 -top-5 h-full bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Panel droit */}
            <motion.div
                className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md max-h-[90vh] bg-[#212121] shadow-2xl flex flex-col border-l border-border rounded-lg overflow-hidden"
            >
                <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
                    <div>
                        <h2 className="text-base font-semibold text-foreground">Détail de la plainte</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(detail.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 hover:bg-accent text-muted-foreground transition ml-4 shrink-0"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Contenu scrollable */}
                <div className="flex-1 overflow-y-auto scrollbar px-6 py-5 space-y-5">

                    {/* Cartes info */}
                    <div className="space-y-3">
                        <div className="rounded-xl border border-border bg-background/50 p-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                <User className="size-3.5" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Code client</span>
                            </div>
                            <p className="text-sm font-bold text-foreground font-mono">{detail.client_code}</p>
                        </div>
                        <div className="rounded-xl border border-border bg-background/50 p-4">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                <MapPin className="size-3.5" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Point de vente</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground">{detail.sales_point_name}- {detail.sales_point_address}</p>
                        </div>
                    </div>

                    {/* Message */}
                    <div>
                        <div className="rounded-xl border border-border bg-background/50 p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                <MessageSquare className="size-3.5" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Message</span>
                            </div>
                            {detail.message}
                        </div>
                    </div>

                    {/* Images */}
                    {(detail.image_1_key || detail.image_2_key) && (
                        <div>
                            <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
                                <ImageIcon className="size-3.5" />
                                <span className="text-[10px] font-semibold uppercase tracking-wider">Photos jointes</span>
                            </div>
                            {loadingUrls ? (
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Loader2 className="size-4 animate-spin" />
                                    <span className="text-xs">Chargement des images…</span>
                                </div>
                            ) : images.length > 0 ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {images.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setImgOpen(url)}
                                            className="group relative rounded-xl overflow-hidden border border-border aspect-video hover:border-primary transition-all"
                                        >
                                            <img
                                                src={url}
                                                alt={`Photo ${i + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center">
                                                <ExternalLink className="size-5 text-white opacity-0 group-hover:opacity-100 transition" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground">Aucune image disponible</p>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Lightbox */}
            {imgOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-6"
                    onClick={() => setImgOpen(null)}
                >
                    <img
                        src={imgOpen}
                        alt=""
                        className="max-w-full max-h-full rounded-xl shadow-2xl"
                    />
                    <button
                        onClick={() => setImgOpen(null)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition"
                    >
                        <X className="size-5" />
                    </button>
                </div>
            )}
        </>
    )
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ComplaintsPage() {

    const { hasPermission, user, isAdmin } = usePermission()
    const { t: tCommon } = useTranslation('common')
    const [customer, setCustomer] = React.useState<Customer[]>([]);
    const [searchText, setSearchText] = React.useState('')
    const [selected, setSelected] = React.useState<Complaint | null>(null)
    const [tableInstance, setTableInstance] = React.useState<any | null>(null)
    const [selectedSalesPoints, setSelectedSalesPoints] = React.useState<
        SalesPoint[]
    >(isAdmin() ? [] : [user?.sales_point_details]);

    const [pickedDateRange, setPickedDateRange] = React.useState<{
        from: Date | null;
        to: Date | null;
    } | null>({ from: new Date(), to: new Date() });


    const {
        data: customers,
        error: errorCustomers,
        status: statusCustomers,
    } = useSelector((state: RootState) => state.clients);

    const dispatch = useDispatch();

    const {
        data: salespoints,
        status: salespointStatus,
        error: salespointError,
    } = useSelector((state: RootState) => state.salesPoints);


    React.useEffect(() => {
        if (salespointStatus == "idle" && isAdmin()) {
            dispatch(fetchSalesPoints());
        }
    }, [dispatch, salespointStatus, statusCustomers]);

    const handleDateRangeChange = (range: {
        from: Date | null;
        to: Date | null;
    }) => {
        setPickedDateRange(range);
    };

    const handleSelectCustomers = (data: Customer) => {
        setCustomer((prev) =>
            prev.includes(data)
                ? prev.filter((item) => item !== data)
                : [...prev, data]
        );
    };

    const handleSelect = (data: SalesPoint) => {
        const newSelectedSalesPoints = selectedSalesPoints.includes(data)
            ? selectedSalesPoints.filter((s) => s != data)
            : [...selectedSalesPoints, data];

        setSelectedSalesPoints(newSelectedSalesPoints);
        setCustomer([]);
        dispatch(
            fetchClients({ sales_points: isAdmin() ? newSelectedSalesPoints.map((el) => el.id) : [] })
        );

    };

    const filters = React.useMemo(() => ({
        client_code: customer.map(el => el.code).join(','),
        sales_point: selectedSalesPoints.map(el => el.id).join(","),
        start_date: moment(pickedDateRange?.from).format("YYYY-MM-DDT00:00:00.SSS"),
        end_date: moment(pickedDateRange?.to).format("YYYY-MM-DDT23:59:59.SSS"),
    }), [customer, selectedSalesPoints, pickedDateRange])

    const { complaints, loading, reload } = useComplaints(filters)


    // Stats cards
    const cards = React.useMemo(() => [
        {
            title: 'Total plaintes',
            value: complaints.length,
            icon: MessageSquare,
            color: 'bg-indigo-100 text-indigo-800',
            iconColor: 'bg-indigo-200 text-indigo-900',
            sub: "",
            subColor: 'text-muted-foreground',
        },
        {
            title: 'Avec photos',
            value: complaints.filter(c => c.image_1_key || c.image_2_key).length,
            icon: ImageIcon,
            color: 'bg-violet-100 text-violet-800',
            iconColor: 'bg-violet-200 text-violet-900',
            sub: ``,
            subColor: 'text-muted-foreground',
        },
        {
            title: 'Points de vente',
            value: new Set(complaints.map(c => c.sales_point)).size,
            icon: MapPin,
            color: 'bg-blue-100 text-blue-800',
            iconColor: 'bg-blue-200 text-blue-900',
            sub: 'Concernés par des plaintes',
            subColor: 'text-muted-foreground',
        },
        {
            title: 'Clients uniques',
            value: new Set(complaints.map(c => c.client_code)).size,
            icon: User,
            color: 'bg-amber-100 text-amber-800',
            iconColor: 'bg-amber-200 text-amber-900',
            sub: 'Codes clients distincts',
            subColor: 'text-muted-foreground',
        },
    ], [complaints])

    // Colonnes table
    const columns: ColumnDef<Complaint>[] = [
        {
            accessorKey: 'number',
            header: () => <div className="">#</div>,
            cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('number')}</div>,
        },
        {
            accessorKey: 'client_code',
            header: () => <div className="w-[150px] text-center">{tCommon('customer_code')}</div>,
            cell: ({ row }) => (
                <div className="font-mono text-xs px-2 py-1 text-center rounded-md font-semibold">
                    {row.getValue('client_code')}
                </div>
            ),
        },
        {
            accessorKey: 'sales_point_name',
            header: () => <div className='w-[140px] text-center'>Point de vente</div>,
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5 text-sm">
                    {row.getValue('sales_point_name')} - {row.original.sales_point_address}
                </div>
            ),
        },
        {
            accessorKey: 'message',
            header: () => <div className='text-center w-[460px]'>Message</div>,
            cell: ({ row }) => (
                <p className="truncate text-center text-sm text-muted-foreground">
                    {row.getValue('message')}
                </p>
            ),
        },
        {
            accessorKey: 'image_1_key',
            header: () => <div className="text-center w-[120px]">Photos</div>,
            cell: ({ row }) => {
                const c = row.original
                const count = [c.image_1_key, c.image_2_key].filter(Boolean).length
                return (
                    <div className="flex justify-center">
                        {count > 0 ? (
                            <span className="text-xs bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                                {count} photo{count > 1 ? 's' : ''}
                            </span>
                        ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                        )}
                    </div>
                )
            },
        },
        {
            accessorKey: 'created_at',
            header: () => <div className="text-center w-[160px]">{tCommon('date')}</div>,
            cell: ({ row }) => (
                <div className="text-center text-xs text-muted-foreground whitespace-nowrap">
                    {format(new Date(row.getValue('created_at')), 'dd/MM/yyyy HH:mm')}
                </div>
            ),
        },
        {
            id: 'actions',
            enableHiding: false,
            header: () => <div className="text-center w-[120px]">Détails</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => setSelected(row.original)}
                    >
                        <Eye className="size-4" />
                        Voir
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-5">
            <Backdrop
                sx={{ color: '#8b5cf6', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading || salespointStatus == "loading" || statusCustomers == "loading"}
            >
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Header */}
            <CardBodyContent className="flex items-center justify-between">
                <div>
                    <h2 className="font-medium text-base">Plaintes clients</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {loading ? 'Chargement…' : `${complaints.length} plainte${complaints.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
            </CardBodyContent>
            <CardBodyContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <DateRangePicker
                        defaultDateRange={pickedDateRange}
                        datesData={datesData}
                        onDateRangeChange={(date) => {
                            if (date.from && date.to) {
                                handleDateRangeChange(date);
                            }
                        }}
                    />
                    {isAdmin() ?
                        <SelectPopover
                            selectedItems={selectedSalesPoints}
                            items={salespoints}
                            onSelect={handleSelect}
                            getOptionLabel={(option) => `${option.name} - ${option.address}`}
                            placeholder={tCommon("sales_points.singular")}
                            searchPlaceholder={tCommon("sales_points.search")}
                        /> : null
                    }
                    <SelectPopover
                        selectedItems={customer}
                        items={selectedSalesPoints.length > 0 ? customers : []}
                        onSelect={handleSelectCustomers}
                        getOptionLabel={(option) => `${option.name} ${option.surname}`}
                        noItemText={selectedSalesPoints.length < 1 ? tCommon("sales_points.select_required") : tCommon("customers.no_category")}
                        placeholder={tCommon("customers.label")}
                        searchPlaceholder={tCommon("customers.search")}
                    />
                    <Button
                        variant={"primary"}
                        onClick={reload}
                        className={cn("w-full")}
                    >
                        {tCommon("search.action")}
                    </Button>
                </div>
            </CardBodyContent>
            {/* Cartes stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <Card key={i} className="border border-border">
                        <CardContent className="p-5">
                            <div className="flex flex-row justify-between items-center">
                                <p className="text-sm font-semibold">{card.title}</p>
                                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.iconColor)}>
                                    <card.icon className="w-5 h-5" />
                                </div>
                            </div>
                            {loading ? (
                                <Skeleton className="h-9 mt-2" />
                            ) : (
                                <h2 className="text-2xl mt-2 font-bold">{card.value}</h2>
                            )}
                            {loading ? (
                                <Skeleton className="h-3 mt-2" />
                            ) : (
                                <span className={cn('text-xs font-medium', card.subColor)}>{card.sub}</span>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Table + filtres */}
            <CardBodyContent className="shadow border select-none rounded-lg p-5">
                <h3 className="font-medium text-base mb-4">Liste des plaintes</h3>
                <DataTableDemo
                    setTableData={setTableInstance}
                    columns={columns}
                    filterAttributes={['client_code', 'sales_point_name']}
                    searchText={searchText}
                    data={complaints.map((c, i) => ({ ...c, number: i + 1 }))}
                >
                    <div className="flex flex-wrap items-center gap-3 py-4">
                        {/* Recherche texte */}
                        <Input
                            placeholder="Rechercher par code client ou point de vente…"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>
                </DataTableDemo>
            </CardBodyContent>

            {/* Panel détail */}
            <AnimatePresence>
                {selected && (
                    <ComplaintDetailPanel
                        complaint={selected}
                        onClose={() => setSelected(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}