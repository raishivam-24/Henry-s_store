const concerns = [
  {
    name: "Acne & Breakouts",
    description: "Clearer-looking skin",
    image: "/images/25. NIDACNE.jpg.jpeg",
  },
  {
    name: "Dark Spots",
    description: "Even-looking complexion",
    image: "/images/TYROGLO FACE SERUM .jpg.jpeg",
  },
  {
    name: "Pigmentation",
    description: "Brighter-looking skin",
    image: "/images/FYNKOJI.jpeg",
  },
  {
    name: "Dryness",
    description: "Deep hydration",
    image: "/images/NIDSOFT MX.jpeg",
  },
  {
    name: "Dull Skin",
    description: "Healthy-looking glow",
    image: "/images/ANC 1k.jpeg",
  },
  {
    name: "Hair Fall",
    description: "Stronger-looking hair",
    image: "/images/ANTIFALL SER.jpeg",
  },
];

export default function Concerns() {
  return (
    <section
      id="concerns"
      className="bg-white px-5 py-20 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1400px]">

        {/* Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Find your routine
            </p>

            <h2 className="mt-3 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
              Shop by concern
            </h2>
          </div>

          <a
            href="#bestsellers"
            className="hidden text-sm underline underline-offset-4 sm:block"
          >
            View all
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {concerns.map((concern) => (
            <a
              key={concern.name}
              href="#bestsellers"
              className="group relative overflow-hidden rounded-2xl bg-[#eeeDE7]"
            >

              {/* Image */}
              <div className="relative aspect-[4/5] overflow-hidden">

                <img
                  src={concern.image}
                  alt={concern.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-7">

                  <h3 className="text-xl font-medium sm:text-2xl">
                    {concern.name}
                  </h3>

                  <p className="mt-2 text-sm text-white/75">
                    {concern.description}
                  </p>

                  <span className="mt-5 inline-block text-xs uppercase tracking-[0.18em] underline underline-offset-4">
                    Explore
                  </span>

                </div>

              </div>
            </a>
          ))}

        </div>
      </div>
    </section>
  );
}