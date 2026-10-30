
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Grid2X2,
  Sparkles,
  FlaskConical,
  LayoutGrid,
  Clock3,
  Trash2,
} from "lucide-react";

import { useCart } from "@/context/CartContext";

const HISTORY_KEY = "henrys_recent_searches";

const navigation = [
  { label: "Explore", href: "/", icon: LayoutGrid },
  { label: "Concern", href: "/concern", icon: Sparkles },
  { label: "Category", href: "/category", icon: Grid2X2 },
  { label: "Ingredients", href: "/ingredients", icon: FlaskConical },
];

type StoreProduct = {
  _id: string;
  name: string;
  category?: string;
  concern?: string;
  image?: string;
  images?: string[];
};

const normalize = (value: string) => value.trim().toLowerCase();

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const { totalItems, ready } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);

  // Load recent searches.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setRecentSearches(
            parsed.filter(
              (item): item is string => typeof item === "string"
            )
          );
        }
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Load products for suggestions.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        if (!controller.signal.aborted && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
      }
    }

    loadProducts();

    return () => controller.abort();
  }, []);

  // Close suggestions and reset the search when the route changes.
  useEffect(() => {
    setShowSuggestions(false);
    setSearchQuery("");
    setMobileSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Also reset when browser Back/Forward changes the history entry.
  useEffect(() => {
    function handleHistoryNavigation() {
      setShowSuggestions(false);
      setSearchQuery("");
      setMobileSearchOpen(false);
      setMobileOpen(false);
    }

    window.addEventListener("popstate", handleHistoryNavigation);

    return () => {
      window.removeEventListener("popstate", handleHistoryNavigation);
    };
  }, []);

  // Close suggestions when clicking outside either search area.
  useEffect(() => {
    function handleOutsideClick(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const insideDesktop = desktopSearchRef.current?.contains(target);
      const insideMobile = mobileSearchRef.current?.contains(target);

      if (!insideDesktop && !insideMobile) {
        setShowSuggestions(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const suggestions = useMemo(() => {
    const query = normalize(searchQuery);

    if (!query) return [];

    return products
      .filter((product) =>
        normalize(
          `${product.name} ${product.category ?? ""} ${product.concern ?? ""}`
        ).includes(query)
      )
      .slice(0, 5);
  }, [products, searchQuery]);

  function saveSearch(value: string) {
    const query = value.trim();

    if (!query) return;

    const updated = [
      query,
      ...recentSearches.filter(
        (item) => normalize(item) !== normalize(query)
      ),
    ].slice(0, 7);

    setRecentSearches(updated);

    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore browser storage errors.
    }
  }

  function clearHistory() {
    setRecentSearches([]);

    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore browser storage errors.
    }
  }

  function performSearch(value = searchQuery) {
    const query = value.trim();

    if (!query) return;

    saveSearch(query);

    setSearchQuery("");
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    setMobileOpen(false);

    router.push(`/products?search=${encodeURIComponent(query)}`);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    performSearch();
  }

  function handleNavigationClick(href: string) {
    setShowSuggestions(false);
    setSearchQuery("");
    setMobileOpen(false);
    setMobileSearchOpen(false);

    if (pathname === href) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  function SearchSuggestions() {
    if (!showSuggestions) return null;

    return (
      <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-[100] overflow-hidden rounded-2xl border border-[#e4e9e0] bg-white p-2 shadow-[0_16px_45px_rgba(27,55,39,0.15)]">

        {!searchQuery.trim() ? (
          <>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#899389]">
                Recent searches
              </span>

              {recentSearches.length > 0 && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-[11px] text-[#899389] hover:text-red-600"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              )}
            </div>

            {recentSearches.length > 0 ? (
              recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => performSearch(item)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#455347] hover:bg-[#f0f5ed]"
                >
                  <Clock3
                    size={15}
                    className="text-[#89978a]"
                  />

                  <span className="truncate">{item}</span>

                  <ArrowRight
                    size={14}
                    className="ml-auto"
                  />
                </button>
              ))
            ) : (
              <p className="px-3 py-5 text-center text-xs text-[#899389]">
                Your recent searches will appear here.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#899389]">
              Matching products
            </p>

            {suggestions.length > 0 ? (
              suggestions.map((product) => {
                const image = product.images?.[0] || product.image || "";

                return (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => performSearch(product.name)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-[#f0f5ed]"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f1f3ed]">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Search size={16} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-[#303a31]">
                        {product.name}
                      </span>

                      <span className="mt-1 block truncate text-[11px] text-[#899389]">
                        {product.category || "Skincare"}
                      </span>
                    </span>

                    <ArrowRight
                      size={14}
                      className="shrink-0"
                    />
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-5 text-center text-xs text-[#899389]">
                No matching products found.
              </p>
            )}

            <button
              type="button"
              onClick={() => performSearch()}
              className="mt-1 flex w-full items-center justify-center gap-2 border-t border-[#edf0e9] px-3 py-3 text-xs font-semibold text-[#287d6c] hover:bg-[#f6f8f4]"
            >
              Search for &quot;{searchQuery}&quot;
              <ArrowRight size={13} />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#eeefe9] bg-white/95 shadow-sm backdrop-blur-xl">

      <div className="mx-auto flex h-[78px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-10">

        {/* Logo */}
        <Link
          href="/"
          onClick={() => handleNavigationClick("/")}
          className="shrink-0 text-xl font-black tracking-[-0.07em] text-[#171a17] sm:text-2xl"
        >
          HENRY&apos;S<span className="text-[#238c78]">.</span>

          <span className="ml-1 text-[9px] font-medium tracking-[0.18em] text-[#7f877e]">
            SKINCARE
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-2 lg:flex">
          {navigation.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={label}
                href={href}
                onClick={() => handleNavigationClick(href)}
                className={`flex min-w-[76px] flex-col items-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium transition ${
                  active
                    ? "bg-[#f0f5ed] text-[#1e715d]"
                    : "text-[#303630] hover:bg-[#f5f7f2] hover:text-[#287d6c]"
                }`}
              >
                <Icon size={19} strokeWidth={1.8} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop search */}
        <div
          ref={desktopSearchRef}
          className="relative hidden w-full max-w-[310px] md:block"
        >
          <form onSubmit={handleSearch} className="relative">
            <Search
              size={19}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#788478]"
            />

            <input
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search products..."
              aria-label="Search products"
              autoComplete="off"
              className="h-11 w-full rounded-full border border-[#e0e5dc] bg-[#fafbf8] pl-11 pr-10 text-sm text-[#27342b] outline-none ring-0 transition placeholder:text-[#9ba399] hover:border-[#bdcdbb] focus:border-[#398d7d] focus:outline-none focus:ring-4 focus:ring-[#398d7d]/10"
            />

            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(true);
                }}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#788478] hover:bg-[#e9eee7] focus:outline-none"
              >
                <X size={15} />
              </button>
            )}
          </form>

          <SearchSuggestions />
        </div>

        {/* Account and cart */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <Link
            href="/account"
            aria-label="My account"
            className="hidden h-10 w-10 items-center justify-center rounded-full text-[#303630] hover:bg-[#f0f5ed] sm:flex"
          >
            <UserRound size={21} strokeWidth={1.7} />
          </Link>

          <Link
            href="/cart"
            aria-label="Shopping bag"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#303630] hover:bg-[#f0f5ed]"
          >
            <ShoppingBag size={21} strokeWidth={1.7} />

            {ready && totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#287d6c] px-1 text-[9px] font-bold text-white">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>

          {/* Mobile search button */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((previous) => !previous);
              setShowSuggestions(false);
            }}
            aria-label="Toggle search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#303630] hover:bg-[#f0f5ed] md:hidden"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Mobile menu */}
          <button
            type="button"
            onClick={() => {
              setMobileOpen((previous) => !previous);
              setShowSuggestions(false);
            }}
            aria-label="Toggle navigation"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#303630] hover:bg-[#f0f5ed] lg:hidden"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      {mobileSearchOpen && (
        <div
          ref={mobileSearchRef}
          className="border-t border-[#edf0e9] bg-white px-4 py-4 md:hidden"
        >
          <div className="relative">
            <form onSubmit={handleSearch} className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#788478]"
              />

              <input
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products..."
                aria-label="Search products"
                autoComplete="off"
                className="h-12 w-full rounded-full border border-[#e0e5dc] bg-[#fafbf8] pl-11 pr-11 text-sm outline-none focus:border-[#398d7d] focus:ring-4 focus:ring-[#398d7d]/10"
              />

              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(true);
                  }}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#788478] hover:bg-[#e9eee7]"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            <SearchSuggestions />
          </div>
        </div>
      )}

      {/* Mobile navigation */}
      {mobileOpen && (
        <nav className="border-t border-[#edf0e9] bg-white px-4 py-3 lg:hidden">
          {navigation.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              onClick={() => handleNavigationClick(href)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#39463c] hover:bg-[#f0f5ed]"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}

          <Link
            href="/account"
            onClick={() => handleNavigationClick("/account")}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#39463c] hover:bg-[#f0f5ed]"
          >
            <UserRound size={18} />
            My Account
          </Link>
        </nav>
      )}
    </header>
  );
}
