import { instance } from '@/components/fetch';
import { Button } from '@/components/ui/button';
import { usePermission } from '@/context/PermissionContext';
import * as React from 'react'
import userProfile from "@/assets/img/user.png";
import { X } from 'lucide-react';

export default function Profile() {
    const [image, setImage] = React.useState<File | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);
    const [message, setMessage] = React.useState('');
    const { user } = usePermission()
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (!image) {
            setMessage("Aucune image sélectionnée.");
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await instance.post('/upload-profile-image/', formData);
            setMessage("Image uploadée avec succès !");
            console.log("Image URL:", response.data.image_url);
        } catch (error: any) {
            setMessage("Échec de l'upload : " + error.response?.data?.error || error.message);
        }
    };
    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };
    return (
        <div>
            <div className="space-y-2">
                <h6 className="text-base text-muted-foreground font-medium">
                    Photo de profile
                </h6>
                <div className="relative">
                    <Button className="absolute r-0" variant={'ghost'}>
                        <X className='h-4 w-4' />
                    </Button>
                    <img
                        src={preview ? preview : user?.img ?? userProfile.src}
                        alt="user profile"
                        className="w-24 h-24 rounded-full"
                    />
                </div>
                <div className="gap-3 flex flex-wrap items-center">
                    <input ref={fileInputRef}
                        type="file" accept="image/*" onChange={handleFileChange}
                        className='hidden'
                    />
                    <Button
                        onClick={handleButtonClick}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        Choisir une image
                    </Button>
                    <Button disabled={!user?.img} variant={"destructive"}>
                        {" "}
                        Supprimer la photo
                    </Button>
                </div>
            </div>
        </div>
    )
}
