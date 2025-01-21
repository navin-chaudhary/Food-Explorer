"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import NutritionFacts from "@/components/custom/NutritionFacts";

const NutritionGrade = ({ grade }) => {
  const gradeColors = {
    a: "bg-green-500",
    b: "bg-lime-500",
    c: "bg-yellow-500",
    d: "bg-orange-500",
    e: "bg-red-500",
    default: "bg-gray-500",
  };

  const colorClass = gradeColors[grade?.toLowerCase()] || gradeColors.default;

  return (
    <Badge className={`${colorClass} text-white px-3 py-1`}>
      Grade {grade?.toUpperCase() || "N/A"}
    </Badge>
  );
};

const ProductDetails = () => {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v2/product/${params.code}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "ProductBrowser/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Product not found"
              : "Failed to fetch product details"
          );
        }

        const data = await response.json();
        if (!data.product) {
          throw new Error("Product data not found");
        }

        setProduct(data.product);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.code) {
      fetchProductDetails();
    }
  }, [params.code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 "
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
          <p className="text-gray-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) return null;



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-all duration-200 group bg-gray-200 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Products
        </Link>

        <Card className="mb-8 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300 bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-gray-100 bg-white/90 rounded-t-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-3">
                <CardTitle className="text-4xl font-bold text-gray-900 tracking-tight">
                  {product.product_name}
                </CardTitle>
                <p className="text-gray-600 text-xl font-medium">
                  {product.brands || "Unknown Brand"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <NutritionGrade grade={product.nutrition_grades} />
                
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <img
                    src={product.image_url|| "/placeholder-image.png"}
                    alt={product.product_name}
                    className="w-full h-auto object-contain rounded-lg bg-white group-hover:scale-[1.02] transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400";
                    }}
                  />
                </div>
                <Card className="border border-gray-100 bg-gray-50/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                  <CardHeader className="py-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">
                    Barcode : {params.code}
                    </CardTitle>
                  </CardHeader>
                </Card>
                {product.categories && (
                  <Card className="border border-blue-100 bg-blue-50/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-blue-900">
                        Categories
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {product.categories
                          .split(",")
                          .map((category, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-white/90 text-blue-700 hover:bg-blue-50 transition-colors px-3 py-1.5 shadow-sm hover:shadow backdrop-blur-sm"
                            >
                              {category.trim()}
                            </Badge>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <NutritionFacts
                nutriments={product.nutriments}
                ingredients_text={product.ingredients_text}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProductDetails;
