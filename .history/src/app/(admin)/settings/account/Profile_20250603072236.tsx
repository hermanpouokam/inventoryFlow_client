import { instance } from '@/components/fetch';
import React from 'react'

export default function Profile() {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!image) {
            setMessage("Aucune image sélectionnée.");
            return;
        }

        const formData = new FormData();
        formData.append('image', image);

        try {
            const response = await instance.post(
                'http://localhost:8000/upload-profile-image/',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer VOTRE_TOKEN_JWT`, // Remplacez par le vrai token
                    },
                }
            );

            setMessage("Image uploadée avec succès !");
            console.log("Image URL:", response.data.image_url);
        } catch (error: any) {
            setMessage("Échec de l'upload : " + error.response?.data?.error || error.message);
        }
    };
    return (
        <div>Profile</div>
    )
}
