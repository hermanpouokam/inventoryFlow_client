import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="w-full place-items-center  px-2 sm:px-0">
      <div className="flex-col justify-center items-center min-h-screen max-w-lg">
        <Image alt="404 image" src={"/404.svg"} width={450} height={550} />
        <h2 className="text-center text-xl sm:text-3xl uppercase font-bold">
          Cette page n'existe pas{" "}
        </h2>
        <h5 className="text-muted-foreground text-center text-md font-normal">
          {`Vous essayez d'accéder à une page qui n'existe pas. revenez en
          arrière ou retournez a la page d'accueil pour continuer votre
          navigation. `}{" "}
        </h5>
        <div className="flex items-center justify-evenly gap-2 mt-10">
          <a
            href="/dashboard"
            className="font-normal text-md w-1/2 py-1 text-center rounded bg-violet-600 text-white"
          >
            Revenir en arriere
          </a>
          <a
            href="/dashboard"
            className="font-normal text-md w-1/2 py-1 text-center rounded border border-violet-600 text-violet-600 hover:bg-violet-600 hover:text-white transition"
          >
            {`Retourner a la page d'accueil`}
          </a>
        </div>
      </div>
    </div>
  );
}
