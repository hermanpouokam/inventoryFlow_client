import { instance } from '@/components/fetch';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/context/PermissionContext';
import * as React from 'react'
import userProfile from "@/assets/img/user.png";
import { Check, X } from 'lucide-react';
import { CircularProgress, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { capitalizeFirstLetter } from '@/utils/utils';
import { useToast } from '@/components/ui/use-toast';

export default function Profile() {
    const [image, setImage] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState('');
    const { t: tWords } = useTranslation('words')
    const { t: tCommon } = useTranslation('common')
    const { user } = usePermission()
    const [loading, setLoading] = React.useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const { toast } = useToast()
    React.useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleUpload = async () => {
        setLoading(true)
        if (!image) {
            setMessage("Aucune image sélectionnée.");
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await instance.post('/upload-profile-image/', formData);
            console.log(response.data)
            toast({
                title: "Succès",
                description: tCommon(`${response.data.message}`),
                variant: "success",
                className: "bg-green-600 border-green-600 text-white",
                icon: <Check className="mr-2" />,
            })
            window.location.reload()
        } catch (error: any) {
            setMessage("Échec de l'upload : " + error.response?.data?.error || error.message);
            toast({
                title: "Succès",
                description: error.response?.data?.error ? tCommon(`${error.response?.data?.error}`) : tCommon(`unknown_error`),
                variant: "success",
                className: "bg-green-600 border-green-600 text-white",
                icon: <Check className="mr-2" />,
            })
        } finally {
            setLoading(false)
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <p>{message}</p>
            <div className="space-y-2">
                <h6 className="text-base text-muted-foreground font-medium">
                    Photo de profile
                </h6>
                <div className="relative w-24 h-24 rounded-full ">
                <div className="absolute inset-0 flex items-center justify-center z-0">
                    <div className="h-36 w-36 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>

                    {
                        preview ?
                            <Tooltip title={capitalizeFirstLetter(tWords('cancel'))} placement="right-start">
                                <Button onClick={() => { setPreview(null); setImage(null) }} className="absolute right-0 -top-2 w-4 h-8 rounded-full transition hover:scale-105 focus:outline-none" variant={'destructive'}>

                                    <span>X</span>
                                </Button>
                            </Tooltip>
                            : null
                    }
                    <img
                        src={preview || user?.img || userProfile.src}
                        alt="user profile"
                        className="w-24 h-24 rounded-full shadow"
                    />
                </div>
                <div className="gap-3 flex flex-wrap items-center">
                    <input ref={fileInputRef}
                        type="file" accept="image/*" onChange={handleFileChange}
                        className='hidden'
                    />
                    {
                        preview ? <Button
                            onClick={handleUpload}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                            {tCommon('btn_save_image')}
                        </Button> : <Button
                            onClick={handleButtonClick}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                        >
                            {tCommon('btn_choose_image')}
                        </Button>
                    }
                    <Button disabled={!user?.img || preview} variant={"destructive"}>
                        {" "}
                        Supprimer la photo
                    </Button>
                </div>
            </div>
        </div>
    )
}
