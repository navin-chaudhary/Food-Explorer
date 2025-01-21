"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import {
  API_URL,
  PRODUCT_URL,
  CATEGORIES_URL,
  ITEMS_PER_PAGE,
  INFINITE_SCROLL_THRESHOLD,
  DEBOUNCE_DELAY,
} from "@/config";
import ProductCard from "@/components/custom/ProductCard";
import ProductFilters from "@/components/custom/ProductsFilter";


export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isSearchingBarcode, setIsSearchingBarcode] = useState(false);
  const [barcodeError, setBarcodeError] = useState(null);
  const observer = useRef();
  const loadingRef = useRef(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const lastProductElementRef = useCallback(
    (node) => {
      if (loading || !node) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          if (first.isIntersecting && hasMore) {
            const visibleRatio = first.intersectionRatio;
            if (visibleRatio >= INFINITE_SCROLL_THRESHOLD) {
              requestAnimationFrame(() => {
                setPage((prevPage) => prevPage + 1);
              });
            }
          }
        },
        {
          root: null,
          rootMargin: "1000px",
          threshold: INFINITE_SCROLL_THRESHOLD,
        }
      );

      observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const fetchProductByBarcode = async (barcode) => {
    try {
      setIsSearchingBarcode(true);
      setBarcodeError(null);
      setError(null);

      const response = await fetch(`${PRODUCT_URL}${barcode}.json`);
      if (!response.ok) {
        throw new Error("Product not found");
      }

      const data = await response.json();
      if (data.status === 0) {
        throw new Error("Product not found in database");
      }

      const product = {
        ...data.product,
        id: data.product.code,
      };

      setProducts([product]);
      setFilteredProducts([product]);
      setTotalCount(1);
      setHasMore(false);
    } catch (err) {
      setBarcodeError(err.message);
      setProducts([]);
      setFilteredProducts([]);
      setTotalCount(0);
    } finally {
      setIsSearchingBarcode(false);
      setInitialLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_URL);
      console.log("cetegorie response ", response.json());
      
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      const validCategories = data.tags
        .filter((tag) => tag.products > 100)
        .sort((a, b) => b.products - a.products)
        .slice(0, 20);
      setCategories(validCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchProducts = async (pageNumber = 1, isNewSearch = false) => {
   
      setError(null);
    try {
      if (isNewSearch) {
        setInitialLoading(true);      
        setProducts([]);
        setFilteredProducts([]);
        setPage(1);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        action: "process",
        json: "true",
        page: pageNumber.toString(),
        page_size: ITEMS_PER_PAGE.toString(),
        fields:
          "id,code,product_name,brands,image_url,nutrition_grades,nutriments,ingredients_text,categories_tags",
        sort_by: "popularity_key",
      });

      if (categoryFilter !== "all") {
        params.append("tagtype_0", "categories");
        params.append("tag_0", categoryFilter);
      }

      if (debouncedSearchQuery && !/^\d{8,13}$/.test(debouncedSearchQuery)) {
        params.append("search_terms", debouncedSearchQuery);
      }

      const response = await fetch(`${API_URL}?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "ProductBrowser/1.0",
        },
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.products || !Array.isArray(data.products)) {
        throw new Error("Invalid response format");
      }

      const validProducts = data.products
        .filter((p) => p?.product_name && p?.code)
        .map((p) => ({
          ...p,
          id: p.code,
        }));

      setTotalCount(data.count || 0);
      setHasMore(
        validProducts.length === ITEMS_PER_PAGE &&
          pageNumber * ITEMS_PER_PAGE < data.count
      );

      setProducts((prevProducts) => {
        const newProducts = isNewSearch
          ? validProducts
          : [...prevProducts, ...validProducts];
        const uniqueProducts = Array.from(
          new Map(
            newProducts.map((product) => [product.code, product])
          ).values()
        );
        return uniqueProducts;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setBarcodeError(null);
    if (/^\d{8,13}$/.test(value)) {
      fetchProductByBarcode(value);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!/^\d{8,13}$/.test(debouncedSearchQuery)) {
      fetchProducts(1, true);
    }
  }, [debouncedSearchQuery, categoryFilter, gradeFilter]);

  useEffect(() => {
    if (page > 1) {
      fetchProducts(page, false);
    }
  }, [page]);

  useEffect(() => {
    let result = [...products];

    if (debouncedSearchQuery && !/^\d{8,13}$/.test(debouncedSearchQuery)) {
      result = result.filter(
        (product) =>
          product.product_name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          (product.brands &&
            product.brands
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase()))
      );
    }

    if (gradeFilter !== "all") {
      result = result.filter(
        (product) => product.nutrition_grades?.toLowerCase() === gradeFilter
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter((product) =>
        product.categories_tags?.includes(categoryFilter)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.product_name.localeCompare(b.product_name);
          break;
        case "grade":
          comparison = (a.nutrition_grades || "z").localeCompare(
            b.nutrition_grades || "z"
          );
          break;
        case "energy":
          comparison =
            (b.nutriments?.energy_100g || 0) - (a.nutriments?.energy_100g || 0);
          break;
        default:
          return 0;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    setFilteredProducts(result);
  }, [
    products,
    debouncedSearchQuery,
    sortBy,
    sortOrder,
    gradeFilter,
    categoryFilter,
  ]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Products
            </h3>
            <p className="text-gray-600 text-center mb-4">{error}</p>
            <Button
              onClick={fetchProducts}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Food Products
          </h1>
          {!filteredProducts.length ? null : (
            <p className="text-xl text-gray-600 font-medium">
              {isSearchingBarcode
                ? "Searching by barcode..."
                : `Showing ${
                    filteredProducts.length
                  } of ${totalCount.toLocaleString()} products`}
              {loading && <span> (Loading more...)</span>}
            </p>
          )}
        </div>
        <ProductFilters 
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          gradeFilter={gradeFilter}
          onGradeChange={setGradeFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          categories={categories}
          barcodeError={barcodeError}
        />


        {initialLoading ? (
          <div className="flex justify-center items-center h-[400px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-gray-600 font-medium">Loading products...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  ref={
                    index === filteredProducts.length - 1
                      ? lastProductElementRef
                      : null
                  }
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {!loading && filteredProducts.length === 0 && (
              <div className="flex items-center justify-center h-[400px] bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center text-gray-600">
                  <p className="text-xl font-semibold mb-2">
                    No products found
                  </p>
                  <p className="text-gray-500">
                    Try adjusting your search or filters
                  </p>
                </div>
              </div>
            )}

            {loading && hasMore && (
              <div
                ref={loadingRef}
                className="flex justify-center items-center py-8"
              >
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-gray-600 font-medium">
                    Loading more products...
                  </p>
              
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
