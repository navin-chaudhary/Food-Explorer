import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const ProductCard = ({ product }) => {

  if (!product?.product_name) return null;

  return (
    <Card className="h-[550px] overflow-hidden group hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl flex flex-col">
      <div className="h-[200px] bg-gradient-to-br from-gray-50 to-white relative">
        <div className="absolute inset-0 bg-gray-900/5 group-hover:bg-gray-900/0 transition-colors duration-300" />
        <img
          src={product.image_url || "/placeholder-image.png"}
          alt={product.product_name}
          className="w-full h-[200px] object-contain transform group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
      </div>
      <CardHeader className="p flex-1">
        <CardTitle className="line-clamp-2 text-xl font-bold text-gray-800 h-[3.5rem] group-hover:text-blue-600 transition-colors duration-300">
          {product.product_name}
        </CardTitle>
        <p className="text-sm font-medium text-gray-500 mt-1">
          {product.brands || "Unknown Brand"}
        </p>
        {product.nutrition_grades && (
          <Badge
            className={`${
              {
                a: "bg-green-500/90 hover:bg-green-600",
                b: "bg-lime-500/90 hover:bg-lime-600",
                c: "bg-yellow-500/90 hover:bg-yellow-600",
                d: "bg-orange-500/90 hover:bg-orange-600",
                e: "bg-red-500/90 hover:bg-red-600",
              }[product.nutrition_grades.toLowerCase()] ||
              "bg-gray-500/90 hover:bg-gray-600"
            } text-white mt-2 px-3 py-1 shadow-sm transition-all duration-300`}
          >
            Grade {product.nutrition_grades.toUpperCase()}
          </Badge>
        )}
      </CardHeader>
      <CardContent className=" pt-0">
        {!product.ingredients_text && (
          <div className="mb-4 bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl group-hover:bg-gray-100/80 transition-colors duration-300 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500">Ingredients</p>
            </div>
            <p className="text-sm text-red-500 line-clamp-2 leading-relaxed">
              Note: Ingredients are not available
            </p>
            <div className="absolute bottom-0 right-0 left-0 h-6 bg-gradient-to-t from-gray-50/80 to-transparent group-hover:from-gray-100/80" />
          </div>
        )}
        {product.ingredients_text && (
          <div className="mb-4 bg-gray-50/80 backdrop-blur-sm p-4 rounded-xl group-hover:bg-gray-100/80 transition-colors duration-300 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500">Ingredients</p>
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 bg-white/50"
              >
                {product.ingredients_text.split(",").length} items
              </Badge>
            </div>
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
              {product.ingredients_text}
            </p>
            <div className="absolute bottom-0 right-0 left-0 h-6 bg-gradient-to-t from-gray-50/80 to-transparent group-hover:from-gray-100/80" />
          </div>
        )}
        <Link
          href={`/product/${product.code}`}
          className="block w-full bg-blue-600/90 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-center font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
        >
          View Details
        </Link>
      </CardContent>
    </Card>
  );
};

export default ProductCard;