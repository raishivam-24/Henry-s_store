export default function AnnouncementBar() {
  return (
    <div className="flex min-h-9 items-center justify-center bg-[#1d392d] px-4 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-white sm:text-[11px]">
      <span>
        FREE SHIPPING ON ORDERS ABOVE ₹499
      </span>

      <span className="mx-3 opacity-40">
        •
      </span>

      <span>
        CASH ON DELIVERY AVAILABLE
      </span>
    </div>
  );
}