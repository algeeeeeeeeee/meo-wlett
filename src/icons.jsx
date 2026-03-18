// Icon compatibility shim for lucide-react
// Handles icon renames between lucide versions
import * as L from 'lucide-react';

const fallback = (name, ...alts) => {
  for (const n of [name, ...alts]) if (L[n]) return L[n];
  return L.Package; // last resort
};

// Stable icons - direct re-export
export const Home           = L.Home;
export const List           = L.List;
export const BarChart2      = fallback('BarChart2', 'ChartBar', 'BarChart');
export const Heart          = L.Heart;
export const ArrowDown      = L.ArrowDown;
export const RefreshCw      = fallback('RefreshCw', 'RotateCw', 'RefreshCcw');
export const Utensils       = L.Utensils;
export const Car            = L.Car;
export const ShoppingBag    = fallback('ShoppingBag', 'ShoppingCart', 'Bag');
export const Gamepad2       = fallback('Gamepad2', 'Gamepad');
export const Pill           = L.Pill;
export const FileText       = fallback('FileText', 'FileType', 'File');
export const Package        = L.Package;
export const Coffee         = fallback('Coffee', 'Cup');
export const Plane          = L.Plane;
export const Book           = L.Book;
export const Music          = L.Music;
export const Monitor        = L.Monitor;
export const Gift           = L.Gift;
export const Dumbbell       = L.Dumbbell;
export const Leaf           = L.Leaf;
export const DollarSign     = L.DollarSign;
export const Palette        = L.Palette;
export const Droplets       = fallback('Droplets', 'Droplet');
export const Shirt          = fallback('Shirt', 'Tshirt');
export const Wrench         = L.Wrench;
export const Film           = L.Film;
export const Umbrella       = L.Umbrella;
export const Pencil         = fallback('Pencil', 'PenLine', 'Pen');
export const Trash2         = fallback('Trash2', 'Trash');
export const Plus           = L.Plus;
export const Calendar       = L.Calendar;
export const PiggyBank      = L.PiggyBank;
export const TrendingUp     = L.TrendingUp;
export const Clock          = L.Clock;
export const Wallet         = L.Wallet;
export const User           = L.User;
export const Sun            = L.Sun;
export const Moon           = L.Moon;
export const SlidersHorizontal = fallback('SlidersHorizontal', 'Sliders');
export const CircleDollarSign = fallback('CircleDollarSign', 'DollarSign');
export const AlertTriangle  = fallback('AlertTriangle', 'TriangleAlert', 'AlertCircle');
export const CheckCircle    = fallback('CheckCircle', 'CheckCircle2', 'Check');
export const Search         = L.Search;
export const Inbox          = L.Inbox;
export const ArrowRight     = L.ArrowRight;
export const Banknote       = fallback('Banknote', 'Banknote', 'DollarSign');
export const Download       = L.Download;
export const Bell           = L.Bell;
export const BellOff        = L.BellOff;
export const X              = L.X;
export const Camera         = L.Camera;
export const Settings       = fallback('Settings', 'Settings2', 'Cog');
export const WifiOff        = L.WifiOff;
export const Repeat         = L.Repeat;
export const AlertCircle    = fallback('AlertCircle', 'CircleAlert', 'AlertTriangle');
export const Sparkles       = L.Sparkles;
export const Flame          = L.Flame;
export const Wind           = L.Wind;
export const Zap            = L.Zap;
export const Smartphone     = L.Smartphone;
export const Laptop         = L.Laptop;
export const ChevronDown    = L.ChevronDown;
export const ChevronRight   = L.ChevronRight;
export const Target         = fallback('Target', 'Crosshair', 'Circle');
export const Save           = fallback('Save', 'SaveAll', 'Download');
export const Share2         = fallback('Share2', 'Share');

// Icons renamed/removed across versions - with safe fallbacks
export const House          = fallback('House', 'Home');
export const LayoutList     = fallback('LayoutList', 'List');
export const Coins          = fallback('Coins', 'Wallet', 'DollarSign');
export const BadgeDollarSign = fallback('BadgeDollarSign', 'CircleDollarSign', 'DollarSign');
export const ChartPie       = fallback('ChartPie', 'PieChart', 'BarChart2');
export const Flower2        = fallback('Flower2', 'Flower', 'Leaf');
export const PawPrint       = fallback('PawPrint', 'Footprints', 'Paw', 'Package');
export const Pizza          = fallback('Pizza', 'Utensils');
export const Beer           = fallback('Beer', 'BeerMug', 'Wine', 'Coffee');

export const Upload         = fallback('Upload', 'UploadCloud', 'ArrowUp');

// Alias
export const Calculator2    = fallback('Calculator', 'Plus');

export const Tag            = fallback('Tag', 'Hash', 'Bookmark');
export const Tags           = fallback('Tags', 'Bookmark', 'Hash');
export const CreditCard     = fallback('CreditCard', 'Wallet', 'DollarSign');
export const ImagePlus      = fallback('ImagePlus', 'Image', 'Camera');
export const Image          = fallback('Image', 'ImageIcon', 'Camera');
export const ZoomIn         = fallback('ZoomIn', 'Maximize', 'Search');
export const CheckCheck     = fallback('CheckCheck', 'Check', 'CheckCircle');
export const Hash           = fallback('Hash', 'Tag', 'Bookmark');
export const AlarmClock     = fallback('AlarmClock', 'Clock', 'Bell');
export const BellRing       = fallback('BellRing', 'Bell', 'BellOff');
