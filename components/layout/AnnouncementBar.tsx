
import Link from "next/link";

export default function AnnouncementBar() {
  return (
    <div className="flex min-h-10 items-center justify-center bg-[#237d70] px-3 py-2 text-center text-xs font-semibold text-white sm:min-h-12 sm:text-sm">
      <span>Skincare made for your everyday glow</span>
      <span className="mx-2 opacity-70">|</span>
      <Link
        href="/products"
        className="underline underline-offset-4 hover:text-[#e8fff7]"
      >
        Shop Now
      </Link>
    </div>
  );
}
