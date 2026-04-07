import { Recipe, FoodItem, Supplement } from '../types/library';

export const recipes: Recipe[] = [
  {
    "id": "1",
    "title": "Bol de Salmón y Quinoa",
    "image": "https://picsum.photos/seed/salmon/400/300",
    "category": "Alto en Proteína",
    "prepTime": 25,
    "calories": 450,
    "protein": 38,
    "carbs": 45,
    "fats": 14,
    "rating": 4.9,
    "tags": [
      "Sin Gluten",
      "Bajo en Carb"
    ]
  },
  {
    "id": "2",
    "title": "Batido Detox Verde",
    "image": "https://picsum.photos/seed/smoothie/400/300",
    "category": "Detox",
    "prepTime": 5,
    "calories": 180,
    "protein": 5,
    "carbs": 30,
    "fats": 2,
    "rating": 4.7,
    "tags": [
      "Vegano",
      "Crudo"
    ]
  },
  {
    "id": "3",
    "title": "Tostadas de Aguacate y Huevo",
    "image": "https://picsum.photos/seed/toast/400/300",
    "category": "Keto",
    "prepTime": 15,
    "calories": 320,
    "protein": 12,
    "carbs": 15,
    "fats": 25,
    "rating": 5,
    "tags": [
      "Desayuno",
      "Vegetariano"
    ]
  },
  {
    "id": "4",
    "title": "Ensalada Mediterránea",
    "image": "https://picsum.photos/seed/salad/400/300",
    "category": "Vegetariano",
    "prepTime": 10,
    "calories": 290,
    "protein": 8,
    "carbs": 20,
    "fats": 18,
    "rating": 4.5,
    "tags": [
      "Almuerzo",
      "Grasa Saludable"
    ]
  },
  {
    "id": "5",
    "title": "Pollo al Curry con Arroz",
    "image": "https://picsum.photos/seed/curry/400/300",
    "category": "Volumen",
    "prepTime": 30,
    "calories": 550,
    "protein": 42,
    "carbs": 65,
    "fats": 12,
    "rating": 4.8,
    "tags": [
      "Cena",
      "Energético"
    ]
  },
  {
    "id": "6",
    "title": "Tortilla de Espinacas",
    "image": "https://picsum.photos/seed/omelette/400/300",
    "category": "Ligero",
    "prepTime": 10,
    "calories": 240,
    "protein": 18,
    "carbs": 5,
    "fats": 16,
    "rating": 4.6,
    "tags": [
      "Cena",
      "Rápido"
    ]
  }
];

export const foodItems: FoodItem[] = [
  {
    "id": "import-1",
    "name": "Berenjena",
    "calories": 29.4,
    "protein": 1,
    "carbs": 5.9,
    "fats": 0.2,
    "servingSize": "100g"
  },
  {
    "id": "import-2",
    "name": "Aguacate",
    "calories": 223.3,
    "protein": 1.81,
    "carbs": 8.32,
    "fats": 20.31,
    "servingSize": "100g"
  },
  {
    "id": "import-3",
    "name": "Ternera Breakfast Salchicha",
    "calories": 325,
    "protein": 13.3,
    "carbs": 3.37,
    "fats": 28.7,
    "servingSize": "100g"
  },
  {
    "id": "import-4",
    "name": "Ternera Breakfast Salchicha Banquet Integral N Serve Salchicha Links Maple Flavor",
    "calories": 325,
    "protein": 13.3,
    "carbs": 3.37,
    "fats": 28.7,
    "servingSize": "100g"
  },
  {
    "id": "import-5",
    "name": "Ternera Breakfast Salchicha Eckrich Salchicha Links",
    "calories": 325,
    "protein": 13.3,
    "carbs": 3.37,
    "fats": 28.7,
    "servingSize": "100g"
  },
  {
    "id": "import-6",
    "name": "Beets",
    "calories": 44.6,
    "protein": 1.69,
    "carbs": 8.79,
    "fats": 0.3,
    "servingSize": "100g"
  },
  {
    "id": "import-7",
    "name": "Belly Cerdo",
    "calories": 380.5,
    "protein": 15.2,
    "carbs": -0.7,
    "fats": 35.83,
    "servingSize": "100g"
  },
  {
    "id": "import-8",
    "name": "Bison Picada",
    "calories": 158.8,
    "protein": 19.88,
    "carbs": -0.15,
    "fats": 8.88,
    "servingSize": "100g"
  },
  {
    "id": "import-9",
    "name": "Black en conserva Judías",
    "calories": 118.3,
    "protein": 6.91,
    "carbs": 19.81,
    "fats": 1.27,
    "servingSize": "100g"
  },
  {
    "id": "import-10",
    "name": "Black Unenriched Arroz",
    "calories": 370,
    "protein": 7.57,
    "carbs": 77.19,
    "fats": 3.44,
    "servingSize": "100g"
  },
  {
    "id": "import-11",
    "name": "Black-Eyed Pea en conserva Judías",
    "calories": 185,
    "protein": 23.6,
    "carbs": 19.81,
    "fats": 1.26,
    "servingSize": "100g"
  },
  {
    "id": "import-12",
    "name": "Black-Eyed Pea en conserva Sodium Added",
    "calories": 116.1,
    "protein": 6.92,
    "carbs": 19.17,
    "fats": 1.3,
    "servingSize": "100g"
  },
  {
    "id": "import-13",
    "name": "Black-Eyed Pea Dried",
    "calories": 354,
    "protein": 21.22,
    "carbs": 61.84,
    "fats": 2.42,
    "servingSize": "100g"
  },
  {
    "id": "import-14",
    "name": "Moras",
    "calories": 67.2,
    "protein": 1.53,
    "carbs": 14.57,
    "fats": 0.31,
    "servingSize": "100g"
  },
  {
    "id": "import-15",
    "name": "Arándanos",
    "calories": 63.9,
    "protein": 0.7,
    "carbs": 14.57,
    "fats": 0.31,
    "servingSize": "100g"
  },
  {
    "id": "import-16",
    "name": "Bok Choy Regular (Not Baby)",
    "calories": 20.2,
    "protein": 1.02,
    "carbs": 3.51,
    "fats": 0.23,
    "servingSize": "100g"
  },
  {
    "id": "import-17",
    "name": "Brazil Nuts",
    "calories": 663.6,
    "protein": 15.04,
    "carbs": 21.64,
    "fats": 57.43,
    "servingSize": "100g"
  },
  {
    "id": "import-18",
    "name": "Brócoli",
    "calories": 38.5,
    "protein": 2.57,
    "carbs": 6.29,
    "fats": 0.34,
    "servingSize": "100g"
  },
  {
    "id": "import-19",
    "name": "Integral Dried Lentejas",
    "calories": 360.2,
    "protein": 23.57,
    "carbs": 62.17,
    "fats": 1.92,
    "servingSize": "100g"
  },
  {
    "id": "import-20",
    "name": "Integral Grano largo Arroz",
    "calories": 365.6,
    "protein": 7.25,
    "carbs": 76.69,
    "fats": 3.31,
    "servingSize": "100g"
  },
  {
    "id": "import-21",
    "name": "Integral Arroz Grano largo Unenriched",
    "calories": 365.6,
    "protein": 7.25,
    "carbs": 76.69,
    "fats": 3.31,
    "servingSize": "100g"
  },
  {
    "id": "import-22",
    "name": "Brussels Brotes",
    "calories": 59.4,
    "protein": 3.98,
    "carbs": 9.62,
    "fats": 0.56,
    "servingSize": "100g"
  },
  {
    "id": "import-23",
    "name": "Trigo Sarraceno Dry",
    "calories": 369.8,
    "protein": 13.3,
    "carbs": 71.5,
    "fats": 3.4,
    "servingSize": "100g"
  },
  {
    "id": "import-24",
    "name": "Trigo Sarraceno Harina",
    "calories": 356.2,
    "protein": 11.07,
    "carbs": 71.13,
    "fats": 3.04,
    "servingSize": "100g"
  },
  {
    "id": "import-25",
    "name": "Trigo Sarraceno Entero Grain",
    "calories": 356.2,
    "protein": 11.07,
    "carbs": 71.13,
    "fats": 3.04,
    "servingSize": "100g"
  },
  {
    "id": "import-26",
    "name": "Bulgur Dried",
    "calories": 372.3,
    "protein": 11.76,
    "carbs": 75.88,
    "fats": 2.42,
    "servingSize": "100g"
  },
  {
    "id": "import-27",
    "name": "Mantequilla Stick Salted",
    "calories": 739.8,
    "protein": 0,
    "carbs": 0,
    "fats": 82.2,
    "servingSize": "100g"
  },
  {
    "id": "import-28",
    "name": "Mantequilla Stick Unsalted",
    "calories": 733.5,
    "protein": 0,
    "carbs": 0,
    "fats": 81.5,
    "servingSize": "100g"
  },
  {
    "id": "import-29",
    "name": "Suero de leche",
    "calories": 42.8,
    "protein": 3.46,
    "carbs": 4.81,
    "fats": 1.08,
    "servingSize": "100g"
  },
  {
    "id": "import-30",
    "name": "Repollo Bok Choy",
    "calories": 20.2,
    "protein": 1.02,
    "carbs": 3.51,
    "fats": 0.23,
    "servingSize": "100g"
  },
  {
    "id": "import-31",
    "name": "Repollo Verde",
    "calories": 31.4,
    "protein": 0.96,
    "carbs": 6.38,
    "fats": 0.23,
    "servingSize": "100g"
  },
  {
    "id": "import-32",
    "name": "Griego Yogur",
    "calories": 59.1,
    "protein": 10.3,
    "carbs": 3.64,
    "fats": 0.37,
    "servingSize": "100g"
  },
  {
    "id": "import-33",
    "name": "Verde Judías",
    "calories": 24.1,
    "protein": 1.04,
    "carbs": 4.11,
    "fats": 0.39,
    "servingSize": "100g"
  },
  {
    "id": "import-34",
    "name": "Picada Ternera",
    "calories": 189.2,
    "protein": 18.16,
    "carbs": 0.22,
    "fats": 12.85,
    "servingSize": "100g"
  },
  {
    "id": "import-35",
    "name": "Col rizada",
    "calories": 42.8,
    "protein": 2.92,
    "carbs": 4.42,
    "fats": 1.49,
    "servingSize": "100g"
  },
  {
    "id": "import-36",
    "name": "Kiwi",
    "calories": 64.2,
    "protein": 1.06,
    "carbs": 14,
    "fats": 0.44,
    "servingSize": "100g"
  },
  {
    "id": "import-37",
    "name": "Lamb Picada",
    "calories": 236.6,
    "protein": 17.46,
    "carbs": -0.25,
    "fats": 18.64,
    "servingSize": "100g"
  },
  {
    "id": "import-38",
    "name": "Lechuga Romaine",
    "calories": 18.4,
    "protein": 0.98,
    "carbs": 3.37,
    "fats": 0.11,
    "servingSize": "100g"
  },
  {
    "id": "import-39",
    "name": "Salmón",
    "calories": 133.7,
    "protein": 22.3,
    "carbs": 0,
    "fats": 4.94,
    "servingSize": "100g"
  },
  {
    "id": "import-40",
    "name": "Repollo Napa Leaf",
    "calories": 31.8,
    "protein": 1.06,
    "carbs": 6.38,
    "fats": 0.23,
    "servingSize": "100g"
  },
  {
    "id": "import-41",
    "name": "Repollo Rojo",
    "calories": 34,
    "protein": 1.24,
    "carbs": 6.79,
    "fats": 0.21,
    "servingSize": "100g"
  },
  {
    "id": "import-42",
    "name": "en conserva Diced Tomatoes",
    "calories": 27,
    "protein": 0.85,
    "carbs": 4.9,
    "fats": 0.45,
    "servingSize": "100g"
  },
  {
    "id": "import-43",
    "name": "en conserva Rojo Tomatoes",
    "calories": 21.1,
    "protein": 0.84,
    "carbs": 3.32,
    "fats": 0.5,
    "servingSize": "100g"
  },
  {
    "id": "import-44",
    "name": "en conserva Atún",
    "calories": 84.8,
    "protein": 19,
    "carbs": 0.08,
    "fats": 0.94,
    "servingSize": "100g"
  },
  {
    "id": "import-45",
    "name": "Cannellini en conserva Judías",
    "calories": 115.4,
    "protein": 7.41,
    "carbs": 18.82,
    "fats": 1.17,
    "servingSize": "100g"
  },
  {
    "id": "import-46",
    "name": "Cannellini Dried Judías",
    "calories": 345.2,
    "protein": 21.56,
    "carbs": 59.8,
    "fats": 2.2,
    "servingSize": "100g"
  },
  {
    "id": "import-47",
    "name": "Canola Aceite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-48",
    "name": "Cantaloupe",
    "calories": 37.5,
    "protein": 0.82,
    "carbs": 8.16,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-49",
    "name": "Gamba",
    "calories": 71.4,
    "protein": 15.57,
    "carbs": 0.48,
    "fats": 0.8,
    "servingSize": "100g"
  },
  {
    "id": "import-50",
    "name": "Soy Leche",
    "calories": 40.8,
    "protein": 2.78,
    "carbs": 3,
    "fats": 1.96,
    "servingSize": "100g"
  },
  {
    "id": "import-51",
    "name": "Squash Calabacín",
    "calories": 35.1,
    "protein": 0.94,
    "carbs": 7.44,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-52",
    "name": "Fresas",
    "calories": 35.1,
    "protein": 0.64,
    "carbs": 7.63,
    "fats": 0.22,
    "servingSize": "100g"
  },
  {
    "id": "import-53",
    "name": "Azúcar Granulated Blanco",
    "calories": 401.3,
    "protein": 0,
    "carbs": 99.6,
    "fats": 0.32,
    "servingSize": "100g"
  },
  {
    "id": "import-54",
    "name": "Tilapia",
    "calories": 98.3,
    "protein": 19,
    "carbs": 0,
    "fats": 2.48,
    "servingSize": "100g"
  },
  {
    "id": "import-55",
    "name": "Entero Wheat Pan",
    "calories": 253.6,
    "protein": 12.3,
    "carbs": 43.1,
    "fats": 3.55,
    "servingSize": "100g"
  },
  {
    "id": "import-56",
    "name": "Pechuga de Pollo",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fats": 3.6,
    "servingSize": "100g"
  },
  {
    "id": "import-57",
    "name": "Arroz Blanco",
    "calories": 130,
    "protein": 2.7,
    "carbs": 28,
    "fats": 0.3,
    "servingSize": "100g"
  },
  {
    "id": "import-58",
    "name": "Huevo Cocido",
    "calories": 155,
    "protein": 13,
    "carbs": 1.1,
    "fats": 11,
    "servingSize": "100g"
  },
  {
    "id": "import-59",
    "name": "Brócoli",
    "calories": 34,
    "protein": 2.8,
    "carbs": 6.6,
    "fats": 0.4,
    "servingSize": "100g"
  },
  {
    "id": "import-60",
    "name": "Salmón",
    "calories": 208,
    "protein": 20,
    "carbs": 0,
    "fats": 13,
    "servingSize": "100g"
  },
  {
    "id": "import-61",
    "name": "Avena",
    "calories": 389,
    "protein": 16.9,
    "carbs": 66,
    "fats": 6.9,
    "servingSize": "100g"
  },
  {
    "id": "import-62",
    "name": "Aguacate",
    "calories": 160,
    "protein": 2,
    "carbs": 8.5,
    "fats": 15,
    "servingSize": "100g"
  },
  {
    "id": "import-63",
    "name": "Carrots Baby",
    "calories": 40.8,
    "protein": 0.8,
    "carbs": 9.08,
    "fats": 0.14,
    "servingSize": "100g"
  },
  {
    "id": "import-64",
    "name": "Carrots Frozen Unprepared",
    "calories": 39.2,
    "protein": 0.81,
    "carbs": 7.92,
    "fats": 0.47,
    "servingSize": "100g"
  },
  {
    "id": "import-65",
    "name": "Carrots Mature",
    "calories": 48,
    "protein": 0.94,
    "carbs": 10.27,
    "fats": 0.35,
    "servingSize": "100g"
  },
  {
    "id": "import-66",
    "name": "Cashews",
    "calories": 564.7,
    "protein": 17.44,
    "carbs": 36.29,
    "fats": 38.86,
    "servingSize": "100g"
  },
  {
    "id": "import-67",
    "name": "Cassava Harina",
    "calories": 357.3,
    "protein": 0.92,
    "carbs": 87.31,
    "fats": 0.49,
    "servingSize": "100g"
  },
  {
    "id": "import-68",
    "name": "Catfish",
    "calories": 131.7,
    "protein": 16.47,
    "carbs": 0,
    "fats": 7.31,
    "servingSize": "100g"
  },
  {
    "id": "import-69",
    "name": "Cauliflower",
    "calories": 27.6,
    "protein": 1.64,
    "carbs": 4.72,
    "fats": 0.24,
    "servingSize": "100g"
  },
  {
    "id": "import-70",
    "name": "Apio",
    "calories": 16.7,
    "protein": 0.49,
    "carbs": 3.32,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-71",
    "name": "Cheddar Queso",
    "calories": 409,
    "protein": 23.3,
    "carbs": 2.44,
    "fats": 34,
    "servingSize": "100g"
  },
  {
    "id": "import-72",
    "name": "Cheddar Queso en lonchas",
    "calories": 409,
    "protein": 23.3,
    "carbs": 2.44,
    "fats": 34,
    "servingSize": "100g"
  },
  {
    "id": "import-73",
    "name": "Cheddar Natural Shredded Mild Queso",
    "calories": 321,
    "protein": 22.62,
    "carbs": 2.96,
    "fats": 24.3,
    "servingSize": "100g"
  },
  {
    "id": "import-74",
    "name": "Cheddar Natural Shredded Sharp Queso",
    "calories": 321,
    "protein": 22.62,
    "carbs": 2.96,
    "fats": 24.3,
    "servingSize": "100g"
  },
  {
    "id": "import-75",
    "name": "Cerezas Dark Rojo Dulce",
    "calories": 70.5,
    "protein": 1.04,
    "carbs": 16.16,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-76",
    "name": "Cerezas Dulce Dark Rojo",
    "calories": 70.5,
    "protein": 1.04,
    "carbs": 16.16,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-77",
    "name": "Chestnut Harina",
    "calories": 384.7,
    "protein": 5.29,
    "carbs": 80.45,
    "fats": 4.64,
    "servingSize": "100g"
  },
  {
    "id": "import-78",
    "name": "Chia Seeds Dried",
    "calories": 517.1,
    "protein": 17.01,
    "carbs": 38.27,
    "fats": 32.89,
    "servingSize": "100g"
  },
  {
    "id": "import-79",
    "name": "Chia Seeds Entero Dried",
    "calories": 517.1,
    "protein": 17.01,
    "carbs": 38.27,
    "fats": 32.89,
    "servingSize": "100g"
  },
  {
    "id": "import-80",
    "name": "Pollo Pechuga",
    "calories": 126.9,
    "protein": 21.41,
    "carbs": -0.43,
    "fats": 4.78,
    "servingSize": "100g"
  },
  {
    "id": "import-81",
    "name": "Pollo Muslo",
    "calories": 125,
    "protein": 18.36,
    "carbs": -0.48,
    "fats": 5.94,
    "servingSize": "100g"
  },
  {
    "id": "import-82",
    "name": "Pollo Contramuslo",
    "calories": 187.9,
    "protein": 17.11,
    "carbs": -0.17,
    "fats": 13.35,
    "servingSize": "100g"
  },
  {
    "id": "import-83",
    "name": "Pollo Alita",
    "calories": 167.6,
    "protein": 18.41,
    "carbs": -0.46,
    "fats": 10.64,
    "servingSize": "100g"
  },
  {
    "id": "import-84",
    "name": "Chickpeas",
    "calories": 383,
    "protein": 21.28,
    "carbs": 60.36,
    "fats": 6.27,
    "servingSize": "100g"
  },
  {
    "id": "import-85",
    "name": "Almendra Mantequilla Cremosa",
    "calories": 645.5,
    "protein": 20.79,
    "carbs": 21.24,
    "fats": 53.04,
    "servingSize": "100g"
  },
  {
    "id": "import-86",
    "name": "Almendra Leche",
    "calories": 14.5,
    "protein": 0.55,
    "carbs": 0.34,
    "fats": 1.22,
    "servingSize": "100g"
  },
  {
    "id": "import-87",
    "name": "Amaranth Harina",
    "calories": 384.1,
    "protein": 13.21,
    "carbs": 68.78,
    "fats": 6.24,
    "servingSize": "100g"
  },
  {
    "id": "import-88",
    "name": "American Queso Pasteurizado Procesado",
    "calories": 368.5,
    "protein": 18,
    "carbs": 5.27,
    "fats": 30.6,
    "servingSize": "100g"
  },
  {
    "id": "import-89",
    "name": "American Pasteurizado Prepared Queso Product With Added Vitamin D en lonchas Individualmente Envuelto",
    "calories": 368.5,
    "protein": 18,
    "carbs": 5.27,
    "fats": 30.6,
    "servingSize": "100g"
  },
  {
    "id": "import-90",
    "name": "American Pasteurizado Procesado Queso Food en lonchas Individualmente Envuelto",
    "calories": 309.8,
    "protein": 15.57,
    "carbs": 8.19,
    "fats": 23.86,
    "servingSize": "100g"
  },
  {
    "id": "import-91",
    "name": "American Pasteurizado Procesado Queso Food With Added Vitamin D en lonchas Individualmente Envuelto",
    "calories": 368.5,
    "protein": 18,
    "carbs": 5.27,
    "fats": 30.6,
    "servingSize": "100g"
  },
  {
    "id": "import-92",
    "name": "American Pasteurizado Procesado Queso Product en lonchas Individualmente Envuelto",
    "calories": 309.8,
    "protein": 15.57,
    "carbs": 8.19,
    "fats": 23.86,
    "servingSize": "100g"
  },
  {
    "id": "import-93",
    "name": "Manzana Zumo",
    "calories": 48.4,
    "protein": 0.09,
    "carbs": 11.36,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-94",
    "name": "Puré de manzana",
    "calories": 51.6,
    "protein": 0.27,
    "carbs": 12.26,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-95",
    "name": "Albaricoque",
    "calories": 48.4,
    "protein": 0.96,
    "carbs": 10.24,
    "fats": 0.4,
    "servingSize": "100g"
  },
  {
    "id": "import-96",
    "name": "Albaricoque sin hueso",
    "calories": 48.4,
    "protein": 0.96,
    "carbs": 10.24,
    "fats": 0.4,
    "servingSize": "100g"
  },
  {
    "id": "import-97",
    "name": "Rúcula",
    "calories": 31,
    "protein": 1.65,
    "carbs": 5.37,
    "fats": 0.32,
    "servingSize": "100g"
  },
  {
    "id": "import-98",
    "name": "Espárrago",
    "calories": 28.1,
    "protein": 1.44,
    "carbs": 5.1,
    "fats": 0.22,
    "servingSize": "100g"
  },
  {
    "id": "import-99",
    "name": "Sauce Pasta Ragu Old World",
    "calories": 42.8,
    "protein": 1.42,
    "carbs": 7.4,
    "fats": 0.84,
    "servingSize": "100g"
  },
  {
    "id": "import-100",
    "name": "Sauce Pasta Spaghetti/Marinara",
    "calories": 51.2,
    "protein": 1.41,
    "carbs": 8.05,
    "fats": 1.48,
    "servingSize": "100g"
  },
  {
    "id": "import-101",
    "name": "Sauce Salsa Ready-To-Serve",
    "calories": 34.4,
    "protein": 1.44,
    "carbs": 6.74,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-102",
    "name": "Salchicha Breakfast Salchicha Ternera Pre-",
    "calories": 325,
    "protein": 13.3,
    "carbs": 3.37,
    "fats": 28.7,
    "servingSize": "100g"
  },
  {
    "id": "import-103",
    "name": "Salchicha Italian Cerdo Mild",
    "calories": 317.2,
    "protein": 18.2,
    "carbs": 2.15,
    "fats": 26.2,
    "servingSize": "100g"
  },
  {
    "id": "import-104",
    "name": "Chickpeas en conserva",
    "calories": 137.3,
    "protein": 7.02,
    "carbs": 20.32,
    "fats": 3.1,
    "servingSize": "100g"
  },
  {
    "id": "import-105",
    "name": "Chickpeas en conserva Judías",
    "calories": 185,
    "protein": 23.6,
    "carbs": 19.81,
    "fats": 1.26,
    "servingSize": "100g"
  },
  {
    "id": "import-106",
    "name": "Chickpeas Dried Judías",
    "calories": 185,
    "protein": 23.6,
    "carbs": 19.81,
    "fats": 1.26,
    "servingSize": "100g"
  },
  {
    "id": "import-107",
    "name": "Chuleta Center Cut Cerdo",
    "calories": 138.3,
    "protein": 22.81,
    "carbs": -0.56,
    "fats": 5.48,
    "servingSize": "100g"
  },
  {
    "id": "import-108",
    "name": "Chorizo Cerdo Salchicha",
    "calories": 340.6,
    "protein": 19.3,
    "carbs": 2.63,
    "fats": 28.1,
    "servingSize": "100g"
  },
  {
    "id": "import-109",
    "name": "Chorizo Cerdo Salchicha Johnsonville",
    "calories": 340.6,
    "protein": 19.3,
    "carbs": 2.63,
    "fats": 28.1,
    "servingSize": "100g"
  },
  {
    "id": "import-110",
    "name": "Chuck Asado Ternera",
    "calories": 234.7,
    "protein": 18.4,
    "carbs": 0.22,
    "fats": 17.8,
    "servingSize": "100g"
  },
  {
    "id": "import-111",
    "name": "Coconut Harina",
    "calories": 437.7,
    "protein": 16.14,
    "carbs": 58.9,
    "fats": 15.28,
    "servingSize": "100g"
  },
  {
    "id": "import-112",
    "name": "Coconut Aceite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-113",
    "name": "Bacalao",
    "calories": 70.3,
    "protein": 16.07,
    "carbs": 0,
    "fats": 0.67,
    "servingSize": "100g"
  },
  {
    "id": "import-114",
    "name": "Collards",
    "calories": 46.9,
    "protein": 2.97,
    "carbs": 7.02,
    "fats": 0.77,
    "servingSize": "100g"
  },
  {
    "id": "import-115",
    "name": "Cookies Oatmeal Soft",
    "calories": 430.3,
    "protein": 5.79,
    "carbs": 69.6,
    "fats": 14.3,
    "servingSize": "100g"
  },
  {
    "id": "import-116",
    "name": "Corn Harina Masa Harina Blanco",
    "calories": 376.1,
    "protein": 7.56,
    "carbs": 76.69,
    "fats": 4.34,
    "servingSize": "100g"
  },
  {
    "id": "import-117",
    "name": "Corn Harina Masa Harina Blanco Or Amarillo",
    "calories": 376.1,
    "protein": 7.56,
    "carbs": 76.69,
    "fats": 4.34,
    "servingSize": "100g"
  },
  {
    "id": "import-118",
    "name": "Corn Harina Masa Harina Amarillo",
    "calories": 376.1,
    "protein": 7.56,
    "carbs": 76.69,
    "fats": 4.34,
    "servingSize": "100g"
  },
  {
    "id": "import-119",
    "name": "Corn Aceite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-120",
    "name": "Cotija Queso",
    "calories": 321,
    "protein": 22.62,
    "carbs": 2.96,
    "fats": 24.3,
    "servingSize": "100g"
  },
  {
    "id": "import-121",
    "name": "Cotija Solid Queso",
    "calories": 351.4,
    "protein": 23.84,
    "carbs": 2.72,
    "fats": 27.24,
    "servingSize": "100g"
  },
  {
    "id": "import-122",
    "name": "Cottage Queso",
    "calories": 81.9,
    "protein": 11,
    "carbs": 4.31,
    "fats": 2.3,
    "servingSize": "100g"
  },
  {
    "id": "import-123",
    "name": "Cottage Queso Grande Curd",
    "calories": 102.9,
    "protein": 11.62,
    "carbs": 4.6,
    "fats": 4.22,
    "servingSize": "100g"
  },
  {
    "id": "import-124",
    "name": "Cottage Queso Grande Or Small Curd",
    "calories": 102.9,
    "protein": 11.62,
    "carbs": 4.6,
    "fats": 4.22,
    "servingSize": "100g"
  },
  {
    "id": "import-125",
    "name": "Cottage Queso Small Curd",
    "calories": 102.9,
    "protein": 11.62,
    "carbs": 4.6,
    "fats": 4.22,
    "servingSize": "100g"
  },
  {
    "id": "import-126",
    "name": "Courgette",
    "calories": 19.9,
    "protein": 1.2,
    "carbs": 3.1,
    "fats": 0.3,
    "servingSize": "100g"
  },
  {
    "id": "import-127",
    "name": "Cangrejo",
    "calories": 81.9,
    "protein": 18.65,
    "carbs": 0,
    "fats": 0.81,
    "servingSize": "100g"
  },
  {
    "id": "import-128",
    "name": "Harina",
    "calories": 357.1,
    "protein": 11.4,
    "carbs": 74.45,
    "fats": 1.52,
    "servingSize": "100g"
  },
  {
    "id": "import-129",
    "name": "Harina All-Purpose",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-130",
    "name": "Harina All-Purpose (Unenriched)",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-131",
    "name": "Harina Almendra",
    "calories": 622,
    "protein": 26.24,
    "carbs": 16.25,
    "fats": 50.23,
    "servingSize": "100g"
  },
  {
    "id": "import-132",
    "name": "Harina Almendra Blanched",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-133",
    "name": "Harina Amaranth",
    "calories": 384.1,
    "protein": 13.21,
    "carbs": 68.78,
    "fats": 6.24,
    "servingSize": "100g"
  },
  {
    "id": "import-134",
    "name": "Harina Barley",
    "calories": 366.5,
    "protein": 8.72,
    "carbs": 77.4,
    "fats": 2.45,
    "servingSize": "100g"
  },
  {
    "id": "import-135",
    "name": "Harina Pan Blanco",
    "calories": 363.2,
    "protein": 14.3,
    "carbs": 72.8,
    "fats": 1.65,
    "servingSize": "100g"
  },
  {
    "id": "import-136",
    "name": "Harina Pan Blanco (Enriched)",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-137",
    "name": "Harina Trigo Sarraceno",
    "calories": 357.9,
    "protein": 8.88,
    "carbs": 75.02,
    "fats": 2.48,
    "servingSize": "100g"
  },
  {
    "id": "import-138",
    "name": "Harina Cassava",
    "calories": 357.3,
    "protein": 0.92,
    "carbs": 87.31,
    "fats": 0.49,
    "servingSize": "100g"
  },
  {
    "id": "import-139",
    "name": "Harina Chestnut",
    "calories": 384.7,
    "protein": 5.29,
    "carbs": 80.45,
    "fats": 4.64,
    "servingSize": "100g"
  },
  {
    "id": "import-140",
    "name": "Harina Coconut",
    "calories": 437.7,
    "protein": 16.14,
    "carbs": 58.9,
    "fats": 15.28,
    "servingSize": "100g"
  },
  {
    "id": "import-141",
    "name": "Harina Corn Amarillo",
    "calories": 363.7,
    "protein": 6.2,
    "carbs": 80.8,
    "fats": 1.74,
    "servingSize": "100g"
  },
  {
    "id": "import-142",
    "name": "Harina Oat Entero Grain",
    "calories": 389.2,
    "protein": 13.17,
    "carbs": 69.92,
    "fats": 6.31,
    "servingSize": "100g"
  },
  {
    "id": "import-143",
    "name": "Harina Pastry Unenriched",
    "calories": 358.6,
    "protein": 8.75,
    "carbs": 77.2,
    "fats": 1.64,
    "servingSize": "100g"
  },
  {
    "id": "import-144",
    "name": "Harina Pastry Blanco",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-145",
    "name": "Harina Patata",
    "calories": 360.8,
    "protein": 8.11,
    "carbs": 79.94,
    "fats": 0.95,
    "servingSize": "100g"
  },
  {
    "id": "import-146",
    "name": "Harina Quinoa",
    "calories": 385.2,
    "protein": 11.92,
    "carbs": 69.52,
    "fats": 6.6,
    "servingSize": "100g"
  },
  {
    "id": "import-147",
    "name": "Harina Arroz Integral",
    "calories": 365.4,
    "protein": 7.19,
    "carbs": 75.5,
    "fats": 3.85,
    "servingSize": "100g"
  },
  {
    "id": "import-148",
    "name": "Harina Arroz Glutenous",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-149",
    "name": "Harina Arroz Glutinous",
    "calories": 357.6,
    "protein": 6.69,
    "carbs": 80.1,
    "fats": 1.16,
    "servingSize": "100g"
  },
  {
    "id": "import-150",
    "name": "Entero Leche Yogur",
    "calories": 77.9,
    "protein": 3.82,
    "carbs": 5.57,
    "fats": 4.48,
    "servingSize": "100g"
  },
  {
    "id": "import-151",
    "name": "Entero-Wheat Commercially Prepared Pan",
    "calories": 253.6,
    "protein": 12.3,
    "carbs": 43.1,
    "fats": 3.55,
    "servingSize": "100g"
  },
  {
    "id": "import-152",
    "name": "Wild Arroz Dried",
    "calories": 369.1,
    "protein": 12.79,
    "carbs": 75.67,
    "fats": 1.7,
    "servingSize": "100g"
  },
  {
    "id": "import-153",
    "name": "Cranberry Zumo",
    "calories": 32.1,
    "protein": 0,
    "carbs": 7.26,
    "fats": 0.34,
    "servingSize": "100g"
  },
  {
    "id": "import-154",
    "name": "Cream Queso Block",
    "calories": 342.8,
    "protein": 5.79,
    "carbs": 4.56,
    "fats": 33.49,
    "servingSize": "100g"
  },
  {
    "id": "import-155",
    "name": "Cream Heavy",
    "calories": 343.3,
    "protein": 2.02,
    "carbs": 3.8,
    "fats": 35.56,
    "servingSize": "100g"
  },
  {
    "id": "import-156",
    "name": "Cream Sour",
    "calories": 196.4,
    "protein": 3.07,
    "carbs": 5.56,
    "fats": 17.99,
    "servingSize": "100g"
  },
  {
    "id": "import-157",
    "name": "Crimini Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-158",
    "name": "Crushed en conserva Tomatoes",
    "calories": 37.9,
    "protein": 1.44,
    "carbs": 7.14,
    "fats": 0.4,
    "servingSize": "100g"
  },
  {
    "id": "import-159",
    "name": "Pepino",
    "calories": 15.9,
    "protein": 0.62,
    "carbs": 2.95,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-160",
    "name": "Diced en conserva Tomatoes",
    "calories": 27,
    "protein": 0.85,
    "carbs": 4.9,
    "fats": 0.45,
    "servingSize": "100g"
  },
  {
    "id": "import-161",
    "name": "Dried Black Judías",
    "calories": 189.9,
    "protein": 24.4,
    "carbs": 19.81,
    "fats": 1.45,
    "servingSize": "100g"
  },
  {
    "id": "import-162",
    "name": "Dried Integral Judías",
    "calories": 191.7,
    "protein": 25.6,
    "carbs": 19.81,
    "fats": 1.12,
    "servingSize": "100g"
  },
  {
    "id": "import-163",
    "name": "Dried Carioca Judías",
    "calories": 193,
    "protein": 25.2,
    "carbs": 19.81,
    "fats": 1.44,
    "servingSize": "100g"
  },
  {
    "id": "import-164",
    "name": "Dried Cranberry Judías",
    "calories": 187.9,
    "protein": 24.4,
    "carbs": 19.81,
    "fats": 1.23,
    "servingSize": "100g"
  },
  {
    "id": "import-165",
    "name": "Dried Dark Rojo Kidney Judías",
    "calories": 194.6,
    "protein": 25.9,
    "carbs": 19.81,
    "fats": 1.31,
    "servingSize": "100g"
  },
  {
    "id": "import-166",
    "name": "Dried Flor De Mayo Judías",
    "calories": 180.2,
    "protein": 23.3,
    "carbs": 19.81,
    "fats": 0.86,
    "servingSize": "100g"
  },
  {
    "id": "import-167",
    "name": "Dried Great Northern Judías",
    "calories": 189.2,
    "protein": 24.7,
    "carbs": 19.81,
    "fats": 1.24,
    "servingSize": "100g"
  },
  {
    "id": "import-168",
    "name": "Dried Lentejas",
    "calories": 360.2,
    "protein": 23.57,
    "carbs": 62.17,
    "fats": 1.92,
    "servingSize": "100g"
  },
  {
    "id": "import-169",
    "name": "Dried Light Rojo Kidney Judías",
    "calories": 188.5,
    "protein": 25,
    "carbs": 19.81,
    "fats": 1.03,
    "servingSize": "100g"
  },
  {
    "id": "import-170",
    "name": "Dried Light Tan Judías",
    "calories": 189.2,
    "protein": 24.6,
    "carbs": 19.81,
    "fats": 1.28,
    "servingSize": "100g"
  },
  {
    "id": "import-171",
    "name": "Dried Medium Rojo Judías",
    "calories": 190.6,
    "protein": 25.5,
    "carbs": 19.81,
    "fats": 1.04,
    "servingSize": "100g"
  },
  {
    "id": "import-172",
    "name": "Dried Navy Judías",
    "calories": 189.2,
    "protein": 24.1,
    "carbs": 19.81,
    "fats": 1.51,
    "servingSize": "100g"
  },
  {
    "id": "import-173",
    "name": "Dried Pink Judías",
    "calories": 183.6,
    "protein": 23.4,
    "carbs": 19.81,
    "fats": 1.2,
    "servingSize": "100g"
  },
  {
    "id": "import-174",
    "name": "Dried Pinto Judías",
    "calories": 185.2,
    "protein": 23.7,
    "carbs": 19.81,
    "fats": 1.24,
    "servingSize": "100g"
  },
  {
    "id": "import-175",
    "name": "Dried Rojo Judías",
    "calories": 174.9,
    "protein": 21.3,
    "carbs": 19.81,
    "fats": 1.16,
    "servingSize": "100g"
  },
  {
    "id": "import-176",
    "name": "Dried Salted Almonds",
    "calories": 666.6,
    "protein": 20.4,
    "carbs": 16.2,
    "fats": 57.8,
    "servingSize": "100g"
  },
  {
    "id": "import-177",
    "name": "Dried Small Rojo Judías",
    "calories": 184.8,
    "protein": 23.5,
    "carbs": 19.81,
    "fats": 1.28,
    "servingSize": "100g"
  },
  {
    "id": "import-178",
    "name": "Dried Small Blanco Judías",
    "calories": 189.1,
    "protein": 24.5,
    "carbs": 19.81,
    "fats": 1.32,
    "servingSize": "100g"
  },
  {
    "id": "import-179",
    "name": "Dried Tan Judías",
    "calories": 196.7,
    "protein": 26.8,
    "carbs": 19.81,
    "fats": 1.14,
    "servingSize": "100g"
  },
  {
    "id": "import-180",
    "name": "Dried Blanco Queso Seco Queso",
    "calories": 325,
    "protein": 24.5,
    "carbs": 2.07,
    "fats": 24.3,
    "servingSize": "100g"
  },
  {
    "id": "import-181",
    "name": "Eggplant",
    "calories": 26.1,
    "protein": 0.85,
    "carbs": 5.4,
    "fats": 0.12,
    "servingSize": "100g"
  },
  {
    "id": "import-182",
    "name": "Eggplant Italian",
    "calories": 26.1,
    "protein": 0.85,
    "carbs": 5.4,
    "fats": 0.12,
    "servingSize": "100g"
  },
  {
    "id": "import-183",
    "name": "Einkorn Grain Dried",
    "calories": 369.4,
    "protein": 15.12,
    "carbs": 68.65,
    "fats": 3.81,
    "servingSize": "100g"
  },
  {
    "id": "import-184",
    "name": "Einkorn Grain Wheat Berry",
    "calories": 369.4,
    "protein": 15.12,
    "carbs": 68.65,
    "fats": 3.81,
    "servingSize": "100g"
  },
  {
    "id": "import-185",
    "name": "Enoki Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-186",
    "name": "Eye Of Round Asado/Filete Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-187",
    "name": "Farro Pearled Dried",
    "calories": 367,
    "protein": 12.64,
    "carbs": 72.13,
    "fats": 3.1,
    "servingSize": "100g"
  },
  {
    "id": "import-188",
    "name": "Feta Entero Leche Crumbled Queso",
    "calories": 272.9,
    "protein": 19.71,
    "carbs": 5.58,
    "fats": 19.08,
    "servingSize": "100g"
  },
  {
    "id": "import-189",
    "name": "Figs",
    "calories": 277.1,
    "protein": 3.3,
    "carbs": 63.9,
    "fats": 0.92,
    "servingSize": "100g"
  },
  {
    "id": "import-190",
    "name": "Figs Dried Uncooked",
    "calories": 277.1,
    "protein": 3.3,
    "carbs": 63.9,
    "fats": 0.92,
    "servingSize": "100g"
  },
  {
    "id": "import-191",
    "name": "Figs Mission Dried",
    "calories": 277.1,
    "protein": 3.3,
    "carbs": 63.9,
    "fats": 0.92,
    "servingSize": "100g"
  },
  {
    "id": "import-192",
    "name": "Flank Filete Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-193",
    "name": "Flaxseed Picada",
    "calories": 545.1,
    "protein": 18.04,
    "carbs": 34.36,
    "fats": 37.28,
    "servingSize": "100g"
  },
  {
    "id": "import-194",
    "name": "Harina Arroz Blanco",
    "calories": 358.7,
    "protein": 6.94,
    "carbs": 79.8,
    "fats": 1.3,
    "servingSize": "100g"
  },
  {
    "id": "import-195",
    "name": "Harina Rye",
    "calories": 359.4,
    "protein": 8.4,
    "carbs": 77.16,
    "fats": 1.91,
    "servingSize": "100g"
  },
  {
    "id": "import-196",
    "name": "Harina Semolina Coarse",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-197",
    "name": "Harina Semolina Coarse And Semi-Coarse",
    "calories": 356.6,
    "protein": 11.73,
    "carbs": 73.82,
    "fats": 1.6,
    "servingSize": "100g"
  },
  {
    "id": "import-198",
    "name": "Harina Semolina Fine",
    "calories": 357.8,
    "protein": 13.33,
    "carbs": 71.99,
    "fats": 1.84,
    "servingSize": "100g"
  },
  {
    "id": "import-199",
    "name": "Harina Semolina Semi-Coarse",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-200",
    "name": "Harina Sorghum",
    "calories": 375,
    "protein": 8.27,
    "carbs": 77.39,
    "fats": 3.59,
    "servingSize": "100g"
  },
  {
    "id": "import-201",
    "name": "Harina Soy",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-202",
    "name": "Harina Soy Defatted",
    "calories": 366,
    "protein": 51.1,
    "carbs": 32.9,
    "fats": 3.33,
    "servingSize": "100g"
  },
  {
    "id": "import-203",
    "name": "Harina Soy Full-Fat",
    "calories": 452.3,
    "protein": 38.6,
    "carbs": 27.9,
    "fats": 20.7,
    "servingSize": "100g"
  },
  {
    "id": "import-204",
    "name": "Harina Spelt Entero Grain",
    "calories": 363.7,
    "protein": 14.48,
    "carbs": 70.72,
    "fats": 2.54,
    "servingSize": "100g"
  },
  {
    "id": "import-205",
    "name": "Harina Wheat All-Purpose",
    "calories": 366.1,
    "protein": 10.9,
    "carbs": 77.3,
    "fats": 1.48,
    "servingSize": "100g"
  },
  {
    "id": "import-206",
    "name": "Harina Entero Grain Oat",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-207",
    "name": "Harina Entero Wheat",
    "calories": 365.8,
    "protein": 11.15,
    "carbs": 74.73,
    "fats": 2.47,
    "servingSize": "100g"
  },
  {
    "id": "import-208",
    "name": "Harina Entero Wheat Unenriched",
    "calories": 369.8,
    "protein": 15.1,
    "carbs": 71.2,
    "fats": 2.73,
    "servingSize": "100g"
  },
  {
    "id": "import-209",
    "name": "Fluid Leche",
    "calories": 42.8,
    "protein": 3.38,
    "carbs": 5.19,
    "fats": 0.95,
    "servingSize": "100g"
  },
  {
    "id": "import-210",
    "name": "Fluid With Added Vitamin A And Vitamin D Leche",
    "calories": 34,
    "protein": 3.43,
    "carbs": 4.89,
    "fats": 0.08,
    "servingSize": "100g"
  },
  {
    "id": "import-211",
    "name": "Fonio Grain Dried",
    "calories": 369.1,
    "protein": 7.17,
    "carbs": 81.31,
    "fats": 1.69,
    "servingSize": "100g"
  },
  {
    "id": "import-212",
    "name": "Frankfurter Ternera Unheated",
    "calories": 310.4,
    "protein": 11.7,
    "carbs": 2.89,
    "fats": 28,
    "servingSize": "100g"
  },
  {
    "id": "import-213",
    "name": "Fuji Apples",
    "calories": 64.8,
    "protein": 0.15,
    "carbs": 15.7,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-214",
    "name": "Gala Apples",
    "calories": 61.1,
    "protein": 0.13,
    "carbs": 14.8,
    "fats": 0.15,
    "servingSize": "100g"
  },
  {
    "id": "import-215",
    "name": "Ajo",
    "calories": 142.7,
    "protein": 6.62,
    "carbs": 28.2,
    "fats": 0.38,
    "servingSize": "100g"
  },
  {
    "id": "import-216",
    "name": "Gold Potatoes",
    "calories": 73.4,
    "protein": 1.81,
    "carbs": 15.96,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-217",
    "name": "Grade A Grande Blanco Huevo",
    "calories": 211.5,
    "protein": 10.7,
    "carbs": 2.36,
    "fats": 17.7,
    "servingSize": "100g"
  },
  {
    "id": "import-218",
    "name": "Grade A Grande Entero Huevo",
    "calories": 143.1,
    "protein": 12.4,
    "carbs": 0.96,
    "fats": 9.96,
    "servingSize": "100g"
  },
  {
    "id": "import-219",
    "name": "Grade A Grande Yema Huevo",
    "calories": 328.1,
    "protein": 16.2,
    "carbs": 1.02,
    "fats": 28.8,
    "servingSize": "100g"
  },
  {
    "id": "import-220",
    "name": "Granny Smith Apples",
    "calories": 59.1,
    "protein": 0.27,
    "carbs": 14.2,
    "fats": 0.14,
    "servingSize": "100g"
  },
  {
    "id": "import-221",
    "name": "Granulated",
    "calories": 401.3,
    "protein": 0,
    "carbs": 99.6,
    "fats": 0.32,
    "servingSize": "100g"
  },
  {
    "id": "import-222",
    "name": "Uva Zumo Purple",
    "calories": 66.1,
    "protein": 0.26,
    "carbs": 15.62,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-223",
    "name": "Uva Zumo Blanco",
    "calories": 66.1,
    "protein": 0.09,
    "carbs": 15.84,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-224",
    "name": "Uva Tomatoes",
    "calories": 31,
    "protein": 0.83,
    "carbs": 5.51,
    "fats": 0.63,
    "servingSize": "100g"
  },
  {
    "id": "import-225",
    "name": "Grapefruit Zumo Rojo",
    "calories": 41.1,
    "protein": 0.57,
    "carbs": 9.1,
    "fats": 0.27,
    "servingSize": "100g"
  },
  {
    "id": "import-226",
    "name": "Grapefruit Zumo Blanco",
    "calories": 38.9,
    "protein": 0.55,
    "carbs": 7.59,
    "fats": 0.7,
    "servingSize": "100g"
  },
  {
    "id": "import-227",
    "name": "Grapefruit Zumo Blanco en conserva Or Bottled",
    "calories": 38.9,
    "protein": 0.55,
    "carbs": 7.59,
    "fats": 0.7,
    "servingSize": "100g"
  },
  {
    "id": "import-228",
    "name": "Grapes Verde Seedless",
    "calories": 80.1,
    "protein": 0.9,
    "carbs": 18.6,
    "fats": 0.23,
    "servingSize": "100g"
  },
  {
    "id": "import-229",
    "name": "Grapes Rojo Seedless",
    "calories": 85.9,
    "protein": 0.91,
    "carbs": 20.2,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-230",
    "name": "Great Northern en conserva Judías",
    "calories": 116.9,
    "protein": 7.03,
    "carbs": 19.33,
    "fats": 1.27,
    "servingSize": "100g"
  },
  {
    "id": "import-231",
    "name": "Griego Natural Desnatado Yogur",
    "calories": 57.8,
    "protein": 8.06,
    "carbs": 5.57,
    "fats": 0.37,
    "servingSize": "100g"
  },
  {
    "id": "import-232",
    "name": "Griego Strawberry Yogur",
    "calories": 82.4,
    "protein": 8.06,
    "carbs": 12.2,
    "fats": 0.15,
    "servingSize": "100g"
  },
  {
    "id": "import-233",
    "name": "Griego Entero Leche Natural Yogur",
    "calories": 57.8,
    "protein": 8.06,
    "carbs": 5.57,
    "fats": 0.37,
    "servingSize": "100g"
  },
  {
    "id": "import-234",
    "name": "Griego Entero Leche Yogur",
    "calories": 93.6,
    "protein": 8.78,
    "carbs": 4.75,
    "fats": 4.39,
    "servingSize": "100g"
  },
  {
    "id": "import-235",
    "name": "Verde Cebolla (Scallion) Bulb And Greens",
    "calories": 34.6,
    "protein": 0.67,
    "carbs": 7.68,
    "fats": 0.13,
    "servingSize": "100g"
  },
  {
    "id": "import-236",
    "name": "Verde Dulce Peas",
    "calories": 80.1,
    "protein": 4.73,
    "carbs": 12.71,
    "fats": 1.15,
    "servingSize": "100g"
  },
  {
    "id": "import-237",
    "name": "Picada Pollo",
    "calories": 136.1,
    "protein": 17.91,
    "carbs": 0,
    "fats": 7.16,
    "servingSize": "100g"
  },
  {
    "id": "import-238",
    "name": "Picada Flaxseed Meal",
    "calories": 545.1,
    "protein": 18.04,
    "carbs": 34.36,
    "fats": 37.28,
    "servingSize": "100g"
  },
  {
    "id": "import-239",
    "name": "Picada Cerdo",
    "calories": 228.6,
    "protein": 17.81,
    "carbs": 0,
    "fats": 17.49,
    "servingSize": "100g"
  },
  {
    "id": "import-240",
    "name": "Picada With Additives Pollo",
    "calories": 136.1,
    "protein": 17.91,
    "carbs": 0,
    "fats": 7.16,
    "servingSize": "100g"
  },
  {
    "id": "import-241",
    "name": "Haddock",
    "calories": 69.2,
    "protein": 16.3,
    "carbs": 0,
    "fats": 0.45,
    "servingSize": "100g"
  },
  {
    "id": "import-242",
    "name": "Halloumi",
    "calories": 317.8,
    "protein": 21,
    "carbs": 2.2,
    "fats": 25,
    "servingSize": "100g"
  },
  {
    "id": "import-243",
    "name": "Jamón Luncheon Meat",
    "calories": 101.4,
    "protein": 16.7,
    "carbs": 0.27,
    "fats": 3.73,
    "servingSize": "100g"
  },
  {
    "id": "import-244",
    "name": "Jamón Luncheon Meat Oscar Mayer Deli",
    "calories": 101.4,
    "protein": 16.7,
    "carbs": 0.27,
    "fats": 3.73,
    "servingSize": "100g"
  },
  {
    "id": "import-245",
    "name": "Jamón en lonchas Pre-Packaged Deli Meat",
    "calories": 101.4,
    "protein": 16.7,
    "carbs": 0.27,
    "fats": 3.73,
    "servingSize": "100g"
  },
  {
    "id": "import-246",
    "name": "Hazelnuts",
    "calories": 641.4,
    "protein": 13.49,
    "carbs": 26.5,
    "fats": 53.49,
    "servingSize": "100g"
  },
  {
    "id": "import-247",
    "name": "Hon-Shimiji (Beech) Blanco Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-248",
    "name": "Honeycrisp Apples",
    "calories": 60.1,
    "protein": 0.1,
    "carbs": 14.7,
    "fats": 0.1,
    "servingSize": "100g"
  },
  {
    "id": "import-249",
    "name": "Picante Dogs Ternera Ball Park Angus",
    "calories": 101.4,
    "protein": 16.7,
    "carbs": 0.27,
    "fats": 3.73,
    "servingSize": "100g"
  },
  {
    "id": "import-250",
    "name": "Picante Dogs Ternera Oscar Mayer Premium Jumbo",
    "calories": 101.4,
    "protein": 16.7,
    "carbs": 0.27,
    "fats": 3.73,
    "servingSize": "100g"
  },
  {
    "id": "import-251",
    "name": "Hummus",
    "calories": 242.9,
    "protein": 7.35,
    "carbs": 14.9,
    "fats": 17.1,
    "servingSize": "100g"
  },
  {
    "id": "import-252",
    "name": "Hummus Commercial",
    "calories": 242.9,
    "protein": 7.35,
    "carbs": 14.9,
    "fats": 17.1,
    "servingSize": "100g"
  },
  {
    "id": "import-253",
    "name": "Hummus Sabra Classic",
    "calories": 242.9,
    "protein": 7.35,
    "carbs": 14.9,
    "fats": 17.1,
    "servingSize": "100g"
  },
  {
    "id": "import-254",
    "name": "Hummus Tribe Classic",
    "calories": 242.9,
    "protein": 7.35,
    "carbs": 14.9,
    "fats": 17.1,
    "servingSize": "100g"
  },
  {
    "id": "import-255",
    "name": "Italian Cerdo Salchicha Johnsonville Picante",
    "calories": 317.2,
    "protein": 18.2,
    "carbs": 2.15,
    "fats": 26.2,
    "servingSize": "100g"
  },
  {
    "id": "import-256",
    "name": "Italian Cerdo Salchicha Johnsonville Mild",
    "calories": 317.2,
    "protein": 18.2,
    "carbs": 2.15,
    "fats": 26.2,
    "servingSize": "100g"
  },
  {
    "id": "import-257",
    "name": "Zumo Pomegranate",
    "calories": 48.4,
    "protein": 0.09,
    "carbs": 11.36,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-258",
    "name": "Zumo Prune",
    "calories": 49.7,
    "protein": 0.42,
    "carbs": 11.36,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-259",
    "name": "Zumo Prune Shelf-Stable",
    "calories": 49.7,
    "protein": 0.42,
    "carbs": 11.36,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-260",
    "name": "Zumo Prune Water Extract Of Dried Prunes",
    "calories": 49.7,
    "protein": 0.42,
    "carbs": 11.36,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-261",
    "name": "Zumo Tart Cherry",
    "calories": 65.7,
    "protein": 0.15,
    "carbs": 15.62,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-262",
    "name": "Col rizada Frozen",
    "calories": 43.8,
    "protein": 2.94,
    "carbs": 5.3,
    "fats": 1.21,
    "servingSize": "100g"
  },
  {
    "id": "import-263",
    "name": "Col rizada Unprepared",
    "calories": 43.3,
    "protein": 2.93,
    "carbs": 4.86,
    "fats": 1.35,
    "servingSize": "100g"
  },
  {
    "id": "import-264",
    "name": "Kefir Natural",
    "calories": 51.2,
    "protein": 3.5,
    "carbs": 4.8,
    "fats": 2,
    "servingSize": "100g"
  },
  {
    "id": "import-265",
    "name": "Khorasan Grain Dried",
    "calories": 371.4,
    "protein": 14.76,
    "carbs": 71.79,
    "fats": 2.8,
    "servingSize": "100g"
  },
  {
    "id": "import-266",
    "name": "Khorasan Grain Wheat Berry",
    "calories": 371.4,
    "protein": 14.76,
    "carbs": 71.79,
    "fats": 2.8,
    "servingSize": "100g"
  },
  {
    "id": "import-267",
    "name": "Kidney Dark Rojo Judías",
    "calories": 126.7,
    "protein": 7.8,
    "carbs": 21.03,
    "fats": 1.26,
    "servingSize": "100g"
  },
  {
    "id": "import-268",
    "name": "Kidney Light Rojo Judías",
    "calories": 126.7,
    "protein": 7.31,
    "carbs": 21.45,
    "fats": 1.3,
    "servingSize": "100g"
  },
  {
    "id": "import-269",
    "name": "King Oyster Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-270",
    "name": "Kiwi (Kiwi) Verde",
    "calories": 65.1,
    "protein": 1.01,
    "carbs": 13.82,
    "fats": 0.64,
    "servingSize": "100g"
  },
  {
    "id": "import-271",
    "name": "Kiwi Verde",
    "calories": 64.2,
    "protein": 1.06,
    "carbs": 14,
    "fats": 0.44,
    "servingSize": "100g"
  },
  {
    "id": "import-272",
    "name": "Leeks Bulb And Greens Root Removed",
    "calories": 40.8,
    "protein": 1.47,
    "carbs": 8.61,
    "fats": 0.05,
    "servingSize": "100g"
  },
  {
    "id": "import-273",
    "name": "Lechuga Cos Or Romaine",
    "calories": 20.3,
    "protein": 1.24,
    "carbs": 3.24,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-274",
    "name": "Lechuga Iceberg",
    "calories": 17.1,
    "protein": 0.74,
    "carbs": 3.37,
    "fats": 0.07,
    "servingSize": "100g"
  },
  {
    "id": "import-275",
    "name": "Lechuga Leaf Verde",
    "calories": 22.1,
    "protein": 1.09,
    "carbs": 4.07,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-276",
    "name": "Lechuga Leaf Rojo",
    "calories": 17.5,
    "protein": 0.88,
    "carbs": 3.26,
    "fats": 0.11,
    "servingSize": "100g"
  },
  {
    "id": "import-277",
    "name": "Lechuga Romaine Verde",
    "calories": 20.8,
    "protein": 0.98,
    "carbs": 4.06,
    "fats": 0.07,
    "servingSize": "100g"
  },
  {
    "id": "import-278",
    "name": "Lions Mane Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-279",
    "name": "Loin Cerdo",
    "calories": 169.7,
    "protein": 21.12,
    "carbs": 0,
    "fats": 9.47,
    "servingSize": "100g"
  },
  {
    "id": "import-280",
    "name": "Loin Tenderloin Cerdo",
    "calories": 121.4,
    "protein": 21.58,
    "carbs": 0,
    "fats": 3.9,
    "servingSize": "100g"
  },
  {
    "id": "import-281",
    "name": "Loin Tenderloin Asado Separable Ternera",
    "calories": 168.9,
    "protein": 27.7,
    "carbs": 0.22,
    "fats": 6.36,
    "servingSize": "100g"
  },
  {
    "id": "import-282",
    "name": "Macadamia Nuts",
    "calories": 711.9,
    "protein": 7.79,
    "carbs": 24.09,
    "fats": 64.93,
    "servingSize": "100g"
  },
  {
    "id": "import-283",
    "name": "Maitake Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-284",
    "name": "Mandarin Seedless",
    "calories": 62,
    "protein": 1.04,
    "carbs": 13.42,
    "fats": 0.46,
    "servingSize": "100g"
  },
  {
    "id": "import-285",
    "name": "Mango Ataulfo",
    "calories": 78.5,
    "protein": 0.69,
    "carbs": 17.4,
    "fats": 0.68,
    "servingSize": "100g"
  },
  {
    "id": "import-286",
    "name": "Mango Tommy Atkins",
    "calories": 68.4,
    "protein": 0.56,
    "carbs": 15.26,
    "fats": 0.57,
    "servingSize": "100g"
  },
  {
    "id": "import-287",
    "name": "Melons Cantaloupe",
    "calories": 37.5,
    "protein": 0.82,
    "carbs": 8.16,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-288",
    "name": "Melons Honeydew",
    "calories": 36.7,
    "protein": 0.53,
    "carbs": 8.15,
    "fats": 0.22,
    "servingSize": "100g"
  },
  {
    "id": "import-289",
    "name": "Melons Honeydew Flesh Only",
    "calories": 37.1,
    "protein": 0.68,
    "carbs": 8.15,
    "fats": 0.2,
    "servingSize": "100g"
  },
  {
    "id": "import-290",
    "name": "Leche",
    "calories": 41.6,
    "protein": 3.38,
    "carbs": 4.89,
    "fats": 0.95,
    "servingSize": "100g"
  },
  {
    "id": "import-291",
    "name": "Millet Entero Grain",
    "calories": 375.6,
    "protein": 10.02,
    "carbs": 74.45,
    "fats": 4.19,
    "servingSize": "100g"
  },
  {
    "id": "import-292",
    "name": "Monterey Jack Queso Block",
    "calories": 391.8,
    "protein": 22.62,
    "carbs": 1.9,
    "fats": 32.63,
    "servingSize": "100g"
  },
  {
    "id": "import-293",
    "name": "Monterey Jack Solid Queso",
    "calories": 391.8,
    "protein": 22.62,
    "carbs": 1.9,
    "fats": 32.63,
    "servingSize": "100g"
  },
  {
    "id": "import-294",
    "name": "Mozzarella Queso Low-Moisture",
    "calories": 296.2,
    "protein": 23.7,
    "carbs": 4.44,
    "fats": 20.4,
    "servingSize": "100g"
  },
  {
    "id": "import-295",
    "name": "Mozzarella Low Moisture Queso",
    "calories": 296.2,
    "protein": 23.7,
    "carbs": 4.44,
    "fats": 20.4,
    "servingSize": "100g"
  },
  {
    "id": "import-296",
    "name": "Champiñón Beech",
    "calories": 39.8,
    "protein": 2.18,
    "carbs": 6.76,
    "fats": 0.45,
    "servingSize": "100g"
  },
  {
    "id": "import-297",
    "name": "Champiñón Crimini",
    "calories": 30.2,
    "protein": 3.09,
    "carbs": 4.01,
    "fats": 0.2,
    "servingSize": "100g"
  },
  {
    "id": "import-298",
    "name": "Champiñón Enoki",
    "calories": 44.4,
    "protein": 2.42,
    "carbs": 8.14,
    "fats": 0.24,
    "servingSize": "100g"
  },
  {
    "id": "import-299",
    "name": "Champiñón King Oyster",
    "calories": 46.4,
    "protein": 2.41,
    "carbs": 8.5,
    "fats": 0.31,
    "servingSize": "100g"
  },
  {
    "id": "import-300",
    "name": "Champiñón Lion\"S Mane",
    "calories": 42.7,
    "protein": 2.5,
    "carbs": 7.59,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-301",
    "name": "Champiñón Maitake",
    "calories": 37.5,
    "protein": 2.2,
    "carbs": 6.6,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-302",
    "name": "Yogur",
    "calories": 50,
    "protein": 4.23,
    "carbs": 8.08,
    "fats": 0.09,
    "servingSize": "100g"
  },
  {
    "id": "import-303",
    "name": "Champiñón Oyster",
    "calories": 41.1,
    "protein": 2.9,
    "carbs": 6.94,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-304",
    "name": "Champiñón Pioppini",
    "calories": 39.2,
    "protein": 3.5,
    "carbs": 5.76,
    "fats": 0.24,
    "servingSize": "100g"
  },
  {
    "id": "import-305",
    "name": "Champiñón Portabella",
    "calories": 32.4,
    "protein": 2.75,
    "carbs": 4.66,
    "fats": 0.31,
    "servingSize": "100g"
  },
  {
    "id": "import-306",
    "name": "Mustard Prepared Amarillo",
    "calories": 68.6,
    "protein": 4.25,
    "carbs": 5.3,
    "fats": 3.38,
    "servingSize": "100g"
  },
  {
    "id": "import-307",
    "name": "Navy en conserva Judías",
    "calories": 118.8,
    "protein": 6.57,
    "carbs": 19.98,
    "fats": 1.4,
    "servingSize": "100g"
  },
  {
    "id": "import-308",
    "name": "Nectarines",
    "calories": 43.5,
    "protein": 1.06,
    "carbs": 9.18,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-309",
    "name": "Nuts Almonds",
    "calories": 663.3,
    "protein": 15.37,
    "carbs": 20.84,
    "fats": 57.61,
    "servingSize": "100g"
  },
  {
    "id": "import-310",
    "name": "Nuts Almonds Dried",
    "calories": 666.6,
    "protein": 20.4,
    "carbs": 16.2,
    "fats": 57.8,
    "servingSize": "100g"
  },
  {
    "id": "import-311",
    "name": "Nuts Almonds Entero",
    "calories": 625.7,
    "protein": 21.45,
    "carbs": 20.03,
    "fats": 51.09,
    "servingSize": "100g"
  },
  {
    "id": "import-312",
    "name": "Nuts Brazilnuts",
    "calories": 663.6,
    "protein": 15.04,
    "carbs": 21.64,
    "fats": 57.43,
    "servingSize": "100g"
  },
  {
    "id": "import-313",
    "name": "Nuts Anacardo Nuts",
    "calories": 564.7,
    "protein": 17.44,
    "carbs": 36.29,
    "fats": 38.86,
    "servingSize": "100g"
  },
  {
    "id": "import-314",
    "name": "Nuts Hazelnuts Or Filberts",
    "calories": 641.4,
    "protein": 13.49,
    "carbs": 26.5,
    "fats": 53.49,
    "servingSize": "100g"
  },
  {
    "id": "import-315",
    "name": "Nuts Macadamia Nuts",
    "calories": 711.9,
    "protein": 7.79,
    "carbs": 24.09,
    "fats": 64.93,
    "servingSize": "100g"
  },
  {
    "id": "import-316",
    "name": "Nuts Pecans",
    "calories": 663.3,
    "protein": 15.37,
    "carbs": 20.84,
    "fats": 57.61,
    "servingSize": "100g"
  },
  {
    "id": "import-317",
    "name": "Nuts Pecans Halves",
    "calories": 750.2,
    "protein": 9.96,
    "carbs": 12.7,
    "fats": 73.28,
    "servingSize": "100g"
  },
  {
    "id": "import-318",
    "name": "Nuts Pine Nuts",
    "calories": 688.6,
    "protein": 15.7,
    "carbs": 18.59,
    "fats": 61.27,
    "servingSize": "100g"
  },
  {
    "id": "import-319",
    "name": "Nuts Pistacho Nuts",
    "calories": 598,
    "protein": 20.51,
    "carbs": 27.69,
    "fats": 45.02,
    "servingSize": "100g"
  },
  {
    "id": "import-320",
    "name": "Nuts Walnuts English",
    "calories": 729.5,
    "protein": 14.56,
    "carbs": 10.91,
    "fats": 69.74,
    "servingSize": "100g"
  },
  {
    "id": "import-321",
    "name": "Oat Leche",
    "calories": 48.3,
    "protein": 0.8,
    "carbs": 5.1,
    "fats": 2.75,
    "servingSize": "100g"
  },
  {
    "id": "import-322",
    "name": "Oatmeal Cookies With Raisins Pepperidge Farm Soft Horneado",
    "calories": 430.3,
    "protein": 5.79,
    "carbs": 69.6,
    "fats": 14.3,
    "servingSize": "100g"
  },
  {
    "id": "import-323",
    "name": "Oaxaca Queso",
    "calories": 321,
    "protein": 22.62,
    "carbs": 2.96,
    "fats": 24.3,
    "servingSize": "100g"
  },
  {
    "id": "import-324",
    "name": "Oaxaca Solid Queso",
    "calories": 297.1,
    "protein": 22.14,
    "carbs": 2.4,
    "fats": 22.1,
    "servingSize": "100g"
  },
  {
    "id": "import-325",
    "name": "Oliva Aceite Control Composite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-326",
    "name": "Oliva Aceite Extra Light",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-327",
    "name": "Oliva Aceite Extra Virgin",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-328",
    "name": "Olives Verde Manzanilla",
    "calories": 140.5,
    "protein": 1.15,
    "carbs": 4.96,
    "fats": 12.9,
    "servingSize": "100g"
  },
  {
    "id": "import-329",
    "name": "Olives Verde Manzanilla Stuffed With Pimentos Lindsay",
    "calories": 140.5,
    "protein": 1.15,
    "carbs": 4.96,
    "fats": 12.9,
    "servingSize": "100g"
  },
  {
    "id": "import-330",
    "name": "Olives Verde Manzanilla Stuffed With Pimentos Mario",
    "calories": 140.5,
    "protein": 1.15,
    "carbs": 4.96,
    "fats": 12.9,
    "servingSize": "100g"
  },
  {
    "id": "import-331",
    "name": "Olives Verde Manzanilla Stuffed With Pimentos Roland",
    "calories": 140.5,
    "protein": 1.15,
    "carbs": 4.96,
    "fats": 12.9,
    "servingSize": "100g"
  },
  {
    "id": "import-332",
    "name": "Olives Verde Manzanilla Stuffed With Pimentos Star",
    "calories": 140.5,
    "protein": 1.15,
    "carbs": 4.96,
    "fats": 12.9,
    "servingSize": "100g"
  },
  {
    "id": "import-333",
    "name": "Cebolla Rings Breaded Par Frito",
    "calories": 292.9,
    "protein": 4.52,
    "carbs": 36.3,
    "fats": 14.4,
    "servingSize": "100g"
  },
  {
    "id": "import-334",
    "name": "Cebolla Rings Frozen Oven-Heated",
    "calories": 292.9,
    "protein": 4.52,
    "carbs": 36.3,
    "fats": 14.4,
    "servingSize": "100g"
  },
  {
    "id": "import-335",
    "name": "Onions Rojo",
    "calories": 44.4,
    "protein": 0.94,
    "carbs": 9.93,
    "fats": 0.1,
    "servingSize": "100g"
  },
  {
    "id": "import-336",
    "name": "Onions Blanco",
    "calories": 35.4,
    "protein": 0.89,
    "carbs": 7.68,
    "fats": 0.13,
    "servingSize": "100g"
  },
  {
    "id": "import-337",
    "name": "Onions Amarillo",
    "calories": 38.2,
    "protein": 0.83,
    "carbs": 8.61,
    "fats": 0.05,
    "servingSize": "100g"
  },
  {
    "id": "import-338",
    "name": "Naranja Zumo",
    "calories": 47.2,
    "protein": 0.73,
    "carbs": 10.34,
    "fats": 0.32,
    "servingSize": "100g"
  },
  {
    "id": "import-339",
    "name": "Oranges Navel",
    "calories": 52.2,
    "protein": 0.91,
    "carbs": 11.8,
    "fats": 0.15,
    "servingSize": "100g"
  },
  {
    "id": "import-340",
    "name": "Oranges Navels",
    "calories": 52.2,
    "protein": 0.91,
    "carbs": 11.8,
    "fats": 0.15,
    "servingSize": "100g"
  },
  {
    "id": "import-341",
    "name": "Overripe Bananas",
    "calories": 85.3,
    "protein": 0.73,
    "carbs": 20.1,
    "fats": 0.22,
    "servingSize": "100g"
  },
  {
    "id": "import-342",
    "name": "Oyster Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-343",
    "name": "Parmesan Queso Grated",
    "calories": 420,
    "protein": 29.6,
    "carbs": 12.4,
    "fats": 28,
    "servingSize": "100g"
  },
  {
    "id": "import-344",
    "name": "Parmesan Grated Queso",
    "calories": 420,
    "protein": 29.6,
    "carbs": 12.4,
    "fats": 28,
    "servingSize": "100g"
  },
  {
    "id": "import-345",
    "name": "Pasteurizado Procesado American Vitamin D Fortified Queso",
    "calories": 368.5,
    "protein": 18,
    "carbs": 5.27,
    "fats": 30.6,
    "servingSize": "100g"
  },
  {
    "id": "import-346",
    "name": "Pasteurizado Procesado Queso Food Or Product American Singles Queso",
    "calories": 309.8,
    "protein": 15.57,
    "carbs": 8.19,
    "fats": 23.86,
    "servingSize": "100g"
  },
  {
    "id": "import-347",
    "name": "Pawpaw",
    "calories": 70.8,
    "protein": 1.15,
    "carbs": 15.26,
    "fats": 0.57,
    "servingSize": "100g"
  },
  {
    "id": "import-348",
    "name": "Peaches",
    "calories": 46.5,
    "protein": 0.91,
    "carbs": 10.1,
    "fats": 0.27,
    "servingSize": "100g"
  },
  {
    "id": "import-349",
    "name": "Peaches Amarillo",
    "calories": 46.5,
    "protein": 0.91,
    "carbs": 10.1,
    "fats": 0.27,
    "servingSize": "100g"
  },
  {
    "id": "import-350",
    "name": "Cacahuete Mantequilla Cremosa",
    "calories": 631.6,
    "protein": 23.99,
    "carbs": 22.7,
    "fats": 49.43,
    "servingSize": "100g"
  },
  {
    "id": "import-351",
    "name": "Cacahuete Mantequilla Cremosa Jif",
    "calories": 635.3,
    "protein": 23.25,
    "carbs": 22.5,
    "fats": 50.26,
    "servingSize": "100g"
  },
  {
    "id": "import-352",
    "name": "Cacahuete Mantequilla Cremosa Skippy",
    "calories": 635.3,
    "protein": 23.25,
    "carbs": 22.5,
    "fats": 50.26,
    "servingSize": "100g"
  },
  {
    "id": "import-353",
    "name": "Cacahuete Mantequilla Smooth Style With Sal",
    "calories": 639.1,
    "protein": 22.5,
    "carbs": 22.3,
    "fats": 51.1,
    "servingSize": "100g"
  },
  {
    "id": "import-354",
    "name": "Cacahuete Aceite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-355",
    "name": "Peanuts",
    "calories": 588.3,
    "protein": 23.2,
    "carbs": 26.5,
    "fats": 43.28,
    "servingSize": "100g"
  },
  {
    "id": "import-356",
    "name": "Pera Anjou Verde",
    "calories": 63.6,
    "protein": 0.31,
    "carbs": 14.77,
    "fats": 0.37,
    "servingSize": "100g"
  },
  {
    "id": "import-357",
    "name": "Pears Bartlett",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-358",
    "name": "Pears Bartlett Regions 1 & 4",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-359",
    "name": "Pears Bartlett Regions 2 & 3",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-360",
    "name": "Pears Bosc",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-361",
    "name": "Pears Bosc Regions 1 & 4",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-362",
    "name": "Pears Bosc Regions 2 & 3",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-363",
    "name": "Pears Composite Of Verde Cultivars",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-364",
    "name": "Pears Verde Anjou",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-365",
    "name": "Pears Verde Anjou Regions 1 & 4",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-366",
    "name": "Pears Verde Anjou Regions 2 & 3",
    "calories": 63.4,
    "protein": 0.38,
    "carbs": 15.1,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-367",
    "name": "Pepperidge Farms",
    "calories": 266.8,
    "protein": 9.43,
    "carbs": 49.2,
    "fats": 3.59,
    "servingSize": "100g"
  },
  {
    "id": "import-368",
    "name": "Peppers Pimiento Verde",
    "calories": 23,
    "protein": 0.72,
    "carbs": 4.78,
    "fats": 0.11,
    "servingSize": "100g"
  },
  {
    "id": "import-369",
    "name": "Peppers Pimiento Naranja",
    "calories": 31.8,
    "protein": 0.88,
    "carbs": 6.7,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-370",
    "name": "Peppers Pimiento Rojo",
    "calories": 31.4,
    "protein": 0.9,
    "carbs": 6.65,
    "fats": 0.13,
    "servingSize": "100g"
  },
  {
    "id": "import-371",
    "name": "Peppers Pimiento Amarillo",
    "calories": 30.8,
    "protein": 0.82,
    "carbs": 6.6,
    "fats": 0.12,
    "servingSize": "100g"
  },
  {
    "id": "import-372",
    "name": "Pickles Pepino Dill Or Kosher Dill",
    "calories": 13.8,
    "protein": 0.48,
    "carbs": 1.99,
    "fats": 0.43,
    "servingSize": "100g"
  },
  {
    "id": "import-373",
    "name": "Pickles Kosher Dill",
    "calories": 13.8,
    "protein": 0.48,
    "carbs": 1.99,
    "fats": 0.43,
    "servingSize": "100g"
  },
  {
    "id": "import-374",
    "name": "Pickles Kosher Dill Spears",
    "calories": 13.8,
    "protein": 0.48,
    "carbs": 1.99,
    "fats": 0.43,
    "servingSize": "100g"
  },
  {
    "id": "import-375",
    "name": "Piña",
    "calories": 60.1,
    "protein": 0.46,
    "carbs": 14.09,
    "fats": 0.21,
    "servingSize": "100g"
  },
  {
    "id": "import-376",
    "name": "Pinto en conserva Judías",
    "calories": 116.6,
    "protein": 6.69,
    "carbs": 19.6,
    "fats": 1.27,
    "servingSize": "100g"
  },
  {
    "id": "import-377",
    "name": "Pioppini Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-378",
    "name": "Pistacho Nuts",
    "calories": 598,
    "protein": 20.51,
    "carbs": 27.69,
    "fats": 45.02,
    "servingSize": "100g"
  },
  {
    "id": "import-379",
    "name": "Plantains Black Overripe",
    "calories": 136.5,
    "protein": 1.17,
    "carbs": 30.95,
    "fats": 0.89,
    "servingSize": "100g"
  },
  {
    "id": "import-380",
    "name": "Plantains Verde Unripe",
    "calories": 136.5,
    "protein": 1.17,
    "carbs": 30.95,
    "fats": 0.89,
    "servingSize": "100g"
  },
  {
    "id": "import-381",
    "name": "Plantains Overripe",
    "calories": 130.4,
    "protein": 1.17,
    "carbs": 29.19,
    "fats": 0.99,
    "servingSize": "100g"
  },
  {
    "id": "import-382",
    "name": "Plantains Ripe",
    "calories": 136.4,
    "protein": 1.16,
    "carbs": 30.95,
    "fats": 0.89,
    "servingSize": "100g"
  },
  {
    "id": "import-383",
    "name": "Plantains Underripe",
    "calories": 145.4,
    "protein": 1.23,
    "carbs": 33.59,
    "fats": 0.68,
    "servingSize": "100g"
  },
  {
    "id": "import-384",
    "name": "Plantains Amarillo Ripe",
    "calories": 136.5,
    "protein": 1.17,
    "carbs": 30.95,
    "fats": 0.89,
    "servingSize": "100g"
  },
  {
    "id": "import-385",
    "name": "Plum Black",
    "calories": 58.7,
    "protein": 0.58,
    "carbs": 13.46,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-386",
    "name": "Pollock",
    "calories": 52.9,
    "protein": 12.3,
    "carbs": 0,
    "fats": 0.41,
    "servingSize": "100g"
  },
  {
    "id": "import-387",
    "name": "Portabella Mushrooms",
    "calories": 37.6,
    "protein": 2.65,
    "carbs": 6.12,
    "fats": 0.28,
    "servingSize": "100g"
  },
  {
    "id": "import-388",
    "name": "Porterhouse Filete Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-389",
    "name": "Provolone Queso en lonchas Non-Smoked",
    "calories": 356.8,
    "protein": 23.45,
    "carbs": 2.45,
    "fats": 28.13,
    "servingSize": "100g"
  },
  {
    "id": "import-390",
    "name": "Provolone Queso en lonchas Smoked",
    "calories": 356.8,
    "protein": 23.45,
    "carbs": 2.45,
    "fats": 28.13,
    "servingSize": "100g"
  },
  {
    "id": "import-391",
    "name": "Provolone en lonchas Queso",
    "calories": 356.8,
    "protein": 23.45,
    "carbs": 2.45,
    "fats": 28.13,
    "servingSize": "100g"
  },
  {
    "id": "import-392",
    "name": "Pumpkin Seeds (Pepitas)",
    "calories": 554.6,
    "protein": 29.91,
    "carbs": 18.68,
    "fats": 40.03,
    "servingSize": "100g"
  },
  {
    "id": "import-393",
    "name": "Pumpkin Seeds (Pepitas) Seeds",
    "calories": 554.6,
    "protein": 29.91,
    "carbs": 18.68,
    "fats": 40.03,
    "servingSize": "100g"
  },
  {
    "id": "import-394",
    "name": "Queso Fresco Queso",
    "calories": 321,
    "protein": 22.62,
    "carbs": 2.96,
    "fats": 24.3,
    "servingSize": "100g"
  },
  {
    "id": "import-395",
    "name": "Queso Fresco Solid Queso",
    "calories": 297.6,
    "protein": 18.88,
    "carbs": 2.96,
    "fats": 23.36,
    "servingSize": "100g"
  },
  {
    "id": "import-396",
    "name": "Quinoa Harina",
    "calories": 385.2,
    "protein": 11.92,
    "carbs": 69.52,
    "fats": 6.6,
    "servingSize": "100g"
  },
  {
    "id": "import-397",
    "name": "Frambuesas",
    "calories": 57.4,
    "protein": 1.01,
    "carbs": 12.9,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-398",
    "name": "Rojo Delicious Apples",
    "calories": 61.8,
    "protein": 0.19,
    "carbs": 14.8,
    "fats": 0.21,
    "servingSize": "100g"
  },
  {
    "id": "import-399",
    "name": "Rojo Lentejas Dried",
    "calories": 348.3,
    "protein": 24.6,
    "carbs": 60,
    "fats": 1.1,
    "servingSize": "100g"
  },
  {
    "id": "import-400",
    "name": "Rojo Potatoes",
    "calories": 75.6,
    "protein": 2.06,
    "carbs": 16.27,
    "fats": 0.25,
    "servingSize": "100g"
  },
  {
    "id": "import-401",
    "name": "Rojo Unenriched Arroz",
    "calories": 369.8,
    "protein": 8.56,
    "carbs": 76.15,
    "fats": 3.44,
    "servingSize": "100g"
  },
  {
    "id": "import-402",
    "name": "Ribeye Filete Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-403",
    "name": "Ricotta Entero Leche Queso",
    "calories": 157.7,
    "protein": 7.81,
    "carbs": 6.86,
    "fats": 11,
    "servingSize": "100g"
  },
  {
    "id": "import-404",
    "name": "Ripe And Slightly Ripe Bananas",
    "calories": 97.6,
    "protein": 0.74,
    "carbs": 23,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-405",
    "name": "Ripe Bananas",
    "calories": 91.5,
    "protein": 0.74,
    "carbs": 21.55,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-406",
    "name": "Ripe Extra Grande Tamaño Bananas",
    "calories": 91.5,
    "protein": 0.74,
    "carbs": 21.55,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-407",
    "name": "Rocket",
    "calories": 31.5,
    "protein": 2.6,
    "carbs": 3.7,
    "fats": 0.7,
    "servingSize": "100g"
  },
  {
    "id": "import-408",
    "name": "Roma Tomatoes",
    "calories": 27,
    "protein": 0.85,
    "carbs": 4.9,
    "fats": 0.45,
    "servingSize": "100g"
  },
  {
    "id": "import-409",
    "name": "Romaine Lechuga",
    "calories": 18.4,
    "protein": 0.98,
    "carbs": 3.37,
    "fats": 0.11,
    "servingSize": "100g"
  },
  {
    "id": "import-410",
    "name": "Round Top Round Ternera",
    "calories": 140.6,
    "protein": 21.48,
    "carbs": 0.85,
    "fats": 5.7,
    "servingSize": "100g"
  },
  {
    "id": "import-411",
    "name": "Round Top Round Asado Ternera",
    "calories": 117.4,
    "protein": 23.7,
    "carbs": 0.22,
    "fats": 2.41,
    "servingSize": "100g"
  },
  {
    "id": "import-412",
    "name": "Russet Potatoes",
    "calories": 83.4,
    "protein": 2.27,
    "carbs": 17.77,
    "fats": 0.36,
    "servingSize": "100g"
  },
  {
    "id": "import-413",
    "name": "Rutabaga",
    "calories": 69.7,
    "protein": 0.89,
    "carbs": 15.96,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-414",
    "name": "Rye Harina",
    "calories": 359.4,
    "protein": 8.4,
    "carbs": 77.16,
    "fats": 1.91,
    "servingSize": "100g"
  },
  {
    "id": "import-415",
    "name": "Safflower Aceite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-416",
    "name": "Salsa Pace Chunky",
    "calories": 34.4,
    "protein": 1.44,
    "carbs": 6.74,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-417",
    "name": "Salsa Pace Chunky Medium",
    "calories": 34.4,
    "protein": 1.44,
    "carbs": 6.74,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-418",
    "name": "Salsa Tostitos Chunky",
    "calories": 34.4,
    "protein": 1.44,
    "carbs": 6.74,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-419",
    "name": "Salsa Tostitos Chunky Medium",
    "calories": 34.4,
    "protein": 1.44,
    "carbs": 6.74,
    "fats": 0.19,
    "servingSize": "100g"
  },
  {
    "id": "import-420",
    "name": "Sal Table Iodized",
    "calories": 0,
    "protein": 0,
    "carbs": 0,
    "fats": 0,
    "servingSize": "100g"
  },
  {
    "id": "import-421",
    "name": "Sara Lee Soft And Smooth Classic Entero",
    "calories": 266.8,
    "protein": 9.43,
    "carbs": 49.2,
    "fats": 3.59,
    "servingSize": "100g"
  },
  {
    "id": "import-422",
    "name": "Sauce Pasta Hunts Original",
    "calories": 42.8,
    "protein": 1.42,
    "carbs": 7.4,
    "fats": 0.84,
    "servingSize": "100g"
  },
  {
    "id": "import-423",
    "name": "Sauce Pasta Prego 100% Natural Italian",
    "calories": 42.8,
    "protein": 1.42,
    "carbs": 7.4,
    "fats": 0.84,
    "servingSize": "100g"
  },
  {
    "id": "import-424",
    "name": "Salchicha Cerdo Chorizo Link Or Picada",
    "calories": 340.6,
    "protein": 19.3,
    "carbs": 2.63,
    "fats": 28.1,
    "servingSize": "100g"
  },
  {
    "id": "import-425",
    "name": "Salchicha Pavo Breakfast Links Mild",
    "calories": 164.1,
    "protein": 16.7,
    "carbs": 0.93,
    "fats": 10.4,
    "servingSize": "100g"
  },
  {
    "id": "import-426",
    "name": "Sea Bream",
    "calories": 116,
    "protein": 20,
    "carbs": 0,
    "fats": 4,
    "servingSize": "100g"
  },
  {
    "id": "import-427",
    "name": "Sesame Mantequilla Cremosa",
    "calories": 697.2,
    "protein": 19.71,
    "carbs": 14.18,
    "fats": 62.4,
    "servingSize": "100g"
  },
  {
    "id": "import-428",
    "name": "Sesame Semilla Mantequilla (Tahini) Cremosa",
    "calories": 697.2,
    "protein": 19.71,
    "carbs": 14.18,
    "fats": 62.4,
    "servingSize": "100g"
  },
  {
    "id": "import-429",
    "name": "Shallots Bulb",
    "calories": 37.4,
    "protein": 1.38,
    "carbs": 7.68,
    "fats": 0.13,
    "servingSize": "100g"
  },
  {
    "id": "import-430",
    "name": "Shiitake Mushrooms",
    "calories": 44.1,
    "protein": 2.41,
    "carbs": 8.17,
    "fats": 0.2,
    "servingSize": "100g"
  },
  {
    "id": "import-431",
    "name": "Short Loin (Ny Strip Filete) Ternera",
    "calories": 190,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 11.54,
    "servingSize": "100g"
  },
  {
    "id": "import-432",
    "name": "Short Loin Porterhouse Filete Separable Ternera",
    "calories": 139.6,
    "protein": 22.7,
    "carbs": 0.22,
    "fats": 5.32,
    "servingSize": "100g"
  },
  {
    "id": "import-433",
    "name": "Skim Leche",
    "calories": 41.6,
    "protein": 3.38,
    "carbs": 4.89,
    "fats": 0.95,
    "servingSize": "100g"
  },
  {
    "id": "import-434",
    "name": "Skyr Natural",
    "calories": 61.8,
    "protein": 11,
    "carbs": 4,
    "fats": 0.2,
    "servingSize": "100g"
  },
  {
    "id": "import-435",
    "name": "Slightly Ripe Bananas",
    "calories": 91.5,
    "protein": 0.74,
    "carbs": 21.55,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-436",
    "name": "Snap en conserva Judías",
    "calories": 185,
    "protein": 23.6,
    "carbs": 19.81,
    "fats": 1.26,
    "servingSize": "100g"
  },
  {
    "id": "import-437",
    "name": "Snap Verde Judías",
    "calories": 24.1,
    "protein": 1.04,
    "carbs": 4.11,
    "fats": 0.39,
    "servingSize": "100g"
  },
  {
    "id": "import-438",
    "name": "Sorghum Bran Blanco Unenriched",
    "calories": 402.8,
    "protein": 11.17,
    "carbs": 68.7,
    "fats": 9.26,
    "servingSize": "100g"
  },
  {
    "id": "import-439",
    "name": "Sorghum Harina",
    "calories": 372.6,
    "protein": 10.08,
    "carbs": 73.57,
    "fats": 4.22,
    "servingSize": "100g"
  },
  {
    "id": "import-440",
    "name": "Sorghum Harina Blanco Pearled",
    "calories": 364,
    "protein": 10.21,
    "carbs": 73.51,
    "fats": 3.24,
    "servingSize": "100g"
  },
  {
    "id": "import-441",
    "name": "Sorghum Grain Blanco Pearled",
    "calories": 369.8,
    "protein": 10.25,
    "carbs": 74.87,
    "fats": 3.26,
    "servingSize": "100g"
  },
  {
    "id": "import-442",
    "name": "Sorghum Entero Grain Blanco",
    "calories": 372.6,
    "protein": 10.08,
    "carbs": 73.57,
    "fats": 4.22,
    "servingSize": "100g"
  },
  {
    "id": "import-443",
    "name": "Soybean Aceite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-444",
    "name": "Espinaca Baby",
    "calories": 26.6,
    "protein": 2.85,
    "carbs": 2.41,
    "fats": 0.62,
    "servingSize": "100g"
  },
  {
    "id": "import-445",
    "name": "Espinaca Mature",
    "calories": 27.6,
    "protein": 2.91,
    "carbs": 2.64,
    "fats": 0.6,
    "servingSize": "100g"
  },
  {
    "id": "import-446",
    "name": "Espinaca Regular",
    "calories": 27.1,
    "protein": 2.88,
    "carbs": 2.52,
    "fats": 0.61,
    "servingSize": "100g"
  },
  {
    "id": "import-447",
    "name": "Squash Acorn",
    "calories": 35.1,
    "protein": 0.94,
    "carbs": 7.44,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-448",
    "name": "Squash Butternut",
    "calories": 35.1,
    "protein": 0.94,
    "carbs": 7.44,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-449",
    "name": "Squash Pie Pumpkin",
    "calories": 34.8,
    "protein": 0.85,
    "carbs": 7.44,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-450",
    "name": "Squash Spaghetti",
    "calories": 34.5,
    "protein": 0.79,
    "carbs": 7.44,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-451",
    "name": "Squash Summer Verde",
    "calories": 18.8,
    "protein": 0.98,
    "carbs": 3.27,
    "fats": 0.2,
    "servingSize": "100g"
  },
  {
    "id": "import-452",
    "name": "Squash Summer Amarillo",
    "calories": 22.4,
    "protein": 0.89,
    "carbs": 4.39,
    "fats": 0.14,
    "servingSize": "100g"
  },
  {
    "id": "import-453",
    "name": "Squash Winter Acorn",
    "calories": 48.5,
    "protein": 1.25,
    "carbs": 10.48,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-454",
    "name": "Squash Winter Butternut",
    "calories": 48.2,
    "protein": 1.15,
    "carbs": 10.51,
    "fats": 0.17,
    "servingSize": "100g"
  },
  {
    "id": "import-455",
    "name": "Squash Amarillo",
    "calories": 35.1,
    "protein": 0.94,
    "carbs": 7.44,
    "fats": 0.18,
    "servingSize": "100g"
  },
  {
    "id": "import-456",
    "name": "String (Low-Moisture Mozzarella) Queso",
    "calories": 321,
    "protein": 22.62,
    "carbs": 2.96,
    "fats": 24.3,
    "servingSize": "100g"
  },
  {
    "id": "import-457",
    "name": "Stroehmann Dutch County",
    "calories": 253.6,
    "protein": 12.3,
    "carbs": 43.1,
    "fats": 3.55,
    "servingSize": "100g"
  },
  {
    "id": "import-458",
    "name": "Girasol Aceite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-459",
    "name": "Girasol Semilla Kernel Seeds",
    "calories": 609.4,
    "protein": 18.87,
    "carbs": 24.5,
    "fats": 48.44,
    "servingSize": "100g"
  },
  {
    "id": "import-460",
    "name": "Girasol Semilla Kernels",
    "calories": 657.3,
    "protein": 21,
    "carbs": 17.1,
    "fats": 56.1,
    "servingSize": "100g"
  },
  {
    "id": "import-461",
    "name": "Girasol Semilla Kernels Dried Seeds",
    "calories": 657.3,
    "protein": 21,
    "carbs": 17.1,
    "fats": 56.1,
    "servingSize": "100g"
  },
  {
    "id": "import-462",
    "name": "Girasol Seeds Dried Salted",
    "calories": 609.4,
    "protein": 18.87,
    "carbs": 24.5,
    "fats": 48.44,
    "servingSize": "100g"
  },
  {
    "id": "import-463",
    "name": "Dulce Potatoes Naranja Flesh",
    "calories": 79.1,
    "protein": 1.58,
    "carbs": 17.33,
    "fats": 0.38,
    "servingSize": "100g"
  },
  {
    "id": "import-464",
    "name": "Dulce Amarillo And Blanco Kernels Corn",
    "calories": 84.6,
    "protein": 2.79,
    "carbs": 14.69,
    "fats": 1.63,
    "servingSize": "100g"
  },
  {
    "id": "import-465",
    "name": "Swiss Queso",
    "calories": 392.8,
    "protein": 27,
    "carbs": 1.44,
    "fats": 31,
    "servingSize": "100g"
  },
  {
    "id": "import-466",
    "name": "Swiss Slices Queso",
    "calories": 321,
    "protein": 22.62,
    "carbs": 2.96,
    "fats": 24.3,
    "servingSize": "100g"
  },
  {
    "id": "import-467",
    "name": "T-Bone Filete Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-468",
    "name": "T-Bone Filete Lower Choice Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-469",
    "name": "T-Bone Filete Upper Choice Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-470",
    "name": "Tenderloin Cerdo",
    "calories": 169.7,
    "protein": 21.12,
    "carbs": 0,
    "fats": 9.47,
    "servingSize": "100g"
  },
  {
    "id": "import-471",
    "name": "Tenderloin Asado Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-472",
    "name": "Tenderloin Filete Ternera",
    "calories": 143.2,
    "protein": 21.09,
    "carbs": 0.18,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-473",
    "name": "Tomatillos Dehusked",
    "calories": 23.4,
    "protein": 1.06,
    "carbs": 3.84,
    "fats": 0.42,
    "servingSize": "100g"
  },
  {
    "id": "import-474",
    "name": "Tomate Zumo",
    "calories": 23.3,
    "protein": 0.86,
    "carbs": 4.32,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-475",
    "name": "Tomate Zumo With Added Ingredients",
    "calories": 23.3,
    "protein": 0.86,
    "carbs": 4.32,
    "fats": 0.29,
    "servingSize": "100g"
  },
  {
    "id": "import-476",
    "name": "Tomate Paste en conserva",
    "calories": 104.2,
    "protein": 4.23,
    "carbs": 20.19,
    "fats": 0.73,
    "servingSize": "100g"
  },
  {
    "id": "import-477",
    "name": "Tomate Puree en conserva",
    "calories": 40.8,
    "protein": 1.58,
    "carbs": 8.04,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-478",
    "name": "Tomate Roma",
    "calories": 21.9,
    "protein": 0.7,
    "carbs": 3.84,
    "fats": 0.42,
    "servingSize": "100g"
  },
  {
    "id": "import-479",
    "name": "Tomate Sauce en conserva",
    "calories": 34.1,
    "protein": 1.35,
    "carbs": 6.33,
    "fats": 0.38,
    "servingSize": "100g"
  },
  {
    "id": "import-480",
    "name": "Top Loin Filete Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-481",
    "name": "Top Loin Filete Choice Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-482",
    "name": "Top Loin Filete Upper Choice Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-483",
    "name": "Top Round Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-484",
    "name": "Top Round Asado/Filete Ternera",
    "calories": 144.3,
    "protein": 21.32,
    "carbs": 0.22,
    "fats": 6.46,
    "servingSize": "100g"
  },
  {
    "id": "import-485",
    "name": "Top Sirloin Filete Ternera",
    "calories": 140.2,
    "protein": 21.98,
    "carbs": 0.22,
    "fats": 5.71,
    "servingSize": "100g"
  },
  {
    "id": "import-486",
    "name": "Atún",
    "calories": 84.8,
    "protein": 19,
    "carbs": 0.08,
    "fats": 0.94,
    "servingSize": "100g"
  },
  {
    "id": "import-487",
    "name": "Pavo Breakfast Salchicha Butterball",
    "calories": 164.1,
    "protein": 16.7,
    "carbs": 0.93,
    "fats": 10.4,
    "servingSize": "100g"
  },
  {
    "id": "import-488",
    "name": "Pavo Breakfast Salchicha Hillshire Smoked",
    "calories": 164.1,
    "protein": 16.7,
    "carbs": 0.93,
    "fats": 10.4,
    "servingSize": "100g"
  },
  {
    "id": "import-489",
    "name": "Pavo Breakfast Salchicha Honeysuckle",
    "calories": 164.1,
    "protein": 16.7,
    "carbs": 0.93,
    "fats": 10.4,
    "servingSize": "100g"
  },
  {
    "id": "import-490",
    "name": "Pavo Breakfast Salchicha Honeysuckle Blanco",
    "calories": 164.1,
    "protein": 16.7,
    "carbs": 0.93,
    "fats": 10.4,
    "servingSize": "100g"
  },
  {
    "id": "import-491",
    "name": "Pavo Breakfast Salchicha Jennie O",
    "calories": 164.1,
    "protein": 16.7,
    "carbs": 0.93,
    "fats": 10.4,
    "servingSize": "100g"
  },
  {
    "id": "import-492",
    "name": "Pavo Breakfast Salchicha Jimmy Dean",
    "calories": 164.1,
    "protein": 16.7,
    "carbs": 0.93,
    "fats": 10.4,
    "servingSize": "100g"
  },
  {
    "id": "import-493",
    "name": "Pavo Picada",
    "calories": 155.7,
    "protein": 17.34,
    "carbs": 0,
    "fats": 9.59,
    "servingSize": "100g"
  },
  {
    "id": "import-494",
    "name": "Unripe Extra Grande Tamaño Bananas",
    "calories": 91.5,
    "protein": 0.74,
    "carbs": 21.55,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-495",
    "name": "Unripe Medium Tamaño Bananas",
    "calories": 91.5,
    "protein": 0.74,
    "carbs": 21.55,
    "fats": 0.26,
    "servingSize": "100g"
  },
  {
    "id": "import-496",
    "name": "Verdura Aceite",
    "calories": 900,
    "protein": 0,
    "carbs": 0,
    "fats": 100,
    "servingSize": "100g"
  },
  {
    "id": "import-497",
    "name": "Blanco Button Mushrooms",
    "calories": 31.2,
    "protein": 2.89,
    "carbs": 4.08,
    "fats": 0.37,
    "servingSize": "100g"
  },
  {
    "id": "import-498",
    "name": "Blanco Commercially Prepared Pan",
    "calories": 266.8,
    "protein": 9.43,
    "carbs": 49.2,
    "fats": 3.59,
    "servingSize": "100g"
  },
  {
    "id": "import-499",
    "name": "Blanco Dried Huevo",
    "calories": 349.5,
    "protein": 79.9,
    "carbs": 6.02,
    "fats": 0.65,
    "servingSize": "100g"
  },
  {
    "id": "import-500",
    "name": "Blanco Frozen Huevo",
    "calories": 44.8,
    "protein": 10.1,
    "carbs": 0.74,
    "fats": 0.16,
    "servingSize": "100g"
  },
  {
    "id": "import-501",
    "name": "Blanco Grano largo Arroz",
    "calories": 358.7,
    "protein": 7.04,
    "carbs": 80.31,
    "fats": 1.03,
    "servingSize": "100g"
  },
  {
    "id": "import-502",
    "name": "Blanco Arroz Dry",
    "calories": 354.7,
    "protein": 7.1,
    "carbs": 80,
    "fats": 0.7,
    "servingSize": "100g"
  },
  {
    "id": "import-503",
    "name": "Blanco Arroz Grano largo Unenriched",
    "calories": 358.7,
    "protein": 7.04,
    "carbs": 80.31,
    "fats": 1.03,
    "servingSize": "100g"
  },
  {
    "id": "import-504",
    "name": "Entero 3. With Added Vitamin D Leche",
    "calories": 60.6,
    "protein": 3.28,
    "carbs": 4.67,
    "fats": 3.2,
    "servingSize": "100g"
  },
  {
    "id": "import-505",
    "name": "Entero en conserva Tomatoes",
    "calories": 22.5,
    "protein": 0.87,
    "carbs": 4.29,
    "fats": 0.21,
    "servingSize": "100g"
  },
  {
    "id": "import-506",
    "name": "Entero Dried Huevo",
    "calories": 558.1,
    "protein": 48.1,
    "carbs": 1.87,
    "fats": 39.8,
    "servingSize": "100g"
  },
  {
    "id": "import-507",
    "name": "Entero Huevo",
    "calories": 225.8,
    "protein": 15.6,
    "carbs": 1.02,
    "fats": 17.7,
    "servingSize": "100g"
  },
  {
    "id": "import-508",
    "name": "Entero Frozen Huevo",
    "calories": 145.5,
    "protein": 12.3,
    "carbs": 0.91,
    "fats": 10.3,
    "servingSize": "100g"
  },
  {
    "id": "import-509",
    "name": "Entero Grain Rolled Avena",
    "calories": 381.6,
    "protein": 13.5,
    "carbs": 68.66,
    "fats": 5.89,
    "servingSize": "100g"
  },
  {
    "id": "import-510",
    "name": "Entero Grain Steel Cut Avena",
    "calories": 381.2,
    "protein": 12.51,
    "carbs": 69.75,
    "fats": 5.8,
    "servingSize": "100g"
  },
  {
    "id": "import-511",
    "name": "Entero Leche",
    "calories": 41.6,
    "protein": 3.38,
    "carbs": 4.89,
    "fats": 0.95,
    "servingSize": "100g"
  },
  {
    "id": "import-512",
    "name": "Entero Leche Natural Yogur",
    "calories": 57.8,
    "protein": 8.06,
    "carbs": 5.57,
    "fats": 0.37,
    "servingSize": "100g"
  },
  {
    "id": "import-513",
    "name": "Yema Dried Huevo",
    "calories": 640.6,
    "protein": 34.2,
    "carbs": 1.07,
    "fats": 55.5,
    "servingSize": "100g"
  },
  {
    "id": "import-514",
    "name": "Yema Frozen Huevo",
    "calories": 290.7,
    "protein": 15.6,
    "carbs": 0.59,
    "fats": 25.1,
    "servingSize": "100g"
  }
];

export const supplements: Supplement[] = [
  {
    "id": "1",
    "name": "Proteína de Suero (Whey)",
    "brand": "Optimum Nutrition",
    "serving": "1 cazo (30g)",
    "primaryIngredient": "Aislado de Proteína",
    "bestTime": "Post-entreno",
    "score": 4.8,
    "category": "Recuperación"
  },
  {
    "id": "2",
    "name": "Creatina Monohidrato",
    "brand": "Thorne",
    "serving": "1 cazo (5g)",
    "primaryIngredient": "Creatina",
    "bestTime": "Cualquier momento",
    "score": 5,
    "category": "Rendimiento"
  },
  {
    "id": "3",
    "name": "Multivitamínico Diario",
    "brand": "Garden of Life",
    "serving": "1 cápsula",
    "primaryIngredient": "Vitaminas A-K",
    "bestTime": "Mañana",
    "score": 4.6,
    "category": "Bienestar"
  },
  {
    "id": "4",
    "name": "Omega-3 Aceite de Pescado",
    "brand": "Nordic Naturals",
    "serving": "2 perlas",
    "primaryIngredient": "EPA y DHA",
    "bestTime": "Con comidas",
    "score": 4.9,
    "category": "Salud Cardiovascular"
  }
];
