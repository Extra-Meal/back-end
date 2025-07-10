import config from "../config/config";
import { IIngredient } from "../types/ingredient.type";
import { IMealModel } from "../types/meal.type";
import { IProductModel } from "../types/product.type";

export function formatMealCard(meal: IMealModel) {
  return `
### 🍽️ ${meal.name}

![${meal.name}](${meal.thumbnail})

**Category**: ${meal.category?.name || "N/A"}  
**Area**: ${meal.area?.name || "N/A"}

📝 ${meal.instructions?.slice(0, 150)}...

🔗 [View Full Recipe](${config.client_url}/meals/${meal._id})
`;
}

export function formatIngredientCard(ingredient: IIngredient & { _id: string }) {
  return `
### 🧂 ${ingredient.name}

![${ingredient.name}](${ingredient.image})

📖 ${ingredient.description?.slice(0, 100) || "No description available."}  
🔗 [View Ingredient](${config.client_url}/ingredients/${ingredient._id})
`;
}

export function formatKitCard(product: IProductModel) {
  return `
### 🛒 Meal Kit: ${product.meal?.name || "Unknown"}

![Meal Kit Image](${product.image})

💰 **Price**: $${product.price.toFixed(2)}  
📦 **Stock**: ${product.stock}  

🔗 [Buy Kit](${config.client_url}/products/${product._id})
`;
}
