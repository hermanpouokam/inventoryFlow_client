import React from "react";
import PhoneVersion from "@/components/phoneVersion";
import {
  CheckIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import API_URL from "@/config";

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
  {
    title: "A propos de nous",
    link: "#about-us",
  },
  {
    title: "Nous contacter",
    link: "#contact",
  },
];

const tiers = [
  {
    name: "Hobby",
    id: "starter",
    href: "#",
    priceMonthly: "$29",
    description:
      "The perfect plan if you're just getting started with our product.",
    features: [
      "25 products",
      "Up to 10,000 subscribers",
      "Advanced analytics",
      "24-hour support response time",
    ],
    featured: false,
  },
  {
    name: "Enterprise",
    id: "business",
    href: "#",
    priceMonthly: "$99",
    description: "Dedicated support and infrastructure for your company.",
    features: [
      "Unlimited products",
      "Unlimited subscribers",
      "Advanced analytics",
      "Dedicated support representative",
      "Marketing automations",
      "Custom integrations",
    ],
    featured: true,
  },
  {
    name: "Hobby",
    id: "enterprise",
    href: "#",
    priceMonthly: "$29",
    description:
      "The perfect plan if you're just getting started with our product.",
    features: [
      "25 products",
      "Up to 10,000 subscribers",
      "Advanced analytics",
      "24-hour support response time",
    ],
    featured: false,
  },
];

export default async function page() {
  const res = await fetch(`${API_URL}/plans/`, {
    cache: "no-store",
  });
  const plans = await res.json();

  console.log(plans);

  return (
    <div className="place-items-center bg-white overflow-x-hidden min-h-screen scrollbar space-y-10">
      <header className="place-items-center w-full backdrop-blur-md fixed border-b border-b-gray-300 bg-white/30 inset-x-0 top-0 z-50">
        <nav
          aria-label="Global"
          className="flex items-center justify-between p-4 lg:px-8 w-full max-w-[1680px]"
        >
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
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
              fillOpacity="0.3"
            />
            <defs>
              <linearGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                <stop stopColor="#ff80b5" />
                <stop offset={1} stopColor="#9089fc " />
              </linearGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-[1680px] py-32 sm:py-48 lg:py-40">
            <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Profiter d&apos;un essai gratuit pour notre lancement.{" "}
                <a href="#" className="font-semibold text-indigo-600">
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
          Qu&apos;est-ce que nous faison ?{" "}
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
      <section className="relative isolate overflow-hidden bg-white px-6 py-12 sm:py-16 place-items-center lg:px-8 w-full">
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
      <section className="relative isolate bg-white px-6 lg:px-8 w-full max-w-[1680px]">
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
          <h2 className="text-xl font-extrabold text-center tracking-tighter text-balance bg-gradient-to-b from-gray-500 to-gray-950 inline-block text-transparent bg-clip-text sm:text-3xl">
            Choisissez un plan.
            <span className="text-lg font-normal tracking-tighter text-balance bg-gradient-to-b mb-5 from-gray-600 to-gray-700 inline-block text-transparent bg-clip-text sm:text-xl">
              {" "}
              Choisissez un forfait abordable doté des meilleures
              fonctionnalités pour engager votre entreprise.
            </span>
          </h2>
        </div>
        <div className="mx-auto mt-16 grid grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-7xl lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={cn(
                tier.featured
                  ? "relative bg-gray-900 shadow-2xl"
                  : "bg-white/60 sm:mx-8 lg:mx-0",
                tier.featured
                  ? ""
                  : tierIdx === 0
                  ? "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                  : "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
                "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
              )}
            >
              <h3
                id={tier.id}
                className={cn(
                  tier.featured ? "text-indigo-400" : "text-indigo-600",
                  "text-base/7 font-semibold"
                )}
              >
                {tier.name}
              </h3>
              <p className="mt-4 flex items-baseline gap-x-2">
                <span
                  className={cn(
                    tier.featured ? "text-white" : "text-gray-900",
                    "text-5xl font-semibold tracking-tight"
                  )}
                >
                  {tier.priceMonthly}
                </span>
                <span
                  className={cn(
                    tier.featured ? "text-gray-400" : "text-gray-500",
                    "text-base"
                  )}
                >
                  /month
                </span>
              </p>
              <p
                className={cn(
                  tier.featured ? "text-gray-300" : "text-gray-600",
                  "mt-6 text-base/7"
                )}
              >
                {tier.description}
              </p>
              <ul
                role="list"
                className={cn(
                  tier.featured ? "text-gray-300" : "text-gray-600",
                  "mt-8 space-y-3 text-sm/6 sm:mt-10"
                )}
              >
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon
                      aria-hidden="true"
                      className={cn(
                        tier.featured ? "text-indigo-400" : "text-indigo-600",
                        "h-6 w-5 flex-none"
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>
              <a
                href={tier.href}
                aria-describedby={tier.id}
                className={cn(
                  tier.featured
                    ? "bg-indigo-500 text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-indigo-500"
                    : "text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:ring-indigo-300 focus-visible:outline-indigo-600",
                  "mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10"
                )}
              >
                Get started today
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
