
import Link from "next/link";
import {
  Droplets,
  Sun,
  Sparkles,
  Leaf,
  FlaskConical,
  ArrowUpRight,
} from "lucide-react";

const ingredients = [
  {
    name: "Niacinamide",
    description: "Explore products featuring niacinamide.",
    tag: "OIL CONTROL",
    color: "#e4f2eb",
    icon: Droplets,
  },
  {
    name: "Vitamin C",
    description: "Discover vitamin C skincare essentials.",
    tag: "BRIGHTENING",
    color: "#fff0d9",
    icon: Sun,
  },
  {
    name: "Hyaluronic Acid",
    description: "Find hydration-focused skincare.",
    tag: "HYDRATION",
    color: "#e4effc",
    icon: Droplets,
  },
  {
    name: "Salicylic Acid",
    description: "Explore products containing salicylic acid.",
    tag: "ACNE CARE",
    color: "#f8e6e6",
    icon: FlaskConical,
  },
  {
    name: "Retinol",
    description: "Discover targeted evening skincare.",
    tag: "NIGHT CARE",
    color: "#eee5fa",
    icon: Sparkles,
  },
  {
    name: "Kojic Acid",
    description: "Browse products featuring kojic acid.",
    tag: "EVEN TONE",
    color: "#f0eddf",
    icon: Leaf,
  },
];

export default function Ingredients() {
  return (
    <section
      id="ingredients"
      className="bg-[#f8f6f1] px-4 py-14 sm:px-6 sm:py-20 lg:px-10"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#287a65]">
              Understand your skincare
            </p>
            <h2 className="text-3xl font-medium tracking-tight text-[#192b23] sm:text-4xl lg:text-5xl">
              Good skin starts with
              <span className="block font-semibold">
                the right ingredients.
              </span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-[#657168] sm:text-base">
              Explore ingredients and discover products for your routine.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c9d4cc] px-5 py-3 text-sm font-semibold text-[#203b30] transition hover:bg-[#203b30] hover:text-white"
          >
            Explore all products <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient) => {
            const Icon = ingredient.icon;

            return (
              <Link
                key={ingredient.name}
                href={`/products?ingredient=${encodeURIComponent(ingredient.name)}`}
                className="group flex min-h-[205px] flex-col justify-between rounded-2xl border border-black/[0.04] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-7"
                style={{ backgroundColor: ingredient.color }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-[#276b50]">
                    <Icon size={23} strokeWidth={1.6} />
                  </div>
                  <span className="rounded-full bg-white/70 px-3 py-1.5 text-[9px] font-semibold tracking-[0.15em] text-[#4b5a50]">
                    {ingredient.tag}
                  </span>
                </div>

                <div className="mt-8 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight text-[#1d2b23] sm:text-2xl">
                      {ingredient.name}
                    </h3>
                    <p className="mt-2 max-w-[290px] text-sm leading-5 text-[#58645b]">
                      {ingredient.description}
                    </p>
                  </div>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#203b30] transition group-hover:bg-[#203b30] group-hover:text-white">
                    <ArrowUpRight size={19} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
