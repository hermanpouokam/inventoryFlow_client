import React from "react";
import PhoneVersion from "@/components/phoneVersion";

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

export default function page() {
  return (
    <div className="place-items-center">
      <header className="place-items-center w-full backdrop-blur-lg  sticky border-b border-b-gray-300 bg-white/30 inset-x-0 top-0 z-50">
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
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <a href="#" className="text-sm/6 font-semibold text-gray-900">
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
          <PhoneVersion />
        </nav>
      </header>
      <section id="hero" className="w-full place-items-center overflow-hidden">
        <div className="relative max-w-[1680px] w-full isolate px-6 pt-0 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:1/2"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] lg:left-1/2 top-1/2 -translate-x-1/2 rotate-[30deg] lg:-translate-x-1/2 lg:translate-y-0 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            />
          </div>
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
            {/* <div className="hidden sm:mb-8 sm:flex sm:justify-center">
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-gray-600 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                Announcing our next round of funding.{" "}
                <a href="#" className="font-semibold text-indigo-600">
                  <span aria-hidden="true" className="absolute inset-0" />
                  Read more <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </div> */}
            <div className="text-center place-items-center space-y-12">
              <h1 className="text-5xl font-extrabold tracking-tight text-balance bg-gradient-to-b mb-5 from-gray-500 to-gray-950 inline-block text-transparent bg-clip-text sm:text-7xl h-auto">
                Simplifiez votre gestion d&apos;entreprise{" "}
              </h1>
              <p className="mt-8 text-lg font-medium text-pretty max-w-4xl text-gray-500 sm:text-xl/8">
                Optimisez votre entreprise avec une solution complète pour
                suivre vos finances, gérer votre stock et vos équipes en toute
                simplicité.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="#"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </a>
                <a href="#" className="text-sm/6 font-semibold text-gray-900">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[calc(100%-13rem)] z-50 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
