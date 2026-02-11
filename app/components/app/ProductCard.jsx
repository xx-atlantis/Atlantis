"use client";
import React, { useState } from "react";
import { Star, Plus, SaudiRiyal } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useLocale } from "@/app/components/LocaleProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const ProductCard = ({ product, onClick }) => {
  const { addToCart } = useCart();
  const { locale } = useLocale();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();

    addToCart(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        coverImage: product.coverImage,
        images: product.images,

        // 🟢 Correct fields
        short_description: product.short_description,
        material: product.material,
        variant: product.variant, // 🟢 FULL VARIANT JSON
        category: product.category, // 🟢 bilingual category object

        // 🟢 optional convenience field
        categoryLabel: product.category?.[locale] || "",
      },
      1
    );
  };

  return (
    <Card
      className="group overflow-hidden border-gray-100 py-0! transition-all duration-300 hover:shadow-lg cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(product.id)}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.coverImage}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <Badge
          variant="secondary"
          className="absolute left-3 top-3 gap-1 bg-white/90 backdrop-blur-sm shadow-sm text-gray-700"
        >
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          {product.rating}
        </Badge>

        <div
          className={`absolute bottom-3 right-3 transition-all duration-300 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Button
            size="icon"
            onClick={handleAddToCart}
            className="rounded-full h-10 w-10 shadow-lg"
          >
            <Plus size={20} />
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">
            {product.category?.[locale]}
          </p>
          <h3 className="font-semibold text-gray-900 group-hover:text-[#2D3247] transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-[#2D3247] flex items-center">
            <SaudiRiyal size={18} /> {product.price.toLocaleString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
