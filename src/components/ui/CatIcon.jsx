import {
  Utensils, Car, Heart, ShoppingBag, Gamepad2, Pill, FileText, Package,
  Coffee, Pizza, Plane, Book, Music, Monitor, Gift, Dumbbell, PawPrint,
  Leaf, DollarSign, Palette, Droplets, Shirt, Wrench, Film, Beer,
  Umbrella, Flower2, Banknote, PiggyBank, Laptop, Home, Camera, Star, Wallet,
} from "lucide-react";

const iconMap = {
  utensils: Utensils, car: Car, heart: Heart, shoppingbag: ShoppingBag,
  gamepad: Gamepad2, pill: Pill, filetext: FileText, package: Package,
  coffee: Coffee, pizza: Pizza, plane: Plane, book: Book, music: Music,
  monitor: Monitor, gift: Gift, dumbbell: Dumbbell, pawprint: PawPrint,
  leaf: Leaf, dollar: DollarSign, palette: Palette, droplets: Droplets,
  shirt: Shirt, wrench: Wrench, film: Film, beer: Beer, umbrella: Umbrella,
  flower: Flower2, banknote: Banknote, piggy: PiggyBank, laptop: Laptop,
  home: Home, camera: Camera, star: Star, wallet: Wallet, shopping: ShoppingBag,
  game: Gamepad2,
};

export function CatIcon({ iconKey, size = 18, color, strokeWidth = 2, style }) {
  const Icon = iconMap[iconKey] || Package;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} style={{ flexShrink: 0, ...style }} />;
}
