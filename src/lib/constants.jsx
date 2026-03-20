export const DEFAULT_CATEGORIES = {
  food: { label: "Food & Drinks", labelId: "Makan & Minum", icon: "utensils", color: "#4ade80" },
  transport: { label: "Transport", labelId: "Transportasi", icon: "car", color: "#60a5fa" },
  date: { label: "Date", labelId: "Date", icon: "heart", color: "#f9a8d4" },
  shopping: { label: "Shopping", labelId: "Belanja", icon: "shoppingbag", color: "#f97316" },
  entertainment: { label: "Entertainment", labelId: "Hiburan", icon: "gamepad", color: "#c084fc" },
  health: { label: "Health", labelId: "Kesehatan", icon: "pill", color: "#f87171" },
  bills: { label: "Bills", labelId: "Tagihan", icon: "filetext", color: "#fbbf24" },
  pets: { label: "Pets", labelId: "Hewan Peliharaan", icon: "pawprint", color: "#fb923c" },
  other: { label: "Other", labelId: "Lainnya", icon: "package", color: "#94a3b8" },
};

export const THEMES = [
  { id: "green",  label: "Green",  labelId: "Hijau",  primary: "#166534", accent: "#4ade80" },
  { id: "blue",   label: "Blue",   labelId: "Biru",   primary: "#1e3a8a", accent: "#60a5fa" },
  { id: "purple", label: "Purple", labelId: "Ungu",   primary: "#4c1d95", accent: "#c084fc" },
  { id: "rose",   label: "Rose",   labelId: "Merah",  primary: "#881337", accent: "#fb7185" },
  { id: "orange", label: "Orange", labelId: "Oranye", primary: "#7c2d12", accent: "#fb923c" },
  { id: "teal",   label: "Teal",   labelId: "Tosca",  primary: "#134e4a", accent: "#2dd4bf" },
  { id: "custom", label: "Custom", labelId: "Kustom", primary: "#881337", accent: "#fb7185" },
];

export const ACCENT_COLORS = [
  "#4ade80","#86efac","#f9a8d4","#a3e635","#34d399",
  "#6ee7b7","#fbbf24","#94a3b8","#60a5fa","#f87171",
  "#c084fc","#fb923c","#38bdf8","#e879f9","#facc15",
];

export const ICON_OPTIONS = [
  "utensils","car","heart","shoppingbag","gamepad","pill","filetext","package",
  "coffee","pizza","plane","book","music","monitor","gift","dumbbell",
  "pawprint","leaf","dollar","palette","droplets","shirt","wrench","film",
  "beer","umbrella","flower","banknote",
];

export const LS = {
  LANG: "gm_lang",
  DARK_OVERRIDE: "gm_dark_override",
  FOLLOW_SYSTEM: "gm_follow_system",
  THEME_PRESET: "gm_theme_preset",
  CUSTOM_PRIMARY: "gm_custom_primary",
  CUSTOM_ACCENT: "gm_custom_accent",
  USERNAME: "gm_username",
  ONBOARDED: "gm_onboarded",
  TRANSACTIONS: "gm_transactions_clean",
  INCOME: "gm_income",
  SAVINGS: "gm_savings",
  CATEGORIES: "gm_categories",
  SAVINGS_GOALS: "gm_savings_goals",
  BUDGETS: "gm_budgets",
  OVERALL_BUDGET: "gm_overall_budget",
  RECURRING: "gm_recurring",
  DATE_WISHLIST: "gm_date_wishlist",
  PROFILE_PHOTO: "gm_profile_photo",
  CICILAN: "gm_cicilan",
  NAVBAR_OFFSET: "gm_navbar_offset",
};
