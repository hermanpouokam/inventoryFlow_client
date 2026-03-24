import React from "react";
import PhoneVersion from "@/components/phoneVersion";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import API_URL from "@/config";
import { formatteCurrency } from "./(admin)/stock/functions";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const links = [
  {
    title: "Nos services",
    link: "#services",
  },
  {
    title: "Temoignages",
    link: "#testimony",
  },
  {
    title: "Pricing",
    link: "#pricing",
  },
  // {
  //   title: "A propos de nous",
  //   link: "#about-us",
  // },
  {
    title: "Nous contacter",
    link: "#contact",
  },
];

export const tiers = [
  {
    id: "gratuit",
    description:
      "Le plan qui vous permettra de faire un essai sur ce que nous vous proposons.",
    features: ["1 point de vente", "1 utilisateur", "Articles illimités"],
    featured: false,
  },
  {
    id: "standard",
    description:
      "Le plan parfait si vous êtes une petite entreprise avec un petit personnel.",
    features: [
      "1 point de vente",
      "3 utilisateurs",
      "Articles illimités",
      "Assistance personalisée",
    ],
    featured: false,
  },
  {
    id: "pro",
    description:
      "Le plan dont vous a besoin pour gérer plusieurs points de vente de votre entreprise.",
    features: [
      "3 points de vente",
      "Utilisateurs illimités",
      "Articles illimités",
      "Assistance personalisée",
      "Visualisation de données",
      "Stock prévisionnel",
    ],
    featured: true,
  },
  {
    id: "entreprise",
    description:
      "Le plan parfait pour les grandes entreprise qui vous donne accès à toutes nos fonctionnalités.",
    features: [
      "Points de vente illimités",
      "Analyse des ventes par l'IA",
      "Prévision de maché",
      "Caracterisques du plan pro",
    ],
    featured: false,
  },
];

export default async function page({ searchParams }: Props) {
  const res = await fetch(`${API_URL}/plans/`, {
    cache: "no-store",
  });
  const plans: Plan[] = await res.json();
  const success = searchParams.success;

  if (success == "1") {
    // alert("Message envoyé avec succès");
  }

  return (
    <div className="place-items-center bg-white overflow-x-hidden min-h-screen scrollbar space-y-10">
      <header className="place-items-center w-full backdrop-blur-md fixed border-b border-b-gray-300 bg-white/30 inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-4 lg:px-8 w-full max-w-[1680px]"
        >
          <div className="flex lg:flex-1">
            <a href="" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img alt="" src="/logo.png" className="h-4 w-auto" />
            </a>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {links.map((item) => (
              <a
                key={item.title}
                href={item.link}
                className="text-sm/6 font-normal text-gray-700 hover:text-gray-950"
              >
                {item.title}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-5 lg:justify-end">
            <a href="/signup" className="text-sm/6 font-semibold text-gray-900">
              S'inscrire
            </a>
            <a href="/signin" className="text-sm/6 font-semibold text-gray-900">
              Se connecter <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <PhoneVersion />
        </nav>
      </header>
      <section id="hero" className="w-full place-items-center ">
        <div className="relative max-w-[1680px] w-full isolate px-6 pt-0 lg:px-8">
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-2 left-2/3 -z-10 size-[60rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
              fillOpacity="0.3"
            />
            <defs>
              <linearGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                <stop stopColor="#ff80b5" />
                <stop offset={1} stopColor="#9089fc " />
              </linearGradient>
            </defs>
          </svg>
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute bottom-2 right-2/3 -z-10 size-[60rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:right-1 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          >
            <circle
              r={512}
              cx={512}
              cy={512}
              fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
              fillOpacity="0.5"
            />
            <defs>
              <linearGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                <stop stopColor="#0284c7" />
                <stop offset={1} stopColor="#2563eb" />
              </linearGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-[1680px] py-32 sm:py-48 lg:py-40">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Profiter d&apos;un essai gratuit pour notre lancement.{" "}
                <a href="signup" className="font-semibold text-indigo-600">
                  <span aria-hidden="true" className="absolute inset-0" />
                  commencer <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div>
            <div className="text-center place-items-center space-y-12">
              <h1 className="text-5xl font-extrabold tracking-tight text-balance bg-gradient-to-b mb-5 from-indigo-400 via-gray-700 to-gray-950 inline-block text-transparent bg-clip-text sm:text-7xl min-h-24">
                Simplifiez votre gestion d&apos;entreprise{" "}
              </h1>
              <p className="mt-8 text-base font-normal text-pretty max-w-4xl text-gray-600 sm:text-xl/8">
                Optimisez votre entreprise avec{" "}
                <span className="font-bold text-gray-900">
                  une solution complète{" "}
                </span>{" "}
                pour suivre vos finances, gérer votre stock et vos équipes en
                toute simplicité et gardez un œil sur l&apos;état des commandes
                et optimisez les délais de livraison.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Essai gratuit de 30 jours
                </a>
                <a
                  href="#"
                  className="text-sm/6 font-semibold group text-gray-900"
                >
                  En savoir plus{" "}
                  <span
                    aria-hidden="true"
                    className="group-hover:translate-x-4"
                  >
                    →
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="services"
        className="w-full max-w-[1680px] place-items-center px-5"
      >
        <h2 className="text-xl font-extrabold text-center tracking-tighter text-balance bg-gradient-to-b mb-5 from-gray-500 to-gray-950 inline-block text-transparent bg-clip-text sm:text-3xl">
          Qu&apos;est-ce que nous faisons ?{" "}
          <span className="text-lg font-normal tracking-tighter text-balance bg-gradient-to-b mb-5 from-gray-600 to-gray-700 inline-block text-transparent bg-clip-text sm:text-xl">
            Découvrez comment nous pouvons améliorer la gestion de votre magasin
          </span>
        </h2>

        <div className="grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <div className="relative lg:row-span-2 ">
            <div className="absolute inset-px rounded-lg  bg-white lg:rounded-l-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Facturation
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Générez et envoyez des factures professionnelles en un clic.
                  Gardez un œil sur l'état des commandes et optimisez les délais
                  de livraison.
                </p>
              </div>
              <div className="@container relative min-h-[30rem] w-full grow max-lg:mx-auto max-lg:max-w-sm">
                <div className="absolute inset-x-10 top-10 bottom-0 overflow-hidden rounded-t-[12cqw] border-x-[3cqw] border-t-[3cqw] border-gray-700 bg-gray-900 shadow-2xl">
                  <img
                    className="size-full object-cover object-top"
                    src="https://tailwindui.com/plus-assets/img/component-images/bento-03-mobile-friendly.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 lg:rounded-l-[2rem]"></div>
          </div>
          <div className="relative max-lg:row-start-1">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-t-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
              <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10">
                <img
                  className="w-full max-lg:max-w-xs"
                  src="https://tailwindui.com/plus-assets/img/component-images/bento-03-performance.png"
                  alt=""
                />
              </div>
              <div className="px-8 pt-5 sm:px-10 sm:pt-5 sm:pb-4">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Comptabilité simplifiée
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Optimisez la gestion financière avec une comptabilité
                  automatisée et intuitive.
                </p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 max-lg:rounded-t-[2rem]"></div>
          </div>
          <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
            <div className="absolute inset-px rounded-lg bg-white"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
              <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Gestion des Stocks
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Suivez vos stocks en temps réel et évitez les ruptures grâce à
                  des alertes intelligentes..
                </p>
              </div>
              <div className="@container flex flex-1 items-center max-lg:py-6 lg:pb-2">
                <img
                  className="h-[min(152px,40cqw)] object-cover"
                  src="https://tailwindui.com/plus-assets/img/component-images/bento-03-security.png"
                  alt=""
                />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5"></div>
          </div>
          <div className="relative lg:row-span-2">
            <div className="absolute inset-px rounded-lg bg-white max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
              <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                <p className="mt-2 text-lg font-medium tracking-tight text-gray-950 max-lg:text-center">
                  Gestions des employés
                </p>
                <p className="mt-2 max-w-lg text-sm/6 text-gray-600 max-lg:text-center">
                  Attribuez des rôles et surveillez la performance de votre
                  équipe .
                </p>
              </div>
              <div className="relative min-h-[30rem] w-full grow">
                <div className="absolute top-10 right-0 bottom-0 left-10 overflow-hidden rounded-tl-xl bg-gray-900 shadow-2xl">
                  <div className="flex bg-gray-800/40 ring-1 ring-white/5">
                    <div className="-mb-px flex text-sm/6 font-medium text-gray-400">
                      <div className="border-r border-b border-r-white/10 border-b-white/20 bg-white/5 px-4 py-2 text-white">
                        NotificationSetting.jsx
                      </div>
                      <div className="border-r border-gray-600/10 px-4 py-2">
                        App.jsx
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pt-6 pb-14"></div>
                </div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
          </div>
        </div>
      </section>
      <section
        id="testimony"
        className="relative isolate overflow-hidden bg-white px-6 py-12 sm:py-16 place-items-center lg:px-8 w-full"
      >
        <h2 className="text-xl font-extrabold text-center tracking-tighter text-balance bg-gradient-to-b from-gray-500 to-gray-950 inline-block text-transparent bg-clip-text sm:text-3xl">
          Ce que nos clients pensent{" "}
          <span className="text-lg font-normal tracking-tighter text-balance bg-gradient-to-b mb-5 from-gray-600 to-gray-700 inline-block text-transparent bg-clip-text sm:text-xl"></span>
        </h2>
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,var(--color-indigo-100),white)] opacity-20" />
        <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white ring-1 shadow-xl shadow-indigo-600/10 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          {/* <img
            alt=""
            src="https://tailwindui.com/plus-assets/img/logos/workcation-logo-indigo-600.svg"
            className="mx-auto h-12"
          /> */}
          <figure className="mt-10">
            <blockquote className="text-center text-xl/8 font-semibold text-gray-900 sm:text-2xl/9">
              <p>
                “Lorem ipsum dolor sit amet consectetur adipisicing elit. Nemo
                expedita voluptas culpa sapiente alias molestiae. Numquam
                corrupti in laborum sed rerum et corporis.”
              </p>
            </blockquote>
            <figcaption className="mt-10">
              <img
                alt=""
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                className="mx-auto size-10 rounded-full"
              />
              <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                <div className="font-semibold text-gray-900">Judith Black</div>
                <svg
                  width={3}
                  height={3}
                  viewBox="0 0 2 2"
                  aria-hidden="true"
                  className="fill-gray-900"
                >
                  <circle r={1} cx={1} cy={1} />
                </svg>
                <div className="text-gray-600">CEO of Workcation</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>
      <section
        id="pricing"
        className="relative isolate bg-white px-6 lg:px-8 w-full max-w-[1680px]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
            className="mx-auto aspect-1155/678 w-[72.1875rem] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-xl font-extrabold text-center tracking-tighter text-balance bg-gradient-to-b from-gray-600 to-gray-950 inline-block text-transparent bg-clip-text sm:text-3xl">
            Choisissez un plan.
            <span className="text-lg font-normal tracking-tighter text-balance bg-gradient-to-b mb-5 from-gray-600 to-gray-700 inline-block text-transparent bg-clip-text sm:text-xl">
              {" "}
              Choisissez un forfait abordable doté des meilleures
              fonctionnalités pour engager votre entreprise.
            </span>
          </h2>
        </div>
        <div className="mx-auto mt-16 grid grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-7xl lg:grid-cols-3">
          {plans
            .filter((plan) => plan.id !== 1)
            .map((plan, index) => {
              const tier = tiers.find(
                (tier) => tier.id.toLowerCase() === plan.name.toLowerCase()
              );
              return (
                <div
                  key={plan.id}
                  className={cn(
                    tier?.featured
                      ? "relative bg-gray-900 shadow-2xl"
                      : "bg-white/60 sm:mx-8 lg:mx-0",
                    tier?.featured
                      ? ""
                      : index === 0
                        ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                        : index === 2
                          ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tl-none lg:rounded-br-3xl"
                          : "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
                    "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
                  )}
                >
                  <h3
                    id={plan?.id.toString()}
                    className={cn(
                      tier?.featured ? "text-indigo-400" : "text-indigo-600",
                      "text-base/7 font-semibold first-letter:uppercase"
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p className="mt-4 flex items-baseline gap-x-2">
                    <span
                      className={cn(
                        tier?.featured ? "text-white" : "text-gray-900",
                        "text-5xl font-semibold tracking-tight"
                      )}
                    >
                      {formatteCurrency(plan.price)}
                    </span>
                    <span
                      className={cn(
                        tier?.featured ? "text-gray-400" : "text-gray-500",
                        "text-[12px] sm:text-base"
                      )}
                    >
                      /mois
                    </span>
                  </p>
                  <p
                    className={cn(
                      tier?.featured ? "text-gray-300" : "text-gray-600",
                      "mt-6 text-base/7"
                    )}
                  >
                    {tier?.description}
                  </p>
                  <ul
                    role="list"
                    className={cn(
                      tier?.featured ? "text-gray-300" : "text-gray-600",
                      "mt-8 space-y-3 text-sm/6 sm:mt-10"
                    )}
                  >
                    {tier?.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3 items-center">
                        <CheckCircle
                          aria-hidden="true"
                          className={cn(
                            tier.featured
                              ? "text-indigo-400"
                              : "text-indigo-600",
                            "h-4 w-4 flex-none"
                          )}
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={tier?.href}
                    aria-describedby={tier?.id}
                    className={cn(
                      tier?.featured
                        ? "bg-indigo-500 text-white shadow-xs hover:bg-indigo-400 transition focus-visible:outline-indigo-500"
                        : "text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:ring-indigo-300 focus-visible:outline-indigo-600",
                      "mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
                    )}
                  >
                    Commencer maintenant
                  </a>
                </div>
              );
            })}
        </div>
      </section>
      <section id="about-us"></section>
      <section id="contact" className="w-full place-items-center">
        <h2 className="text-xl font-extrabold text-center tracking-tighter text-balance bg-gradient-to-b from-gray-600 to-gray-950 inline-block text-transparent bg-clip-text sm:text-3xl">
          Contactez-nous.{" "}
          <span className="text-lg ml-2 font-normal tracking-tighter text-balance bg-gradient-to-b mb-5 from-gray-600 to-gray-700 inline-block text-transparent bg-clip-text sm:text-xl">
            {" "}
            Si vous avez besoin de plus d'informations contactez-nous
          </span>
        </h2>
        {success == 1 && (
          <div className="p-3 bg-green-100 border font-medium border-green-500 text-green-600 text-center rounded-md mb-4">
            Message envoyé avec succès !
          </div>
        )}
        {searchParams?.success == 0 && (
          <div className="p-3 bg-red-100 border font-medium border-red-500 text-red-600 text-center rounded-md mb-4">
            Erreur lors de l'envoi du message !
          </div>
        )}
        <div className="max-w-[1680px] mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-full hidden md:block mb-8 md:mb-0">
            <img src="/contact.jpg" alt="Contact" className="w-full opacity-80" />
          </div>
          <div className="md:w-full w-full bg-white p-8 rounded-2xl">
            <form action={"/api/contact"} method="POST">
              <div className="mb-4">
                <label className="block text-muted-foreground mb-2">Nom</label>
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={50}
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom"
                />
              </div>
              <div className="mb-4">
                <label className="block text-muted-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  maxLength={50}
                  name="email"
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre email"
                />
              </div>
              <div className="mb-4">
                <label className="block text-muted-foreground mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  maxLength={254}
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Votre nom"
                />
              </div>
              <div className="mb-4">
                <label className="block text-muted-foreground mb-2">
                  Message
                </label>
                <textarea
                  className="w-full p-3 rounded-lg bg-gray-50 border border-gray-600focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                  name="message"
                  placeholder="Votre message"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Envoyer
              </button>
            </form>
          </div>
        </div>
      </section>
      <footer className="bg-gray-100 text-white py-8 w-full place-items-center">
        <div className="max-w-[1680px] place-items-center">
          <div className=" mx-auto px-6 flex flex-col gap-5 justify-between items-center">
            <div className="mb-6 md:mb-0 text-center md:text-left">
              <img alt="" src="/logo.png" className="h-6 w-auto" />
            </div>
            <nav className="flex space-x-6">
              {links.map((link, index) => (
                <a
                  key={index}
                  href={link.link}
                  className="text-muted-foreground text-xs font-semibold sm:text-base sm:font-normal  hover:text-neutral-900 transition"
                >
                  {link.title}
                </a>
              ))}
            </nav>
            <div className="flex space-x-4 mt-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook text-2xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter text-2xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram text-2xl"></i>
              </a>
            </div>
          </div>
          <div className=" w-full py-5 md:py-12">
            {/* <div className="col-span-2 place-items-start">
              <h2 className="text-4xl font-semibold tracking-tight text-neutral-800">
                Souscrivez à notre newsletter
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Recevez les dernieres mise à jours en temps réel du site
              </p>
              <div className="mt-6 flex max-w-md gap-x-4">
                <TextField
                  size="small"
                  id="email-address"
                  name="email"
                  label="email"
                  type="email"
                  required
                  placeholder="Entrez votre email"
                  autoComplete="email"
                  className="min-w-0 flex-auto rounded-md bg-white/5 px-3.5 py-2 text-base text-white outline-2 -outline-offset-1 outline-black placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"
                />
                <button
                  type="submit"
                  className="flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Souscrire
                </button>
              </div>
            </div> */}
            <div className="text-center text-gray-500 text-sm mt-8 pt-4">
              &copy; {new Date().getFullYear()} InventoryFLow. Tous droits
              réservés.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
