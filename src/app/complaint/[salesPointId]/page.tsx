'use client'

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { CheckCircle, Upload, X, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { publicInstance } from "@/components/fetch"
import * as React from 'react';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import CardBodyContent from "@/components/CardContent"

interface SalesPointInfo {
    id: number
    name: string
    address: string
}

async function getPresignedUrl(filename: string, contentType: string) {
    const res = await publicInstance.post("/complaints/presigned-url/", {
        filename,
        content_type: contentType,
    })
    return res.data as { upload_url: string; fields: Record<string, string>; s3_key: string }
}

async function uploadToS3(
    file: File,
    presigned: { upload_url: string; fields: Record<string, string>; s3_key: string }
) {
    // Upload direct vers S3 — pas via notre backend, donc fetch natif
    const form = new FormData()
    Object.entries(presigned.fields).forEach(([k, v]) => form.append(k, v))
    form.append("file", file)
    const res = await fetch(presigned.upload_url, { method: "POST", body: form })
    if (!res.ok) throw new Error("Échec de l'upload de l'image")
    return presigned.s3_key
}

export default function ComplaintPage({ params }: { params: React.Usable<{ salesPointId: string; }> }) {
    const { salesPointId: salesPointSlug } = React.use(params);

    const [salesPoint, setSalesPoint] = useState<SalesPointInfo | null>(null)
    const [loadingInfo, setLoadingInfo] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const [clientCode, setClientCode] = useState("")
    const [message, setMessage] = useState("")
    const [images, setImages] = useState<(File | null)[]>([null, null])
    const [previews, setPreviews] = useState<(string | null)[]>([null, null])
    const [uploading, setUploading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const inputRef0 = useRef<HTMLInputElement>(null)
    const inputRef1 = useRef<HTMLInputElement>(null)
    const inputRefs = [inputRef0, inputRef1]

    useEffect(() => {
        publicInstance
            .get(`/complaints/sales-point/${salesPointSlug}/`)
            .then(res => { setSalesPoint(res.data); setLoadingInfo(false) })
            .catch(err => {
                if (err.response?.status === 404) setNotFound(true)
                setLoadingInfo(false)
            })
    }, [salesPointSlug])

    const handleImageChange = (idx: number, file: File | null) => {
        if (!file) return
        const newImages = [...images]; newImages[idx] = file; setImages(newImages)
        const reader = new FileReader()
        reader.onload = e => {
            const newPreviews = [...previews]
            newPreviews[idx] = e.target?.result as string
            setPreviews(newPreviews)
        }
        reader.readAsDataURL(file)
    }

    const removeImage = (idx: number) => {
        const newImages = [...images]; newImages[idx] = null; setImages(newImages)
        const newPreviews = [...previews]; newPreviews[idx] = null; setPreviews(newPreviews)
        if (inputRefs[idx].current) inputRefs[idx].current!.value = ""
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!clientCode.trim() || !message.trim()) {
            setError("Veuillez remplir votre code client et votre message.")
            return
        }

        setUploading(true)
        try {
            let image_1_key: string | null = null
            let image_2_key: string | null = null

            if (images[0]) {
                const p = await getPresignedUrl(images[0].name, images[0].type)
                image_1_key = await uploadToS3(images[0], p)
            }
            if (images[1]) {
                const p = await getPresignedUrl(images[1].name, images[1].type)
                image_2_key = await uploadToS3(images[1], p)
            }

            await publicInstance.post(`/complaints/submit/${salesPointSlug}/`, {
                client_code: clientCode,
                message,
                image_1_key,
                image_2_key,
            })

            setSuccess(true)
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || "Une erreur est survenue.")
        } finally {
            setUploading(false)
        }
    }

    // ── États ──────────────────────────────────────────────────────────────

    if (loadingInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin size-8 text-gray-400" />
            </div>
        )
    }

    if (notFound) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800">Point de vente introuvable</p>
                    <p className="text-gray-500 mt-2 text-sm">Le QR code scanné n'est plus valide.</p>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <CardBodyContent className="p-10 max-w-md w-full text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full p-4">
                            <CheckCircle className="size-10 text-green-500" />
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Plainte envoyée !</h2>
                    <p className="text-muted-foreground text-sm">
                        Votre message a bien été reçu par{" "}
                        <span className="font-medium">{salesPoint?.name}</span>.
                        Notre équipe vous contactera dans les meilleurs délais.
                    </p>
                </CardBodyContent>
            </div>
        )
    }

    // ── Formulaire ─────────────────────────────────────────────────────────

    return (
        <div className="min-h-screen bg-background flex items-start justify-center p-4 pt-10">
            <div className="bg-card rounded-2xl shadow-lg border border-border w-full max-w-lg p-8">

                {/* En-tête */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold">
                        {salesPoint?.name ?? "Point de vente"}
                    </h1>
                    {salesPoint?.address && (
                        <p className="text-sm text-muted-foreground mt-1">{salesPoint.address}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-4">
                        Une expérience à signaler ? Décrivez-nous votre problème ci-dessous.
                    </p>
                </div>


                {/* Erreur */}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-4 py-3 text-sm text-red-600">
                            <AlertCircle className="size-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Code client */}
                    <div>
                        <Label className="block text-sm font-medium mb-1">
                            Code client <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            value={clientCode}
                            onChange={e => setClientCode(e.target.value.toUpperCase())}
                            placeholder="Ex : AB12XY"
                            className=""
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Votre code client figure sur votre facture.
                        </p>
                    </div>

                    {/* Message */}
                    <div>
                        <Label className="block text-sm font-medium mb-1">
                            Votre message <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={5}
                            placeholder="Décrivez votre problème en détail..."
                            className={
                                `w-full px-4 py-3 text-sm rounded-xl bg-neutral-500/5 dark:bg-white/5 border border-zinc-500/10 text-black dark:text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent
                                    transition-all duration-200
                                    [:-webkit-autofill]:shadow-[0_0_0px_1000px_rgba(255,255,255,0.05)_inset]
                                    dark:[:-webkit-autofill]:shadow-[0_0_0px_1000px_rgba(255,255,255,0.05)_inset]
                                    [:-webkit-autofill]:text-black
                                    dark:[:-webkit-autofill]:text-white
                                `
                            }
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <Label className="block text-sm font-medium mb-2">
                            Photos (facultatif, max 2)
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            {[0, 1].map(idx => (
                                <div key={idx}>
                                    {previews[idx] ? (
                                        <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video">
                                            <img src={previews[idx]!} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition"
                                            >
                                                <X className="size-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => inputRefs[idx].current?.click()}
                                            className="w-full aspect-video rounded-xl border-2 border-dashed border-muted-foreground flex flex-col items-center text-muted-foreground justify-center gap-1 hover:border-primary hover:text-primary transition cursor-pointer"
                                        >
                                            <Upload className="size-5" />
                                            <span className="text-xs">Ajouter photo</span>
                                        </button>
                                    )}
                                    <input
                                        ref={inputRefs[idx]}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={e => handleImageChange(idx, e.target.files?.[0] ?? null)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* Bouton */}
                    <Button
                        type="submit"
                        disabled={uploading}
                        className="w-full gradient-primary"
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin" /> Envoi en cours...
                            </span>
                        ) : (
                            "Envoyer ma plainte"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}