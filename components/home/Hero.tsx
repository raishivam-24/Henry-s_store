export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#e8e7df]">
      <div className="mx-auto grid min-h-[650px] max-w-[1500px] lg:grid-cols-2">

        {/* Content */}
        <div className="flex items-center px-7 py-20 sm:px-12 lg:px-20 xl:px-28">
          <div className="max-w-xl">

            <p className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-[#1d392d]">
              Science-led skincare
            </p>

            <h1 className="text-[52px] font-medium leading-[0.95] tracking-[-0.055em] sm:text-[68px] lg:text-[82px]">
              Simple routines.
              <br />
              <span className="italic">
                Visible results.
              </span>
            </h1>

            <p className="mt-8 max-w-md text-base leading-7 text-[#62625c]">
              Thoughtfully selected skincare and wellness
              essentials made for everyday routines.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#bestsellers"
                className="rounded-full bg-[#1d392d] px-7 py-4 text-sm font-medium text-white transition hover:bg-[#13281f]"
              >
                Shop Bestsellers
              </a>

              <a
                href="#concerns"
                className="rounded-full border border-[#1d392d] px-7 py-4 text-sm font-medium transition hover:bg-[#1d392d] hover:text-white"
              >
                Shop by Concern
              </a>
            </div>
          </div>
        </div>

        {/* Visual */}
        <div className="relative min-h-[420px] bg-[#d8d7ce]">
          <div className="absolute inset-0 flex items-center justify-center">

            <div className="relative h-[310px] w-[220px] rotate-[-7deg] rounded-[8px] bg-[#f4f1e8] shadow-2xl">
              <div className="absolute left-1/2 top-0 h-12 w-20 -translate-x-1/2 -translate-y-full rounded-t-lg bg-[#c9c7bd]" />

              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 text-center">
                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                  HENRY&apos;S
                </p>

                <p className="mt-5 text-2xl font-semibold tracking-tight">
                  DAILY
                  <br />
                  SERUM
                </p>

                <div className="mx-auto mt-5 h-px w-12 bg-gray-400" />

                <p className="mt-4 text-[9px] uppercase tracking-widest text-gray-500">
                  Vitamin C + Niacinamide
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}