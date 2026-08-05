export interface PieItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  calories: number;
  rating: number;
  category: string;
  bgColor: string;          // Tailwind background color
  textColor: string;        // Text wall color class
  accentColor: string;      // Button/high contrast elements
  primaryColorHex: string;  // Hex for extra custom styles
  imageSrc: string;
  piPercentage: number;     // Fun Pi percentage
  ingredients: string[];
}

export const PIES_DATA: PieItem[] = [
  {
    id: "french_silk",
    name: "French Silk Pie",
    tagline: "Glazed Velvety Richness",
    description: "Delectable chocolate cookie base packed with silky smooth chocolate mousse and whipped cream spirals, decorated with thin chocolate curls and a premium chocolate glaze drizzle.",
    calories: 420,
    rating: 4.9,
    category: "Chocolaty & Silky",
    bgColor: "#e6d5bc",
    textColor: "text-[#d6c3a6]",
    accentColor: "text-[#543b2f]",
    primaryColorHex: "#e6d5bc",
    imageSrc: "/src/assets/images/french_silk_pie_1781617775605.jpg",
    piPercentage: 3.14159,
    ingredients: ["Cocoa cookie crust", "Chocolate mousse", "Whipped topping", "Dark chocolate curls", "Fudge drizzle"]
  },
  {
    id: "lemon_bar",
    name: "Creamy Lemon Bar",
    tagline: "Tangy Citrus Sunshine",
    description: "A gorgeous, buttery, scalloped sugar cookie shell filled with a vibrant, tangy, bright-yellow lemon curd filling, topped with a fresh cut thin lemon slice and a custom whipped dollop.",
    calories: 380,
    rating: 4.8,
    category: "Tart & Fruity",
    bgColor: "#f9ee73",
    textColor: "text-[#e2d558]",
    accentColor: "text-[#736a10]",
    primaryColorHex: "#f9ee73",
    imageSrc: "/src/assets/images/lemon_bar_pie_1781617790743.jpg",
    piPercentage: 31.41592,
    ingredients: ["Scalloped shortbread crust", "Tart lemon curd", "Sweet cream dollop", "Fresh physical lemon slice"]
  },
  {
    id: "key_lime",
    name: "Key Lime Pie",
    tagline: "Chilled tropical perfection",
    description: "A sweet graham-cracker cookie base loaded with an airy, chilled, key-lime custard, styled with micro-shavings of green lime rind and a juicy whole key-lime slice.",
    calories: 390,
    rating: 4.95,
    category: "Zesty & Refreshing",
    bgColor: "#b8e391",
    textColor: "text-[#a0cc79]",
    accentColor: "text-[#345c22]",
    primaryColorHex: "#b8e391",
    imageSrc: "/src/assets/images/key_lime_pie_1781617803963.jpg",
    piPercentage: 3.14159265,
    ingredients: ["Graham cookie base", "Chilled lime cream", "Sweet cream crown", "Fresh lime slice", "Zest sprinkles"]
  },
  {
    id: "boston_cream",
    name: "Boston Cream / Chocolate Pudding",
    tagline: "Gourmet Ganache Glaze",
    description: "A supreme vanilla custard pie cookie, lined beautifully with a circle of fresh whipped cream and topped with a deep gloss, perfectly smooth dark chocolate pudding mirror finish.",
    calories: 450,
    rating: 4.85,
    category: "Rich & Classic",
    bgColor: "#4a3428",
    textColor: "text-[#342217]",
    accentColor: "text-[#f5ebd6]",
    primaryColorHex: "#4a3428",
    imageSrc: "/src/assets/images/chocolate_pudding_pie_1781617815180.jpg",
    piPercentage: 314.1592,
    ingredients: ["Traditional pie crust cookie", "Vanilla pastry custard", "Dark chocolate pudding ganache", "Cream border"]
  },
  {
    id: "apple_crumble",
    name: "Apple Streusel Crumble",
    tagline: "Sweet Caramel Comfort",
    description: "A warm, spiced apple pie cookie filled with chunky baked cinnamon apples, completed with a massive crunch of golden baked streusel crumble and a warm caramel glaze.",
    calories: 410,
    rating: 4.92,
    category: "Warm & Crunchy",
    bgColor: "#e89d3e",
    textColor: "text-[#cf892e]",
    accentColor: "text-[#fffae6]",
    primaryColorHex: "#e89d3e",
    imageSrc: "/src/assets/images/apple_crumble_pie_1781617829726.jpg",
    piPercentage: 3.1415926535,
    ingredients: ["Crisp cookie shell", "Spiced gooey apples", "Oatmeal streusel crumble", "Caramel sauce", "Powdered sugar"]
  }
];
