require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const products = [
  [
    "carrots",
    "Fresh Organic Carrots",
    120,
    "kg",
    "vegetables",
    "https://images.unsplash.com/photo-1445282768818-728615cc910a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "spinach",
    "Fresh Spinach Leaves",
    80,
    "bunch",
    "vegetables",
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "tomatoes",
    "Farm Fresh Tomatoes",
    90,
    "kg",
    "vegetables",
    "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "cucumbers",
    "Fresh Cucumbers",
    60,
    "kg",
    "vegetables",
    "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "potatoes",
    "Farm Fresh Potatoes",
    40,
    "kg",
    "vegetables",
    "https://images.unsplash.com/photo-1518977676601-b53f82aba655?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "broccoli",
    "Fresh Broccoli",
    150,
    "piece",
    "vegetables",
    "https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "apples",
    "Himachal Apples",
    180,
    "kg",
    "fruits",
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "bananas",
    "Premium Bananas",
    60,
    "dozen",
    "fruits",
    "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "rice",
    "Organic Basmati Rice",
    220,
    "kg",
    "grains",
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ],
  [
    "dal",
    "Yellow Moong Dal",
    140,
    "kg",
    "pulses",
    "https://images.unsplash.com/photo-1780478238047-13e4e6c07cba?ixlib=rb-4.1.0&auto=format&fit=crop&w=800&q=80",
  ],
].map(([id, name, priceRupees, unitLabel, category, img]) => ({
  _id: id,
  name,
  priceRupees,
  unitLabel,
  category,
  img,
  description: `${name} from our trusted partner farms.`,
  ratingText: "(4.8)",
  ratingScore: 4.8,
}));

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
    await mongoose.disconnect();
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
