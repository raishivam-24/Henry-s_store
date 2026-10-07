export default function Newsletter() {
  return (
    <section className="bg-[#e8e7df] px-5 py-20 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl text-center">

        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Stay in the loop
        </p>

        <h2 className="mt-4 text-4xl font-medium tracking-[-0.04em] sm:text-5xl">
          Better skin starts with better habits.
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-gray-600">
          Get skincare tips, new launches and exclusive
          offers directly in your inbox.
        </p>

        <form className="mx-auto mt-8 flex max-w-lg flex-col gap-2 sm:flex-row">
          <input
            type="email"
            placeholder="Your email address"
            className="h-14 flex-1 rounded-full border border-gray-300 bg-white px-6 text-sm outline-none focus:border-[#1d392d]"
          />

          <button
            type="submit"
            className="h-14 rounded-full bg-[#1d392d] px-7 text-sm font-medium text-white hover:bg-[#13281f]"
          >
            Subscribe
          </button>
        </form>

      </div>
    </section>
  );
}