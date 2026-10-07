const ingredients = [
  "Niacinamide",
  "Vitamin C",
  "Hyaluronic Acid",
  "Salicylic Acid",
  "Retinol",
  "Kojic Acid",
];

export default function Ingredients() {
  return (
    <section
      id="ingredients"
      className="bg-[#1d392d] px-5 py-20 text-white sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1400px]">

        <div className="max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Know what goes on your skin
          </p>

          <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-6xl">
            Shop by ingredient
          </h2>

          <p className="mt-6 leading-7 text-white/65">
            Discover carefully selected ingredients designed
            around everyday skincare concerns.
          </p>
        </div>

        <div className="mt-14 grid border-t border-white/20 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((ingredient, index) => (
            <a
              key={ingredient}
              href="#"
              className="group flex items-center justify-between border-b border-white/20 py-7 pr-5"
            >
              <div className="flex items-center gap-5">
                <span className="text-xs text-white/40">
                  0{index + 1}
                </span>

                <span className="text-lg sm:text-xl">
                  {ingredient}
                </span>
              </div>

              <span className="text-xl transition-transform group-hover:translate-x-2">
                →
              </span>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}