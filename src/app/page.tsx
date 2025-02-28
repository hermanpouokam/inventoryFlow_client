import { cn } from "@/lib/utils";
import {
  CheckIcon,
  DollarSignIcon,
  Package,
  Receipt,
  ReceiptIcon,
  ReceiptTextIcon,
  UserRound,
  UserRoundSearch,
  UserSquare2Icon,
  UsersRound,
} from "lucide-react";
import moment from "moment";
import Image from "next/image";

export default function Home() {
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
  const services = [
    {
      title: "Comptabilité Simplifiée",
      description:
        "Optimisez la gestion financière avec une comptabilité automatisée et intuitive.",
      icon: DollarSignIcon,
    },
    {
      title: "Gestion des Stocks",
      description:
        "Suivez vos stocks en temps réel et évitez les ruptures grâce à des alertes intelligentes.",
      icon: Package,
    },
    {
      title: "Facturation",
      description:
        "Générez et envoyez des factures professionnelles en un clic.",
      icon: Receipt,
    },
    {
      title: "Gestion des Clients",
      description:
        "Améliorez votre relation client avec un suivi détaillé et personnalisé.",
      icon: UserSquare2Icon,
    },
    {
      title: "Suivi des Commandes",
      description:
        "Gardez un œil sur l'état des commandes et optimisez les délais de livraison.",
      icon: ReceiptTextIcon,
    },
    {
      title: "Gestion des Employés",
      description:
        "Attribuez des rôles et surveillez la performance de votre équipe.",
      icon: UsersRound,
    },
  ];
  const tiers = [
    {
      name: "Hobby",
      id: "tier-hobby",
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
      id: "tier-enterprise",
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
      id: "tier-hobby",
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

  return (
    <div className="bg-gray-900 min-w-full min-h-screen place-items-center">
      <header className="max-w-[1680px] justify-between shadow-2xl z-50 w-full backdrop-blur max-h-[60px] px-5 py-5 rounded-lg top-2 bg-gray-950/30 py sticky flex gap-5 items-center">
        <a href="">
          <Image
            src={"/logo.png"}
            alt="logo"
            className=""
            width={150}
            height={20}
          />
        </a>
        <nav className="lg:block hidden">
          <ul className="flex justify-between gap-5 items-center">
            {links.map((link) => (
              <li
                key={link.link}
                className="font-bold text-base hover:text-indigo-500 tracking-tight text-balance text-gray-200 sm:text-sm"
              >
                <a href={link.link}>{link.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex justify-between items-center gap-3">
          <a
            href=""
            className="font-bold text-base hover:text-indigo-600 tracking-tight text-balance text-indigo-500 sm:text-sm"
          >
            S'inscrire
          </a>
          <a href="" className="bg-indigo-600 rounded-lg py-2 px-3 text-white">
            Se connecter
          </a>
        </div>
      </header>
      <section id="hero" className="w-full max-w-[1680px]">
        <div className="mx-auto py-18 sm:px-6 sm:py-10 lg:px-0 overflow-hidden">
          <div className="relative isolate px-6 pt-16 sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-16 lg:px-14 lg:pt-0">
            <svg
              viewBox="0 0 1024 1024"
              className="absolute top-1/2 left-1/2 -z-10 size-[40rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/3 lg:ml-0 lg:-translate-x-3/4 lg:-translate-y-2/3"
              aria-hidden="true"
            >
              <circle
                cx="512"
                cy="512"
                r="512"
                fill="url(#759c1415-0410-454c-8f7c-9a820de03641)"
                fill-opacity="0.7"
              />
              <defs>
                <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                  <stop stop-color="#7775D6" />
                  <stop offset="1" stop-color="#E935C1" />
                </radialGradient>
              </defs>
            </svg>
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:flex-auto lg:py-28 lg:text-left">
              <h2 className="text-3xl font-semibold tracking-normal leading-[30px] text-balance text-white sm:text-4xl">
                Simplifiez la gestion de votre entreprise avec nous et
                concentrez vous sur l&apos;essentiel.
              </h2>
              <p className="mt-6 text-lg/8 text-pretty text-gray-300">
                Optimisez la gestion de votre entreprise avec une solution
                tout-en-un : suivez votre comptabilité, gérez votre stock, vos
                employés et vos clients en toute simplicité et efficacité.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <a
                  href="#"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Commencer un essai de 30 jours
                </a>
                <a
                  href="#"
                  className="text-sm/6 font-semibold group text-white"
                >
                  En savoir plus{" "}
                  <span
                    aria-hidden="true"
                    className="group-hover:translate-x-5"
                  >
                    →
                  </span>
                </a>
              </div>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start"></div>
            </div>
            <div className="relative mt-16 h-80 lg:mt-8">
              <img
                className="absolute top-0 left-0 w-[50rem] max-h-[40rem] max-w-none rounded-md bg-white/5"
                src="/hero.gif"
                alt="App screenshot"
                width="1400"
                height="500"
              />
            </div>
          </div>
        </div>
      </section>
      <section id="services" className="w-full mt-3 lg:mt-10">
        <div className="max-w-[1680px] mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-50 sm:text-4xl">
            Nos Services
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Découvrez comment notre solution peut révolutionner la gestion de
            votre entreprise.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-gray-800 p-6 rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-transform transform hover:-translate-y-2"
                >
                  <div className="text-5xl place-items-center text-indigo-500">
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-50 mt-4">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section id="testimony" className=" py-16 px-6">
        <div className="max-w-[1680px] mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ce que nos clients disent
          </h2>
          <p className="text-muted-foreground text-lg mb-12">
            Découvrez pourquoi ils nous font confiance.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((el, i) => (
              <div
                key={i}
                className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700"
              >
                <p className="text-gray-300 text-lg italic">
                  "Un système ultra efficace qui a simplifié toute notre gestion
                  !"
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <img
                    src="https://i.pravatar.cc/80?img=1"
                    alt="Client"
                    className="w-12 h-12 rounded-full border border-gray-600"
                  />
                  <div>
                    <h3 className="text-white font-semibold">Jean Dupont</h3>
                    <p className="text-gray-400 text-sm">CEO, TechCorp</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="pricing">
        <div className="relative isolate  px-6 py-24 sm:py-25 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-3 z-10 transform-gpu overflow-hidden px-36 blur-3xl"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="mx-auto aspect-1155/678 w-[72.1875rem] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            />
          </div>
          <div className="mx-auto max-w-[1680px] text-center">
            <h2 className="text-4xl font-semibold text-indigo-600">Pricing</h2>
            <p className="mt-2 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-6xl">
              Choose the right plan for you
            </p>
          </div>
          <p className="mx-auto max-w-4xl text-center text-lg font-medium text-pretty text-muted-foreground sm:text-xl/8">
            Choose an affordable plan that’s packed with the best features for
            engaging your audience, creating customer loyalty, and driving
            sales.
          </p>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-[1680px] lg:grid-cols-3">
            {tiers.map((tier, tierIdx) => (
              <div
                key={tier.id}
                className={cn(
                  tier.featured
                    ? "relative bg-gray-950 shadow-2xl"
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
        </div>
      </section>
      <section id="about-us">
        <div className="mx-auto max-w-[1680px] px-6 lg:px-8">
          <h2 className="text-center text-4xl font-semibold text-indigo-600">
            Deploy faster
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-base font-semibold tracking-tight text-balance text-muted-foreground ">
            Everything you need to deploy your app
          </p>
          <div className="mt-10 grid gap-4 sm:mt-16 lg:grid-cols-3 lg:grid-rows-2">
            <div className="relative lg:row-span-2">
              <div className="absolute inset-px rounded-lg bg-gray-800 lg:rounded-l-[2rem]"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] lg:rounded-l-[calc(2rem+1px)]">
                <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-50 max-lg:text-center">
                    Mobile friendly
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                    Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure
                    qui lorem cupidatat commodo.
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
              <div className="absolute inset-px rounded-lg bg-gray-800 max-lg:rounded-t-[2rem]"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-t-[calc(2rem+1px)]">
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-50 max-lg:text-center">
                    Performance
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit
                    maiores impedit.
                  </p>
                </div>
                <div className="flex flex-1 items-center justify-center px-8 max-lg:pt-10 max-lg:pb-12 sm:px-10 lg:pb-2">
                  <img
                    className="w-full max-lg:max-w-xs"
                    src="https://tailwindui.com/plus-assets/img/component-images/bento-03-performance.png"
                    alt=""
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 max-lg:rounded-t-[2rem]"></div>
            </div>
            <div className="relative max-lg:row-start-3 lg:col-start-2 lg:row-start-2">
              <div className="absolute inset-px rounded-lg bg-gray-800"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)]">
                <div className="px-8 pt-8 sm:px-10 sm:pt-10">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-50 max-lg:text-center">
                    Security
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                    Morbi viverra dui mi arcu sed. Tellus semper adipiscing
                    suspendisse semper morbi.
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
              <div className="absolute inset-px rounded-lg bg-gray-800 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(var(--radius-lg)+1px)] max-lg:rounded-b-[calc(2rem+1px)] lg:rounded-r-[calc(2rem+1px)]">
                <div className="px-8 pt-8 pb-3 sm:px-10 sm:pt-10 sm:pb-0">
                  <p className="mt-2 text-lg font-medium tracking-tight text-gray-50 max-lg:text-center">
                    Powerful APIs
                  </p>
                  <p className="mt-2 max-w-lg text-sm/6 text-muted-foreground max-lg:text-center">
                    Sit quis amet rutrum tellus ullamcorper ultricies libero
                    dolor eget sem sodales gravida.
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
                    <div className="px-6 pt-6 pb-14">
                      {/* Your code example */}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-px rounded-lg ring-1 shadow-sm ring-black/5 max-lg:rounded-b-[2rem] lg:rounded-r-[2rem]"></div>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-gray-800 w-full mt-10 text-gray-300 py-10">
        <div className="max-w-[1680px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h2 className=" text-2xl font-bold text-indigo-600">
                InventoryFlow
              </h2>
              <p className="text-gray-400 mt-3">
                Simplifiez votre gestion avec notre solution intuitive et
                puissante.
              </p>
            </div>

            <div>
              <h3 className="text-white text-xl font-semibold mb-4">
                Liens rapides
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Accueil
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Services
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-xl font-semibold mb-4">
                Suivez-nous
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  <i className="fab fa-facebook text-2xl"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  <i className="fab fa-twitter text-2xl"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  <i className="fab fa-linkedin text-2xl"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-400 transition"
                >
                  <i className="fab fa-instagram text-2xl"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center text-gray-500 text-sm">
            © {moment().format("YYYY")} InventoryFlow. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}
