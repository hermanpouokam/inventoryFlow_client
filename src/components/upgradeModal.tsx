import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Method = "card" | "mtn" | "orange";

interface Props {
    onClose: () => void
    onConfirm?: (data: { method: Method; country?: string; phone?: string }) => void;
}


export function PaymentMethodModal({ onConfirm, onClose }: Props) {

    return (
        <Card>
            <CardHeader className="pt-6 pb-4 border-b border-border">
                <CardTitle className="text-lg">Changer le mode de paiement</CardTitle>
                <CardDescription>
                    Sélectionnez votre méthode préférée pour les prochaines transactions.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 gap-0 overflow-hidden">

            </CardContent>
        </Card>
    );
}
