import { NextResponse } from "next/server";
import API_URL from "@/config"
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const subject = formData.get("subject") as string;
        const message = formData.get("message") as string;

        if (!name || !email || !subject || !message) {
            return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
        }

        const response = await fetch(`${API_URL}/contact/create/`, {
            method: "POST",
            body: JSON.stringify({ name, email, subject, message }),
            headers: { "Content-Type": "application/json" },
        })

        if (response.ok) {
            console.log("Message reçu :", { name, email, subject, message });
            return NextResponse.redirect(new URL("/?success=1", req.url));
        } else {
            console.log(response)
            return NextResponse.redirect(new URL("/?success=0", req.url));
        }
    } catch (error) {
        return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
    }
}
