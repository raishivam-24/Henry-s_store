
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="bg-white px-4 pb-4 pt-4 sm:px-6 lg:px-8">
      <div
        className="relative mx-auto flex min-h-[320px] max-w-[1500px] items-center overflow-hidden rounded-2xl bg-[#f5eee5] bg-cover bg-center sm:min-h-[380px] lg:min-h-[430px]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(250,244,236,0.97) 0%, rgba(250,244,236,0.88) 38%, rgba(250,244,236,0.05) 100%), url('https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1800&q=85')",
        }}
      >
        <div className="relative z-10 max-w-2xl px-6 py-12 sm:px-10 lg:px-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-[10px] font-semibold tracking-[0.15em] text-white sm:text-xs">
            <span className="h-2 w-2 rounded-full bg-[#10b89a]" />
            YOUR DAILY SKINCARE RITUAL
          </span>

          <h1 className="mt-6 max-w-lg text-4xl font-semibold leading-[1.08] tracking-tight text-[#172c23] sm:text-5xl lg:text-6xl">
            Healthy skin.
            <br />
            Confident you.
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-[#55574f] sm:text-base">
            Discover skincare essentials selected for your everyday routine.
            Find your favourites and make every day a little brighter.
          </p>

          <Link
            href="/products"
            className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#124d3a] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1e6b52] sm:px-8 sm:text-base"
          >
            SHOP NOW
            <ArrowRight size={19} />
          </Link>
        </div>
      </div>
    </section>
  );
}
