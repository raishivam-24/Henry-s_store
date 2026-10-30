
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  RotateCcw,
  X,
  ChevronDown,
  ArrowDownWideNarrow,
  Sparkles,
  ShoppingBag,
  Leaf,
  ArrowRight,
  SlidersHorizontal,
  Clock3,
  Trash2,
} from "lucide-react";

import ProductCard from "./ProductCard";
import type { Product, ApiProduct } from "@/lib/products";

const HISTORY_KEY = "henrys_recent_searches";

const normalize = (value?: string | null) =>
  (value ?? "").trim().toLowerCase();

function ingredientText(value: string | string[] | undefined) {
  return Array.isArray(value) ? value.join(", ") : value ?? "";
}

function getIngredients(value: string | string[] | undefined) {
  return ingredientText(value)
    .split(/[,|]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function matchesConcern(product: Product, selectedConcern: string) {
  const concern = normalize(selectedConcern);
  const productConcern = normalize(product.concern);
  const category = normalize(product.category);

  if (productConcern === concern) return true;

  if (concern.includes("acne") || concern.includes("breakout")) {
    return (
      category.includes("acne") ||
      productConcern.includes("acne") ||
      productConcern.includes("breakout")
    );
  }

  return false;
}

type Suggestion = {
  label: string;
  type: "Product" | "Category" | "Concern" | "Ingredient";
};

export default function ProductsPage() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [concern, setConcern] = useState("All");
  const [ingredient, setIngredient] = useState("All");
  const [sort, setSort] = useState("featured");

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Sync filters with homepage URLs.
  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setCategory(searchParams.get("category") || "All");
    setConcern(searchParams.get("concern") || "All");
    setIngredient(searchParams.get("ingredient") || "All");
  }, [searchParams]);

  // Load shared search history.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setRecentSearches(
            parsed.filter((item): item is string => typeof item === "string")
          );
        }
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Fetch products from MongoDB API.
  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/products", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load products.");
        }

        const data: {
          success: boolean;
          products: ApiProduct[];
        } = await response.json();

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid response from products API.");
        }

        const mapped: Product[] = data.products.map((item) => ({
          id: item._id,
          name: item.name,
          category: item.category ?? "",
          concern: item.concern ?? "",
          ingredients: item.ingredients ?? "",
          price: item.price,
          originalPrice: item.originalPrice,
          image: item.image || item.images?.[0] || "",
          rating: item.rating ?? 0,
          reviews: item.reviewCount ?? 0,
          badge: item.badge,
          stock: item.stock ?? null,
        }));

        if (!controller.signal.aborted) {
          setProducts(mapped);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        if (!controller.signal.aborted) {
          setError(
            err instanceof Error ? err.message : "Unable to load products."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products.map((product) => product.category.trim()).filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [products]
  );

  const concerns = useMemo(() => {
    const values = products
      .map((product) => product.concern.trim())
      .filter(Boolean);

    if (
      products.some((product) => normalize(product.category).includes("acne"))
    ) {
      values.push("Acne");
    }

    return [
      "All",
      ...Array.from(new Set(values)).sort((a, b) => a.localeCompare(b)),
    ];
  }, [products]);

  const ingredients = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          products.flatMap((product) =>
            getIngredients(product.ingredients)
          )
        )
      ).sort((a, b) => a.localeCompare(b)),
    ],
    [products]
  );

  // Build suggestions from actual catalogue data.
  const suggestions = useMemo(() => {
    const query = normalize(search);
    if (!query) return [];

    const results: Suggestion[] = [];

    function add(label: string, type: Suggestion["type"]) {
      if (
        normalize(label).includes(query) &&
        !results.some(
          (item) =>
            normalize(item.label) === normalize(label) &&
            item.type === type
        )
      ) {
        results.push({ label, type });
      }
    }

    products.forEach((product) => add(product.name, "Product"));
    categories.filter((item) => item !== "All").forEach((item) => add(item, "Category"));
    concerns.filter((item) => item !== "All").forEach((item) => add(item, "Concern"));
    ingredients.filter((item) => item !== "All").forEach((item) => add(item, "Ingredient"));

    return results.slice(0, 7);
  }, [products, search, categories, concerns, ingredients]);

  function saveRecentSearch(value: string) {
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
      // Ignore storage errors.
    }
  }

  function clearHistory() {
    setRecentSearches([]);

    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {
      // Ignore storage errors.
    }
  }

  function selectSuggestion(suggestion: Suggestion) {
    setShowSuggestions(false);

    if (suggestion.type === "Category") {
      setSearch("");
      setCategory(suggestion.label);
      setConcern("All");
      setIngredient("All");
    } else if (suggestion.type === "Concern") {
      setSearch("");
      setConcern(suggestion.label);
      setCategory("All");
      setIngredient("All");
    } else if (suggestion.type === "Ingredient") {
      setSearch("");
      setIngredient(suggestion.label);
      setCategory("All");
      setConcern("All");
    } else {
      setCategory("All");
      setConcern("All");
      setIngredient("All");
      setSearch(suggestion.label);
      saveRecentSearch(suggestion.label);
    }
  }

  function submitSearch() {
    if (search.trim()) saveRecentSearch(search);
    setShowSuggestions(false);
  }

  // Apply all filters together.
  const filteredProducts = useMemo(() => {
    let result = [...products];

    const searchTerm = normalize(search);
    const selectedCategory = normalize(category);
    const selectedConcern = normalize(concern);
    const selectedIngredient = normalize(ingredient);

    if (searchTerm) {
      result = result.filter((product) => {
        const searchable = [
          product.name,
          product.category,
          product.concern,
          ingredientText(product.ingredients),
        ].join(" ");

        return normalize(searchable).includes(searchTerm);
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => normalize(product.category) === selectedCategory
      );
    }

    if (selectedConcern !== "all") {
      result = result.filter((product) =>
        matchesConcern(product, concern)
      );
    }

    if (selectedIngredient !== "all") {
      result = result.filter((product) =>
        normalize(ingredientText(product.ingredients)).includes(
          selectedIngredient
        )
      );
    }

    if (sort === "price-low") {
      result.sort(
        (a, b) =>
          (a.price ?? Number.MAX_SAFE_INTEGER) -
          (b.price ?? Number.MAX_SAFE_INTEGER)
      );
    } else if (sort === "price-high") {
      result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (sort === "rating") {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sort === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, category, concern, ingredient, sort]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    category !== "All" ||
    concern !== "All" ||
    ingredient !== "All";

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setConcern("All");
    setIngredient("All");
    setSort("featured");
    setShowSuggestions(false);
  }

  function scrollToProducts() {
    setShowSuggestions(false);

    document.getElementById("product-grid")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function scrollToConcernFilter() {
    document.getElementById("concern-filter")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  function removeFilter(type: string) {
    if (type === "search") setSearch("");
    if (type === "category") setCategory("All");
    if (type === "concern") setConcern("All");
    if (type === "ingredient") setIngredient("All");
  }

  return (
    <main className="min-h-screen bg-[#f7f8f3] text-[#20241f]">

      {/* Premium hero */}
      <section className="relative isolate overflow-hidden border-b border-[#e5e9df] bg-gradient-to-br from-[#f2f5ed] via-[#edf2e9] to-[#e2ecdf] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-20">
        <div className="pointer-events-none absolute -right-24 -top-32 h-[420px] w-[420px] rounded-full bg-[#cbdcc5]/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-white/70 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1500px] items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d3dfd0] bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#287d6c] shadow-sm">
              <Sparkles size={13} />
              Henry&apos;s Skincare Collection
            </div>

            <h1 className="mt-7 text-5xl font-medium leading-[1.04] tracking-[-0.06em] text-[#20271f] sm:text-6xl lg:text-[76px]">
              Your skin.
              <br />
              Your routine.
              <span className="block text-[#398575]">Your glow.</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-[#707b70] sm:text-base sm:leading-8">
              Discover skincare and personal-care essentials designed
              to make everyday care feel special. Find your favourites
              by skin concern, category or ingredient.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToProducts}
                className="group flex items-center gap-3 rounded-full bg-[#173e32] px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-[#173e32]/15 transition hover:-translate-y-1 hover:bg-[#245744]"
              >
                Shop the collection
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>

              <button
                type="button"
                onClick={scrollToConcernFilter}
                className="rounded-full border border-[#cbd8c8] bg-white/70 px-6 py-3.5 text-sm font-medium text-[#405344] transition hover:border-[#398575] hover:bg-white"
              >
                Find by skin concern
              </button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-[#d8e2d4] pt-6">
              <div className="flex items-center gap-2 text-xs text-[#627263]">
                <Leaf size={16} className="text-[#398575]" />
                Everyday essentials
              </div>
              <div className="flex items-center gap-2 text-xs text-[#627263]">
                <Sparkles size={16} className="text-[#398575]" />
                Simple skincare routines
              </div>
            </div>
          </div>

          {/* Three-product campaign visual */}
          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full border border-[#c6d7c1]" />
            <div className="absolute -bottom-8 -left-8 h-44 w-44 rounded-full border border-[#c6d7c1]" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-br from-[#e0e9dc] via-[#f7f7ed] to-[#d6e4d3] p-5 shadow-[0_25px_70px_rgba(47,79,53,0.13)] sm:p-7">
              <div className="relative flex items-center justify-between">
                <span className="rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#54715b]">
                  Your daily ritual
                </span>
                <Sparkles size={20} className="text-[#548c78]" />
              </div>

              <div className="relative mx-auto mt-5 flex min-h-[330px] max-w-[390px] items-center justify-center">
                <div className="absolute h-[290px] w-[290px] rounded-full border border-[#c6d7c1] bg-white/30" />
                <div className="absolute h-[230px] w-[230px] rounded-full bg-[#d3e2ce]/60 blur-2xl" />

                {products.slice(0, 3).map((product, index) => {
                  const image = product.image;

                  const positions = [
                    "left-0 top-16 z-10 -rotate-[9deg]",
                    "left-1/2 top-2 z-20 -translate-x-1/2",
                    "right-0 top-16 z-10 rotate-[9deg]",
                  ];

                  return (
                    <div
                      key={product.id}
                      className={`absolute flex h-[225px] w-[112px] items-center justify-center overflow-hidden rounded-2xl border border-white/80 bg-white/75 p-2 shadow-[0_20px_35px_rgba(42,70,45,0.15)] backdrop-blur-sm transition duration-500 hover:-translate-y-3 sm:h-[245px] sm:w-[125px] ${positions[index]}`}
                    >
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Leaf size={40} className="text-[#548c78]" />
                      )}
                    </div>
                  );
                })}

                {products.length === 0 && (
                  <div className="relative z-10 flex h-44 w-36 items-center justify-center rounded-3xl border border-white bg-white/70 shadow-xl">
                    <Leaf size={50} className="text-[#548c78]" />
                  </div>
                )}

                <div className="absolute bottom-0 left-1/2 z-30 w-[90%] -translate-x-1/2 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg backdrop-blur-lg">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#398575]">
                    The Henry&apos;s edit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#344b39]">
                    Your everyday skincare essentials
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#cbd9c7] pt-4">
                <div>
                  <p className="text-xs font-semibold text-[#405b46]">
                    Made for everyday care
                  </p>
                  <p className="mt-1 text-[10px] text-[#819080]">
                    Explore the Henry&apos;s collection
                  </p>
                </div>

                <button
                  type="button"
                  onClick={scrollToProducts}
                  aria-label="Explore products"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173e32] text-white transition hover:scale-105 hover:bg-[#245744]"
                >
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            <div className="absolute -right-3 top-24 hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:block">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#45634b]">
                <span className="h-2 w-2 rounded-full bg-[#63a47b]" />
                Everyday glow
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Single top filter toolbar */}
      <section className="sticky top-[76px] z-30 border-b border-[#e7e8df] bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.5fr)_repeat(3,minmax(135px,1fr))_minmax(145px,1fr)]">

            {/* Product search */}
            <div className="relative min-w-0">
              <div className="relative">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#829087]"
                />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setShowSuggestions(false);
                    }

                    if (event.key === "Enter") {
                      event.preventDefault();
                      submitSearch();
                    }
                  }}
                  placeholder="Search products, ingredients..."
                  aria-label="Search products"
                  autoComplete="off"
                  className="h-12 w-full rounded-full border border-[#dce3da] bg-[#f8faf6] pl-11 pr-12 text-sm outline-none transition-all placeholder:text-[#929b90] hover:border-[#b9cbbb] focus:border-[#398d7d] focus:bg-white focus:ring-4 focus:ring-[#398d7d]/10"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setShowSuggestions(false);
                    }}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#788478] hover:bg-[#e9eee7]"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              {showSuggestions && (
                <>
                  <button
                    type="button"
                    aria-label="Close search suggestions"
                    onClick={() => setShowSuggestions(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-[#e4e9e0] bg-white p-2 shadow-[0_16px_45px_rgba(27,55,39,0.14)]">
                    {!search.trim() ? (
                      <>
                        <div className="flex items-center justify-between px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                            Recent searches
                          </p>

                          {recentSearches.length > 0 && (
                            <button
                              type="button"
                              onClick={clearHistory}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500"
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
                              onClick={() => {
                                setSearch(item);
                                setShowSuggestions(false);
                                saveRecentSearch(item);
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#455347] hover:bg-[#f0f5ed]"
                            >
                              <Clock3 size={15} />
                              {item}
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-5 text-center text-xs text-gray-400">
                            No recent searches yet.
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          Search suggestions
                        </p>

                        {suggestions.length > 0 ? (
                          suggestions.map((item, index) => (
                            <button
                              key={`${item.type}-${item.label}-${index}`}
                              type="button"
                              onClick={() => selectSuggestion(item)}
                              className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#f0f5ed]"
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <Search size={15} className="shrink-0 text-[#398d7d]" />
                                <span className="truncate text-sm text-[#303a31]">
                                  {item.label}
                                </span>
                              </span>
                              <span className="shrink-0 rounded-full bg-[#f2f5f0] px-2 py-1 text-[10px] text-[#778477]">
                                {item.type}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-5 text-center text-xs text-gray-400">
                            No matching suggestions.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            <FilterSelect
              label="Category"
              value={category}
              options={categories}
              onChange={setCategory}
            />

            <div id="concern-filter" className="scroll-mt-40">
              <FilterSelect
                label="Skin concern"
                value={concern}
                options={concerns}
                onChange={setConcern}
              />
            </div>

            <FilterSelect
              label="Ingredient"
              value={ingredient}
              options={ingredients}
              onChange={setIngredient}
            />

            <label className="relative block min-w-0">
              <ArrowDownWideNarrow
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#788478]"
              />

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort products"
                className="h-12 w-full appearance-none rounded-full border border-[#e1e4dc] bg-white pl-11 pr-10 text-sm text-[#39463c] outline-none focus:border-[#398d7d] focus:ring-2 focus:ring-[#398d7d]/10"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A–Z</option>
              </select>

              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#788478]"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-[#7b8278]">
              {loading
                ? "Finding your products..."
                : `${filteredProducts.length} products available`}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#218474] hover:text-[#174b3c]"
              >
                <RotateCcw size={13} />
                Clear all filters
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {search.trim() && (
                <FilterChip
                  label={`Search: ${search}`}
                  onRemove={() => removeFilter("search")}
                />
              )}
              {category !== "All" && (
                <FilterChip
                  label={category}
                  onRemove={() => removeFilter("category")}
                />
              )}
              {concern !== "All" && (
                <FilterChip
                  label={concern}
                  onRemove={() => removeFilter("concern")}
                />
              )}
              {ingredient !== "All" && (
                <FilterChip
                  label={ingredient}
                  onRemove={() => removeFilter("ingredient")}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* Product grid */}
      <section
        id="product-grid"
        className="mx-auto max-w-[1500px] scroll-mt-40 px-4 py-10 sm:px-8 lg:px-12"
      >
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#278878]">
              The collection
            </p>

            <h2 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              {category !== "All"
                ? category
                : concern !== "All"
                  ? concern
                  : ingredient !== "All"
                    ? ingredient
                    : search
                      ? `Results for "${search}"`
                      : "Explore all products"}
            </h2>

            <p className="mt-2 text-sm text-[#858b81]">
              {loading
                ? "Loading your collection..."
                : `Showing ${filteredProducts.length} of ${products.length} products`}
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-[#899087] sm:flex">
            <SlidersHorizontal size={14} />
            Refine your routine
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#ebede6] bg-white"
              >
                <div className="aspect-[4/5] bg-[#ecefe8]" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-1/3 rounded bg-[#ecefe8]" />
                  <div className="h-4 rounded bg-[#ecefe8]" />
                  <div className="h-4 w-1/2 rounded bg-[#ecefe8]" />
                  <div className="h-10 rounded-full bg-[#ecefe8]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-[#e8e9e1] bg-white px-5 py-16 text-center">
            <h3 className="text-xl font-semibold">
              Could not load products
            </h3>
            <p className="mt-2 text-sm text-[#858b81]">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-[#173e32] px-7 py-3 text-sm font-medium text-white hover:bg-[#245543]"
            >
              Try again
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-[#e8e9e1] bg-white px-5 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#edf3eb] text-[#278878]">
              <Search size={24} />
            </div>

            <h3 className="mt-5 text-xl font-semibold">
              No matching products
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#858b81]">
              We couldn&apos;t find products matching these filters.
              Try changing your selection or explore the complete collection.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-7 rounded-full bg-[#173e32] px-7 py-3 text-sm font-medium text-white hover:bg-[#245543]"
            >
              Show all products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {!loading && !error && products.length > 0 && (
        <section className="border-t border-[#e8e9e1] bg-[#f0f3ec] px-5 py-10 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-[#526252]">
            <Leaf size={16} />
            A little care, every day.
          </p>
          <p className="mt-2 text-xs text-[#899087]">
            Discover the right essentials for your everyday routine.
          </p>
        </section>
      )}
    </main>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="h-12 w-full appearance-none rounded-full border border-[#e1e4dc] bg-white px-4 pr-10 text-sm text-[#39463c] outline-none transition hover:border-[#b9c9bb] focus:border-[#398d7d] focus:ring-2 focus:ring-[#398d7d]/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === "All" ? `All ${label.toLowerCase()}s` : option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#788478]"
      />
    </label>
  );
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#dce5d9] bg-[#f0f5ed] px-3 py-1.5 text-xs text-[#526452] transition hover:border-[#a9c4ae] hover:bg-[#e7f0e3]"
    >
      <span className="truncate">{label}</span>
      <X size={13} className="shrink-0" />
    </button>
  );
}
