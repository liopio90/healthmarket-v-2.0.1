import { motion } from 'motion/react';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { useState } from 'react';

interface ModernProductCardProps {
  image: string;
  title: string;
  description: string;
  price?: string;
  rating?: number;
  badge?: string;
  delay?: number;
  onClick?: () => void;
  onAddToCart?: () => void;
}

export function ModernProductCard({ 
  image, 
  title, 
  description, 
  price = "$19.99",
  rating = 4.8,
  badge,
  delay = 0,
  onClick,
  onAddToCart
}: ModernProductCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center p-8">
        <ImageWithFallback
          src={image}
          alt={title}
          className="max-w-[80px] max-h-[80px] w-full h-full object-contain object-center group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          {badge && (
            <Badge className="bg-green-500 text-white border-0 text-xs px-2 py-0.5">
              {badge}
            </Badge>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 backdrop-blur text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </motion.button>
        </div>

        {/* Quick Add to Cart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.();
            }}
            className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg flex items-center justify-center gap-1.5 hover:bg-gray-50 transition-colors shadow-lg text-xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Agregar</span>
          </button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-1.5">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs text-gray-700">{rating}</span>
          <span className="text-xs text-gray-400 hidden sm:inline">(120)</span>
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-1.5 line-clamp-1">{title}</h3>
        <p className="text-gray-600 text-xs mb-3 line-clamp-2">{description}</p>

        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-green-600">{price}</div>
          <button className="text-xs text-green-600 hover:text-green-700 transition-colors">
            Ver →
          </button>
        </div>
      </div>
    </motion.div>
  );
}
