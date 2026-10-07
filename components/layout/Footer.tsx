export default function Footer() {
  return (
    <footer
      id="story"
      className="bg-[#111a15] px-5 py-14 text-white sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1400px]">

        <div className="grid gap-12 md:grid-cols-4">

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold tracking-[-0.05em]">
              HENRY&apos;S.
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/55">
              Skincare and wellness essentials designed
              around simple routines and everyday results.
            </p>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-white/40">
              Shop
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              <a href="#">All Products</a>
              <a href="#">Bestsellers</a>
              <a href="#">Skin Care</a>
              <a href="#">Hair Care</a>
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-widest text-white/40">
              Help
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-sm text-white/70">
              <a href="#">Contact Us</a>
              <a href="#">Shipping</a>
              <a href="#">Returns</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>

        </div>

        <div className="mt-14 border-t border-white/10 pt-7 text-xs text-white/40">
  © 2026 Henry&apos;s Store. All rights reserved.
</div>

      </div>
    </footer>
  );
}