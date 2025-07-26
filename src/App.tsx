import { useState, useEffect } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Checkbox } from './components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog'
import { ChefHat, Search, Bookmark, Clock, Users, Calendar, Trash2, Plus, Star, Filter, ChevronDown, ChevronUp, Info, LogOut, User, MessageSquare, Download, Crown, Zap, Check, X, Share2, Facebook, Mail } from 'lucide-react'
import { blink } from './blink/client'

interface NutritionInfo {
  calories: number
  protein: number // grams
  carbohydrates: number // grams
  fat: number // grams
  fiber: number // grams
  sugar: number // grams
}

interface Rating {
  id: string
  userId: string
  recipeId: string
  rating: number
  review?: string
  createdAt: string
  userEmail?: string
}

interface IngredientWithQuantity {
  name: string
  quantity: string
  unit: string
}

interface Recipe {
  id: string
  title: string
  description: string
  cookTime: string
  servings: number
  usedIngredients: string[]
  missingIngredients: string[]
  fullIngredientList?: IngredientWithQuantity[]
  dietaryTags: string[]
  cuisine?: string
  nutrition?: NutritionInfo
  averageRating?: number
  totalRatings?: number
  userRating?: Rating
  instructions?: string[]
}

interface MealPlan {
  [day: string]: {
    meal1?: Recipe
    meal2?: Recipe
  }
}

interface User {
  id: string
  email: string
  displayName?: string
}

interface UserSubscription {
  id: string
  userId: string
  plan: 'free' | 'pro'
  status: 'active' | 'cancelled'
  createdAt: string
  updatedAt: string
}

interface UserUsage {
  id: string
  userId: string
  usageType: 'grocery_list' | 'favorite_recipe' | 'dietary_filter'
  usageCount: number
  weekStart: string
  createdAt: string
  updatedAt: string
}

interface PricingLimits {
  groceryListsPerWeek: number
  maxFavoriteRecipes: number
  maxDietaryFilters: number
  hasEarlyAccess: boolean
}

// Available dietary filters
const dietaryFilters = [
  'Vegan',
  'Vegetarian', 
  'Gluten-Free',
  'Low-Carb',
  'High-Protein'
]

// Available cuisine types
const cuisineTypes = [
  { name: 'Italian', flag: '🇮🇹' },
  { name: 'Indian', flag: '🇮🇳' },
  { name: 'Mexican', flag: '🇲🇽' },
  { name: 'Mediterranean', flag: '🏛️' },
  { name: 'Chinese', flag: '🇨🇳' },
  { name: 'Thai', flag: '🇹🇭' },
  { name: 'American', flag: '🇺🇸' },
  { name: 'Middle Eastern', flag: '🕌' },
  { name: 'French', flag: '🇫🇷' },
  { name: 'Japanese', flag: '🇯🇵' },
  { name: 'Other', flag: '🌍' }
]

// Recipe generation templates and patterns
const recipePatterns = {
  // Main cooking methods
  cookingMethods: [
    { method: 'Stir-Fried', time: '12-15 min', description: 'Quick and flavorful stir-fry with' },
    { method: 'Roasted', time: '25-30 min', description: 'Perfectly roasted dish featuring' },
    { method: 'Sautéed', time: '10-12 min', description: 'Light and healthy sauté with' },
    { method: 'Braised', time: '35-40 min', description: 'Tender braised dish with' },
    { method: 'Grilled', time: '15-20 min', description: 'Smoky grilled combination of' },
    { method: 'Steamed', time: '18-22 min', description: 'Delicate steamed preparation with' },
    { method: 'Pan-Seared', time: '8-10 min', description: 'Crispy pan-seared dish with' },
    { method: 'Baked', time: '30-35 min', description: 'Comforting baked dish featuring' }
  ],

  // Common complementary ingredients by category
  complementaryIngredients: {
    proteins: ['chicken', 'beef', 'pork', 'fish', 'tofu', 'eggs', 'beans', 'lentils'],
    vegetables: ['onions', 'garlic', 'bell peppers', 'carrots', 'celery', 'mushrooms', 'tomatoes', 'spinach', 'broccoli'],
    grains: ['rice', 'pasta', 'quinoa', 'bread', 'noodles', 'couscous', 'barley'],
    dairy: ['cheese', 'milk', 'butter', 'cream', 'yogurt'],
    seasonings: ['salt', 'pepper', 'olive oil', 'soy sauce', 'herbs', 'spices', 'lemon juice', 'vinegar']
  },

  // Cuisine-specific patterns
  cuisineStyles: [
    { style: 'Asian-Inspired', seasonings: ['soy sauce', 'ginger', 'sesame oil', 'garlic', 'green onions'] },
    { style: 'Mediterranean', seasonings: ['olive oil', 'herbs', 'lemon juice', 'garlic', 'tomatoes'] },
    { style: 'Italian', seasonings: ['olive oil', 'basil', 'garlic', 'parmesan', 'tomatoes'] },
    { style: 'Mexican', seasonings: ['cumin', 'chili powder', 'lime juice', 'cilantro', 'onions'] },
    { style: 'Indian', seasonings: ['curry powder', 'turmeric', 'garam masala', 'ginger', 'garlic'] },
    { style: 'American', seasonings: ['salt', 'pepper', 'butter', 'herbs', 'onions'] },
    { style: 'Thai', seasonings: ['fish sauce', 'lime juice', 'chili', 'basil', 'coconut milk'] },
    { style: 'French', seasonings: ['butter', 'herbs', 'wine', 'cream', 'shallots'] },
    { style: 'Japanese', seasonings: ['soy sauce', 'miso', 'sake', 'mirin', 'ginger'] },
    { style: 'Middle Eastern', seasonings: ['cumin', 'coriander', 'sumac', 'tahini', 'lemon juice'] }
  ]
}

// Nutrition data for common ingredients (per 100g)
const ingredientNutrition: { [key: string]: Partial<NutritionInfo> } = {
  // Proteins
  'chicken': { calories: 165, protein: 31, carbohydrates: 0, fat: 3.6, fiber: 0, sugar: 0 },
  'beef': { calories: 250, protein: 26, carbohydrates: 0, fat: 15, fiber: 0, sugar: 0 },
  'pork': { calories: 242, protein: 27, carbohydrates: 0, fat: 14, fiber: 0, sugar: 0 },
  'fish': { calories: 206, protein: 22, carbohydrates: 0, fat: 12, fiber: 0, sugar: 0 },
  'salmon': { calories: 208, protein: 20, carbohydrates: 0, fat: 13, fiber: 0, sugar: 0 },
  'tuna': { calories: 144, protein: 30, carbohydrates: 0, fat: 1, fiber: 0, sugar: 0 },
  'tofu': { calories: 76, protein: 8, carbohydrates: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6 },
  'eggs': { calories: 155, protein: 13, carbohydrates: 1.1, fat: 11, fiber: 0, sugar: 1.1 },
  'beans': { calories: 127, protein: 8.7, carbohydrates: 23, fat: 0.5, fiber: 6.4, sugar: 0.3 },
  'lentils': { calories: 116, protein: 9, carbohydrates: 20, fat: 0.4, fiber: 7.9, sugar: 1.8 },

  // Vegetables
  'spinach': { calories: 23, protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
  'broccoli': { calories: 34, protein: 2.8, carbohydrates: 7, fat: 0.4, fiber: 2.6, sugar: 1.5 },
  'carrots': { calories: 41, protein: 0.9, carbohydrates: 10, fat: 0.2, fiber: 2.8, sugar: 4.7 },
  'tomatoes': { calories: 18, protein: 0.9, carbohydrates: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6 },
  'onions': { calories: 40, protein: 1.1, carbohydrates: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2 },
  'garlic': { calories: 149, protein: 6.4, carbohydrates: 33, fat: 0.5, fiber: 2.1, sugar: 1 },
  'bell peppers': { calories: 31, protein: 1, carbohydrates: 7, fat: 0.3, fiber: 2.5, sugar: 4.2 },
  'mushrooms': { calories: 22, protein: 3.1, carbohydrates: 3.3, fat: 0.3, fiber: 1, sugar: 2 },
  'celery': { calories: 16, protein: 0.7, carbohydrates: 3, fat: 0.2, fiber: 1.6, sugar: 1.3 },
  'cabbage': { calories: 25, protein: 1.3, carbohydrates: 6, fat: 0.1, fiber: 2.5, sugar: 3.2 },

  // Grains & Starches
  'rice': { calories: 130, protein: 2.7, carbohydrates: 28, fat: 0.3, fiber: 0.4, sugar: 0.1 },
  'pasta': { calories: 131, protein: 5, carbohydrates: 25, fat: 1.1, fiber: 1.8, sugar: 0.6 },
  'quinoa': { calories: 120, protein: 4.4, carbohydrates: 22, fat: 1.9, fiber: 2.8, sugar: 0.9 },
  'bread': { calories: 265, protein: 9, carbohydrates: 49, fat: 3.2, fiber: 2.7, sugar: 5.7 },
  'potatoes': { calories: 77, protein: 2, carbohydrates: 17, fat: 0.1, fiber: 2.2, sugar: 0.8 },
  'noodles': { calories: 138, protein: 4.5, carbohydrates: 25, fat: 2.2, fiber: 1.2, sugar: 0.6 },

  // Dairy
  'cheese': { calories: 113, protein: 7, carbohydrates: 1, fat: 9, fiber: 0, sugar: 1 },
  'milk': { calories: 42, protein: 3.4, carbohydrates: 5, fat: 1, fiber: 0, sugar: 5 },
  'butter': { calories: 717, protein: 0.9, carbohydrates: 0.1, fat: 81, fiber: 0, sugar: 0.1 },
  'cream': { calories: 345, protein: 2.8, carbohydrates: 3.4, fat: 37, fiber: 0, sugar: 3.4 },
  'yogurt': { calories: 59, protein: 10, carbohydrates: 3.6, fat: 0.4, fiber: 0, sugar: 3.2 }
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Pricing plan limits
const PRICING_LIMITS: { [key: string]: PricingLimits } = {
  free: {
    groceryListsPerWeek: 3,
    maxFavoriteRecipes: 10,
    maxDietaryFilters: 1,
    hasEarlyAccess: false
  },
  pro: {
    groceryListsPerWeek: -1, // unlimited
    maxFavoriteRecipes: -1, // unlimited
    maxDietaryFilters: -1, // unlimited
    hasEarlyAccess: true
  }
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<'pantry' | 'planner' | 'favorites' | 'grocery'>('pantry')
  const [pantryInput, setPantryInput] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mealPlan, setMealPlan] = useState<MealPlan>({})
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [expandedNutrition, setExpandedNutrition] = useState<{ [key: string]: boolean }>({})
  const [expandedInstructions, setExpandedInstructions] = useState<{ [key: string]: boolean }>({})
  const [expandedReviews, setExpandedReviews] = useState<{ [key: string]: boolean }>({})
  
  // Authentication state
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Subscription and usage state
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [currentUsage, setCurrentUsage] = useState<{ [key: string]: number }>({})
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState('')

  // Rating and review state
  const [ratings, setRatings] = useState<{ [recipeId: string]: Rating[] }>({})
  const [newRating, setNewRating] = useState<{ [recipeId: string]: number }>({})
  const [newReview, setNewReview] = useState<{ [recipeId: string]: string }>({})
  const [isSubmittingRating, setIsSubmittingRating] = useState<{ [recipeId: string]: boolean }>({})

  // Grocery list state
  interface GroceryItem {
    name: string
    quantity: number
    category: string
    checked?: boolean
  }
  
  interface GroceryListByCategory {
    [category: string]: GroceryItem[]
  }
  
  const [groceryList, setGroceryList] = useState<GroceryItem[]>([])
  const [groceryListByCategory, setGroceryListByCategory] = useState<GroceryListByCategory>({})

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)

  // Smart suggestions state
  const [smartSuggestions, setSmartSuggestions] = useState<Recipe[]>([])
  const [recentIngredients, setRecentIngredients] = useState<string[]>([])

  // Trending recipes state
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([])

  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareRecipe, setShareRecipe] = useState<Recipe | null>(null)

  // Get current week start (Monday)
  const getCurrentWeekStart = (): string => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff))
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString().split('T')[0]
  }

  // Load user subscription
  const loadUserSubscription = async (userId: string) => {
    console.log('Loading subscription for user:', userId)
    try {
      const subscriptions = await blink.db.userSubscriptions.list({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' },
        limit: 1
      })

      if (subscriptions.length > 0) {
        setUserSubscription(subscriptions[0])
        console.log('Loaded subscription:', subscriptions[0])
      } else {
        // Create default free subscription
        const newSubscription = {
          id: `sub_${userId}`,
          userId: userId,
          plan: 'free' as const,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        await blink.db.userSubscriptions.create(newSubscription)
        setUserSubscription(newSubscription)
        console.log('Created new free subscription:', newSubscription)
      }
    } catch (error) {
      console.error('Error loading user subscription:', error)
      // Fallback to free subscription if there's an error
      const fallbackSubscription = {
        id: `sub_${userId}_fallback`,
        userId: userId,
        plan: 'free' as const,
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setUserSubscription(fallbackSubscription)
      console.log('Using fallback subscription:', fallbackSubscription)
    }
  }

  // Load current week usage
  const loadCurrentUsage = async (userId: string) => {
    try {
      const weekStart = getCurrentWeekStart()
      const usage = await blink.db.userUsage.list({
        where: { userId: userId, weekStart: weekStart }
      })

      const usageMap: { [key: string]: number } = {}
      usage.forEach(u => {
        usageMap[u.usageType] = u.usageCount
      })

      setCurrentUsage(usageMap)
    } catch (error) {
      console.error('Error loading current usage:', error)
    }
  }

  // Update usage count
  const updateUsage = async (usageType: 'grocery_list' | 'favorite_recipe' | 'dietary_filter', increment: number = 1) => {
    if (!user) return

    try {
      const weekStart = getCurrentWeekStart()
      const usageId = `usage_${user.id}_${usageType}_${weekStart}`

      // Get current usage
      const existingUsage = await blink.db.userUsage.list({
        where: { userId: user.id, usageType: usageType, weekStart: weekStart }
      })

      const newCount = (currentUsage[usageType] || 0) + increment

      if (existingUsage.length > 0) {
        // Update existing usage
        await blink.db.userUsage.update(existingUsage[0].id, {
          usageCount: newCount,
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create new usage record
        await blink.db.userUsage.create({
          id: usageId,
          userId: user.id,
          usageType: usageType,
          usageCount: newCount,
          weekStart: weekStart,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      // Update local state
      setCurrentUsage(prev => ({
        ...prev,
        [usageType]: newCount
      }))
    } catch (error) {
      console.error('Error updating usage:', error)
    }
  }

  // Check if user can perform action
  const canPerformAction = (actionType: 'grocery_list' | 'favorite_recipe' | 'dietary_filter', additionalCount: number = 1): boolean => {
    if (!userSubscription) return false
    
    const limits = PRICING_LIMITS[userSubscription.plan]
    const currentCount = currentUsage[actionType] || 0

    switch (actionType) {
      case 'grocery_list':
        return limits.groceryListsPerWeek === -1 || currentCount + additionalCount <= limits.groceryListsPerWeek
      case 'favorite_recipe':
        return limits.maxFavoriteRecipes === -1 || favoriteRecipes.length + additionalCount <= limits.maxFavoriteRecipes
      case 'dietary_filter':
        return limits.maxDietaryFilters === -1 || selectedFilters.length + additionalCount <= limits.maxDietaryFilters
      default:
        return false
    }
  }

  // Show upgrade modal with reason
  const showUpgradeModalWithReason = (reason: string) => {
    console.log('Showing upgrade modal with reason:', reason)
    setUpgradeReason(reason)
    setShowUpgradeModal(true)
  }

  // Smart upgrade triggers with friendly messaging
  const triggerSmartUpgrade = (action: 'favorites' | 'grocery_lists' | 'multiple_filters') => {
    let message = ""
    
    switch (action) {
      case 'favorites':
        message = "You're building quite a collection! You've saved 5 favorite recipes. Upgrade to Pro to save unlimited favorites and never lose a great recipe again."
        break
      case 'grocery_lists':
        message = "You're really getting organized! You've generated 3 grocery lists this week. Pro users get unlimited grocery lists plus PDF export for easy shopping."
        break
      case 'multiple_filters':
        message = "Looking for something specific? Combine multiple filters like 'Vegan + Italian' to find exactly what you're craving. Pro users can stack unlimited filters."
        break
    }
    
    setUpgradeReason(message)
    setShowUpgradeModal(true)
  }

  // Simulate upgrade to Pro
  const upgradeToPro = async () => {
    if (!user || !userSubscription) return

    try {
      // Update subscription in database
      await blink.db.userSubscriptions.update(userSubscription.id, {
        plan: 'pro',
        updatedAt: new Date().toISOString()
      })

      // Update local state
      setUserSubscription(prev => prev ? { ...prev, plan: 'pro' } : null)
      setShowUpgradeModal(false)
      
      // Show success message (optional)
      console.log('Successfully upgraded to Pro!')
    } catch (error) {
      console.error('Error upgrading to Pro:', error)
      // You could add a toast notification here for better UX
    }
  }

  // Load ratings for recipes
  const loadRatingsForRecipes = async (recipeIds: string[]) => {
    try {
      const allRatings: { [recipeId: string]: Rating[] } = {}
      
      for (const recipeId of recipeIds) {
        const recipeRatings = await blink.db.ratings.list({
          where: { recipeId: recipeId },
          orderBy: { createdAt: 'desc' }
        })
        allRatings[recipeId] = recipeRatings
      }
      
      setRatings(allRatings)
    } catch (error) {
      console.error('Error loading ratings:', error)
    }
  }

  // Calculate average rating and add rating data to recipes
  const enrichRecipesWithRatings = (recipes: Recipe[]): Recipe[] => {
    return recipes.map(recipe => {
      const recipeRatings = ratings[recipe.id] || []
      const totalRatings = recipeRatings.length
      const averageRating = totalRatings > 0 
        ? recipeRatings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings 
        : undefined
      
      const userRating = user 
        ? recipeRatings.find(rating => rating.userId === user.id)
        : undefined

      return {
        ...recipe,
        averageRating,
        totalRatings,
        userRating
      }
    })
  }

  // Submit rating and review
  const submitRating = async (recipeId: string) => {
    if (!user || !newRating[recipeId]) return

    setIsSubmittingRating(prev => ({ ...prev, [recipeId]: true }))

    try {
      const ratingId = `rating_${user.id}_${recipeId}`
      
      // Check if user already rated this recipe
      const existingRating = await blink.db.ratings.list({
        where: { userId: user.id, recipeId: recipeId }
      })

      const ratingData = {
        id: ratingId,
        userId: user.id,
        recipeId: recipeId,
        rating: newRating[recipeId],
        review: newReview[recipeId]?.trim() || undefined,
        createdAt: new Date().toISOString()
      }

      if (existingRating.length > 0) {
        // Update existing rating
        await blink.db.ratings.update(existingRating[0].id, ratingData)
      } else {
        // Create new rating
        await blink.db.ratings.create(ratingData)
      }

      // Reload ratings for this recipe
      await loadRatingsForRecipes([recipeId])

      // Clear form
      setNewRating(prev => ({ ...prev, [recipeId]: 0 }))
      setNewReview(prev => ({ ...prev, [recipeId]: '' }))

    } catch (error) {
      console.error('Error submitting rating:', error)
    } finally {
      setIsSubmittingRating(prev => ({ ...prev, [recipeId]: false }))
    }
  }

  // Load user-specific data from database
  const loadUserData = async (userId: string) => {
    try {
      // Load subscription and usage data
      await loadUserSubscription(userId)
      await loadCurrentUsage(userId)

      // Load favorites
      const favorites = await blink.db.userFavorites.list({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
      })
      const favoriteRecipeData = favorites.map(fav => JSON.parse(fav.recipeData))
      setFavoriteRecipes(favoriteRecipeData)

      // Load meal plans
      const mealPlans = await blink.db.userMealPlans.list({
        where: { userId: userId }
      })
      const mealPlanData: MealPlan = {}
      mealPlans.forEach(plan => {
        if (!mealPlanData[plan.day]) {
          mealPlanData[plan.day] = {}
        }
        const mealSlot = plan.mealSlot === 1 ? 'meal1' : 'meal2'
        mealPlanData[plan.day][mealSlot] = JSON.parse(plan.recipeData)
      })
      setMealPlan(mealPlanData)

      // Load dietary preferences
      const preferences = await blink.db.userPreferences.list({
        where: { userId: userId },
        orderBy: { updatedAt: 'desc' },
        limit: 1
      })
      if (preferences.length > 0) {
        setSelectedFilters(JSON.parse(preferences[0].dietaryFilters))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  // Save user data to database
  const saveFavorites = async (favorites: Recipe[]) => {
    if (!user) return
    
    try {
      // Clear existing favorites
      const existingFavorites = await blink.db.userFavorites.list({
        where: { userId: user.id }
      })
      for (const fav of existingFavorites) {
        await blink.db.userFavorites.delete(fav.id)
      }

      // Save new favorites
      for (const recipe of favorites) {
        await blink.db.userFavorites.create({
          id: `fav_${user.id}_${recipe.id}`,
          userId: user.id,
          recipeData: JSON.stringify(recipe)
        })
      }
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }

  const saveMealPlan = async (mealPlan: MealPlan) => {
    if (!user) return
    
    try {
      // Clear existing meal plans
      const existingPlans = await blink.db.userMealPlans.list({
        where: { userId: user.id }
      })
      for (const plan of existingPlans) {
        await blink.db.userMealPlans.delete(plan.id)
      }

      // Save new meal plans
      for (const [day, meals] of Object.entries(mealPlan)) {
        if (meals.meal1) {
          await blink.db.userMealPlans.create({
            id: `plan_${user.id}_${day}_1`,
            userId: user.id,
            day: day,
            mealSlot: 1,
            recipeData: JSON.stringify(meals.meal1)
          })
        }
        if (meals.meal2) {
          await blink.db.userMealPlans.create({
            id: `plan_${user.id}_${day}_2`,
            userId: user.id,
            day: day,
            mealSlot: 2,
            recipeData: JSON.stringify(meals.meal2)
          })
        }
      }
    } catch (error) {
      console.error('Error saving meal plan:', error)
    }
  }

  const saveDietaryPreferences = async (filters: string[]) => {
    if (!user) return
    
    try {
      // Check if preferences exist
      const existingPrefs = await blink.db.userPreferences.list({
        where: { userId: user.id }
      })

      if (existingPrefs.length > 0) {
        // Update existing preferences
        await blink.db.userPreferences.update(existingPrefs[0].id, {
          dietaryFilters: JSON.stringify(filters),
          updatedAt: new Date().toISOString()
        })
      } else {
        // Create new preferences
        await blink.db.userPreferences.create({
          id: `pref_${user.id}`,
          userId: user.id,
          dietaryFilters: JSON.stringify(filters)
        })
      }
    } catch (error) {
      console.error('Error saving dietary preferences:', error)
    }
  }

  // Check for first-time user and show onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('platemate_onboarding_completed')
    if (!hasSeenOnboarding) {
      setShowOnboarding(true)
    }
    
    // Load recent ingredients from localStorage
    const savedIngredients = localStorage.getItem('platemate_recent_ingredients')
    if (savedIngredients) {
      setRecentIngredients(JSON.parse(savedIngredients))
    }
  }, [])

  // Authentication effect
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setAuthLoading(state.isLoading)
      
      // Load user data when authenticated
      if (state.user && !state.isLoading) {
        loadUserData(state.user.id)
      } else if (!state.user && !state.isLoading) {
        // Clear data when logged out
        setFavoriteRecipes([])
        setMealPlan({})
        setSelectedFilters([])
        setRatings({})
        setUserSubscription(null)
        setCurrentUsage({})
      }
    })
    return unsubscribe
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load ratings when recipes change
  useEffect(() => {
    if (recipes.length > 0) {
      const recipeIds = recipes.map(recipe => recipe.id)
      loadRatingsForRecipes(recipeIds)
    }
  }, [recipes])

  // Authentication functions
  const handleLogin = () => {
    blink.auth.login()
  }

  const handleLogout = () => {
    blink.auth.logout()
  }

  // Filter recipes whenever recipes, selectedFilters, or selectedCuisines change
  useEffect(() => {
    let filtered = recipes

    // Apply dietary filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(recipe => 
        selectedFilters.every(filter => recipe.dietaryTags.includes(filter))
      )
    }

    // Apply cuisine filters
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(recipe => 
        recipe.cuisine && selectedCuisines.includes(recipe.cuisine)
      )
    }

    setFilteredRecipes(enrichRecipesWithRatings(filtered))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipes, selectedFilters, selectedCuisines, ratings])

  // Save favorites when they change (only if user is logged in)
  useEffect(() => {
    if (user && favoriteRecipes.length >= 0) {
      saveFavorites(favoriteRecipes)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [favoriteRecipes, user])

  // Save meal plan when it changes (only if user is logged in)
  useEffect(() => {
    if (user) {
      saveMealPlan(mealPlan)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealPlan, user])

  // Save dietary preferences when they change (only if user is logged in)
  useEffect(() => {
    if (user) {
      saveDietaryPreferences(selectedFilters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilters, user])



  const capitalizeFirst = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

  const generateNutritionInfo = (usedIngredients: string[], missingIngredients: string[], servings: number): NutritionInfo | undefined => {
    const allIngredients = [...usedIngredients, ...missingIngredients]
    const totalNutrition: NutritionInfo = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0
    }

    let foundIngredients = 0

    // Calculate nutrition based on ingredients
    allIngredients.forEach(ingredient => {
      const lowerIngredient = ingredient.toLowerCase()
      
      // Find matching nutrition data
      const nutritionKey = Object.keys(ingredientNutrition).find(key => 
        lowerIngredient.includes(key) || key.includes(lowerIngredient)
      )

      if (nutritionKey && ingredientNutrition[nutritionKey]) {
        const nutrition = ingredientNutrition[nutritionKey]
        // Assume average serving size of 100g per ingredient
        const portionMultiplier = 1.0 // 100g portions
        
        totalNutrition.calories += (nutrition.calories || 0) * portionMultiplier
        totalNutrition.protein += (nutrition.protein || 0) * portionMultiplier
        totalNutrition.carbohydrates += (nutrition.carbohydrates || 0) * portionMultiplier
        totalNutrition.fat += (nutrition.fat || 0) * portionMultiplier
        totalNutrition.fiber += (nutrition.fiber || 0) * portionMultiplier
        totalNutrition.sugar += (nutrition.sugar || 0) * portionMultiplier
        
        foundIngredients++
      }
    })

    // Only return nutrition info if we found data for at least 2 ingredients
    if (foundIngredients >= 2) {
      // Divide by servings to get per-serving nutrition
      return {
        calories: Math.round(totalNutrition.calories / servings),
        protein: Math.round((totalNutrition.protein / servings) * 10) / 10,
        carbohydrates: Math.round((totalNutrition.carbohydrates / servings) * 10) / 10,
        fat: Math.round((totalNutrition.fat / servings) * 10) / 10,
        fiber: Math.round((totalNutrition.fiber / servings) * 10) / 10,
        sugar: Math.round((totalNutrition.sugar / servings) * 10) / 10
      }
    }

    return undefined
  }

  const generateFullIngredientList = (usedIngredients: string[], missingIngredients: string[]): IngredientWithQuantity[] => {
    const allIngredients = [...usedIngredients, ...missingIngredients]
    
    // Common ingredient quantities and units
    const ingredientQuantities: { [key: string]: { quantity: string, unit: string } } = {
      // Proteins
      'chicken': { quantity: '1', unit: 'lb' },
      'beef': { quantity: '1', unit: 'lb' },
      'pork': { quantity: '1', unit: 'lb' },
      'fish': { quantity: '1', unit: 'lb' },
      'salmon': { quantity: '1', unit: 'lb' },
      'tuna': { quantity: '1', unit: 'can' },
      'tofu': { quantity: '1', unit: 'block' },
      'eggs': { quantity: '2', unit: 'large' },
      'beans': { quantity: '1', unit: 'can' },
      'lentils': { quantity: '1', unit: 'cup' },
      
      // Vegetables
      'onions': { quantity: '1', unit: 'medium' },
      'garlic': { quantity: '3', unit: 'cloves' },
      'bell peppers': { quantity: '1', unit: 'large' },
      'carrots': { quantity: '2', unit: 'medium' },
      'celery': { quantity: '2', unit: 'stalks' },
      'mushrooms': { quantity: '8', unit: 'oz' },
      'tomatoes': { quantity: '2', unit: 'medium' },
      'spinach': { quantity: '4', unit: 'cups' },
      'broccoli': { quantity: '1', unit: 'head' },
      'cabbage': { quantity: '½', unit: 'head' },
      'potatoes': { quantity: '2', unit: 'medium' },
      'ginger': { quantity: '1', unit: 'inch piece' },
      
      // Grains & Starches
      'rice': { quantity: '1', unit: 'cup' },
      'pasta': { quantity: '8', unit: 'oz' },
      'quinoa': { quantity: '1', unit: 'cup' },
      'bread': { quantity: '4', unit: 'slices' },
      'noodles': { quantity: '8', unit: 'oz' },
      
      // Dairy
      'cheese': { quantity: '1', unit: 'cup shredded' },
      'milk': { quantity: '1', unit: 'cup' },
      'butter': { quantity: '2', unit: 'tablespoons' },
      'cream': { quantity: '½', unit: 'cup' },
      'yogurt': { quantity: '1', unit: 'cup' },
      
      // Seasonings & Liquids
      'salt': { quantity: '1', unit: 'teaspoon' },
      'pepper': { quantity: '½', unit: 'teaspoon' },
      'olive oil': { quantity: '2', unit: 'tablespoons' },
      'soy sauce': { quantity: '2', unit: 'tablespoons' },
      'vinegar': { quantity: '1', unit: 'tablespoon' },
      'herbs': { quantity: '1', unit: 'tablespoon fresh' },
      'spices': { quantity: '1', unit: 'teaspoon' },
      'lemon juice': { quantity: '2', unit: 'tablespoons' },
      'broth': { quantity: '2', unit: 'cups' },
      'stock': { quantity: '2', unit: 'cups' }
    }
    
    return allIngredients.map(ingredient => {
      const lowerIngredient = ingredient.toLowerCase()
      
      // Find matching quantity data
      const quantityKey = Object.keys(ingredientQuantities).find(key => 
        lowerIngredient.includes(key) || key.includes(lowerIngredient)
      )
      
      if (quantityKey && ingredientQuantities[quantityKey]) {
        const { quantity, unit } = ingredientQuantities[quantityKey]
        return {
          name: ingredient,
          quantity,
          unit
        }
      }
      
      // Default quantities for unmatched ingredients
      return {
        name: ingredient,
        quantity: '1',
        unit: 'piece'
      }
    })
  }

  const generateCookingInstructions = (recipe: { title: string, usedIngredients: string[], missingIngredients: string[], cookTime: string, fullIngredientList?: IngredientWithQuantity[] }): string[] => {
    const allIngredients = [...recipe.usedIngredients, ...recipe.missingIngredients]
    const cookingMethod = recipe.title.toLowerCase()
    
    // Base instruction templates based on cooking method
    const instructionTemplates = {
      'stir-fried': [
        'Heat oil in a large pan or wok over medium-high heat.',
        'Add garlic and aromatics, sauté until fragrant (about 30 seconds).',
        `Add ${recipe.usedIngredients[0]} and cook until browned.`,
        'Stir in remaining vegetables and cook for 3-4 minutes.',
        'Add seasonings and sauces. Toss everything together.',
        'Cook for another 2-3 minutes until heated through.',
        'Serve hot with rice or noodles.'
      ],
      'roasted': [
        'Preheat oven to 400°F (200°C).',
        'Prepare ingredients by washing and cutting into even pieces.',
        `Season ${recipe.usedIngredients[0]} with salt, pepper, and herbs.`,
        'Arrange ingredients on a baking sheet in a single layer.',
        'Drizzle with olive oil and toss to coat evenly.',
        'Roast for 20-25 minutes, turning once halfway through.',
        'Check for doneness and serve immediately.'
      ],
      'sautéed': [
        'Heat oil in a pan over medium heat.',
        'Add garlic and sauté until fragrant.',
        `Add ${recipe.usedIngredients[0]} and cook until tender.`,
        'Season with herbs and spices to taste.',
        'Cook for 8-10 minutes, stirring occasionally.',
        'Adjust seasoning and serve hot.'
      ],
      'braised': [
        'Heat oil in a heavy-bottomed pot over medium-high heat.',
        `Brown ${recipe.usedIngredients[0]} on all sides.`,
        'Add aromatics like onions and garlic, cook until softened.',
        'Add liquid (broth or wine) to cover halfway.',
        'Bring to a simmer, then reduce heat to low.',
        'Cover and cook slowly for 30-35 minutes.',
        'Check tenderness and adjust seasoning before serving.'
      ],
      'grilled': [
        'Preheat grill to medium-high heat.',
        'Clean and oil the grill grates.',
        `Season ${recipe.usedIngredients[0]} with salt, pepper, and desired spices.`,
        'Place on grill and cook for 6-8 minutes per side.',
        'Check for proper doneness with a thermometer if needed.',
        'Let rest for 2-3 minutes before serving.',
        'Serve with fresh herbs or sauce.'
      ],
      'steamed': [
        'Set up a steamer basket over boiling water.',
        'Prepare ingredients by washing and cutting uniformly.',
        `Place ${recipe.usedIngredients[0]} in steamer basket.`,
        'Cover and steam for 15-18 minutes.',
        'Check for tenderness with a fork.',
        'Season lightly with salt and herbs.',
        'Serve immediately while hot.'
      ],
      'pan-seared': [
        'Heat oil in a heavy skillet over medium-high heat.',
        `Pat ${recipe.usedIngredients[0]} dry and season both sides.`,
        'Place in hot pan and don\'t move for 3-4 minutes.',
        'Flip and cook for another 3-4 minutes.',
        'Add butter and herbs to the pan.',
        'Baste with the flavored butter.',
        'Rest for 2 minutes before serving.'
      ],
      'baked': [
        'Preheat oven to 375°F (190°C).',
        'Grease a baking dish with oil or butter.',
        `Layer ${recipe.usedIngredients[0]} in the prepared dish.`,
        'Add seasonings and any liquid ingredients.',
        'Cover with foil and bake for 25-30 minutes.',
        'Remove foil and bake for 5-10 minutes more.',
        'Let cool for 5 minutes before serving.'
      ]
    }
    
    // Find matching cooking method
    let instructions = instructionTemplates['sautéed'] // default
    
    for (const [method, template] of Object.entries(instructionTemplates)) {
      if (cookingMethod.includes(method)) {
        instructions = template
        break
      }
    }
    
    // Customize instructions based on ingredients with quantities
    const customizedInstructions = instructions.map(instruction => {
      let customizedInstruction = instruction
      
      // Replace generic terms with actual ingredients and quantities
      if (recipe.fullIngredientList) {
        // Replace specific ingredient references with quantities
        recipe.fullIngredientList.forEach(ingredient => {
          const ingredientName = ingredient.name.toLowerCase()
          const quantityText = `${ingredient.quantity} ${ingredient.unit} ${ingredient.name.toLowerCase()}`
          
          // Replace ingredient mentions with quantity + name
          if (customizedInstruction.toLowerCase().includes(ingredientName)) {
            const regex = new RegExp(`\\b${ingredientName}\\b`, 'gi')
            customizedInstruction = customizedInstruction.replace(regex, quantityText)
          }
        })
      }
      
      // Replace generic terms with actual ingredients
      if (customizedInstruction.includes('aromatics') && allIngredients.some(ing => ing.toLowerCase().includes('onion'))) {
        const onionIngredient = recipe.fullIngredientList?.find(ing => ing.name.toLowerCase().includes('onion'))
        const replacement = onionIngredient ? `${onionIngredient.quantity} ${onionIngredient.unit} ${onionIngredient.name.toLowerCase()}` : 'onions'
        customizedInstruction = customizedInstruction.replace('aromatics', replacement)
      }
      
      if (customizedInstruction.includes('herbs') && allIngredients.some(ing => ing.toLowerCase().includes('herb'))) {
        const herbIngredient = recipe.fullIngredientList?.find(ing => ing.name.toLowerCase().includes('herb'))
        const replacement = herbIngredient ? `${herbIngredient.quantity} ${herbIngredient.unit} ${herbIngredient.name.toLowerCase()}` : 'herbs'
        customizedInstruction = customizedInstruction.replace('herbs', replacement)
      }
      
      if (customizedInstruction.includes('seasonings') && allIngredients.some(ing => ing.toLowerCase().includes('soy sauce'))) {
        const soyIngredient = recipe.fullIngredientList?.find(ing => ing.name.toLowerCase().includes('soy sauce'))
        const replacement = soyIngredient ? `${soyIngredient.quantity} ${soyIngredient.unit} ${soyIngredient.name.toLowerCase()}` : 'soy sauce'
        customizedInstruction = customizedInstruction.replace('seasonings', `${replacement} and seasonings`)
      }
      
      return customizedInstruction
    })
    
    return customizedInstructions
  }

  const generateDietaryTags = (usedIngredients: string[], missingIngredients: string[]): string[] => {
    const allIngredients = [...usedIngredients, ...missingIngredients].map(ing => ing.toLowerCase())
    const tags: string[] = []

    // Check for animal products
    const animalProducts = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'meat', 'bacon', 'ham']
    const dairyProducts = ['cheese', 'milk', 'butter', 'cream', 'yogurt']
    const hasAnimalProducts = allIngredients.some(ing => 
      animalProducts.some(animal => ing.includes(animal))
    )
    const hasDairy = allIngredients.some(ing => 
      dairyProducts.some(dairy => ing.includes(dairy))
    )
    const hasEggs = allIngredients.some(ing => ing.includes('egg'))

    // Vegan: No animal products, dairy, or eggs
    if (!hasAnimalProducts && !hasDairy && !hasEggs) {
      tags.push('Vegan')
    }

    // Vegetarian: No meat/fish but may have dairy/eggs
    if (!hasAnimalProducts) {
      tags.push('Vegetarian')
    }

    // Gluten-Free: No wheat, pasta, bread, flour
    const glutenIngredients = ['pasta', 'bread', 'flour', 'wheat', 'noodles', 'soy sauce']
    const hasGluten = allIngredients.some(ing => 
      glutenIngredients.some(gluten => ing.includes(gluten))
    )
    if (!hasGluten) {
      tags.push('Gluten-Free')
    }

    // Low-Carb: No rice, pasta, bread, potatoes, quinoa
    const highCarbIngredients = ['rice', 'pasta', 'bread', 'potatoes', 'quinoa', 'noodles', 'couscous', 'barley']
    const hasHighCarbs = allIngredients.some(ing => 
      highCarbIngredients.some(carb => ing.includes(carb))
    )
    if (!hasHighCarbs) {
      tags.push('Low-Carb')
    }

    // High-Protein: Has protein sources
    const proteinSources = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'eggs', 'beans', 'lentils', 'tofu', 'cheese']
    const hasProtein = allIngredients.some(ing => 
      proteinSources.some(protein => ing.includes(protein))
    )
    if (hasProtein) {
      tags.push('High-Protein')
    }

    // Randomly add 1-2 additional tags for variety (30% chance each)
    const remainingTags = dietaryFilters.filter(tag => !tags.includes(tag))
    remainingTags.forEach(tag => {
      if (Math.random() < 0.3) {
        tags.push(tag)
      }
    })

    return tags
  }

  const generateMissingIngredients = (usedIngredients: string[], cuisineStyle: any): string[] => {
    const missing: string[] = []
    
    // Always add cuisine-specific seasonings (2-3)
    const shuffledSeasonings = [...cuisineStyle.seasonings].sort(() => Math.random() - 0.5)
    missing.push(...shuffledSeasonings.slice(0, Math.floor(Math.random() * 2) + 2))

    // Add complementary ingredients based on what's missing
    const hasProtein = usedIngredients.some(ing => 
      recipePatterns.complementaryIngredients.proteins.some(p => 
        ing.toLowerCase().includes(p) || p.includes(ing.toLowerCase())
      )
    )
    
    const hasVegetable = usedIngredients.some(ing => 
      recipePatterns.complementaryIngredients.vegetables.some(v => 
        ing.toLowerCase().includes(v) || v.includes(ing.toLowerCase())
      )
    )

    // Add missing protein if needed
    if (!hasProtein && Math.random() > 0.5) {
      const proteins = recipePatterns.complementaryIngredients.proteins
      missing.push(proteins[Math.floor(Math.random() * proteins.length)])
    }

    // Add missing vegetable if needed
    if (!hasVegetable && Math.random() > 0.3) {
      const vegetables = recipePatterns.complementaryIngredients.vegetables
      missing.push(vegetables[Math.floor(Math.random() * vegetables.length)])
    }

    // Remove duplicates and ingredients user already has
    return [...new Set(missing)]
      .filter(ingredient => 
        !usedIngredients.some(used => 
          used.toLowerCase().includes(ingredient.toLowerCase()) || 
          ingredient.toLowerCase().includes(used.toLowerCase())
        )
      )
      .slice(0, Math.floor(Math.random() * 3) + 2) // 2-4 missing ingredients
  }

  const createUniqueRecipe = (userIngredients: string[], usedCombinations: Set<string>, selectedCuisineFilter?: string[]): Recipe | null => {
    const maxAttempts = 20
    let attempts = 0

    while (attempts < maxAttempts) {
      attempts++

      // Select random cooking method
      const cookingMethod = recipePatterns.cookingMethods[Math.floor(Math.random() * recipePatterns.cookingMethods.length)]
      
      // Select cuisine style based on filter or random
      let availableCuisineStyles = recipePatterns.cuisineStyles
      
      // If cuisine filter is active, only use matching cuisine styles
      if (selectedCuisineFilter && selectedCuisineFilter.length > 0) {
        availableCuisineStyles = recipePatterns.cuisineStyles.filter(style => {
          const cuisineName = style.style.includes('Asian') ? 'Chinese' :
                             style.style.includes('Mediterranean') ? 'Mediterranean' :
                             style.style.includes('Italian') ? 'Italian' :
                             style.style.includes('Mexican') ? 'Mexican' :
                             style.style.includes('Indian') ? 'Indian' :
                             style.style.includes('American') ? 'American' :
                             style.style.includes('Thai') ? 'Thai' :
                             style.style.includes('French') ? 'French' :
                             style.style.includes('Japanese') ? 'Japanese' :
                             style.style.includes('Middle Eastern') ? 'Middle Eastern' :
                             'Other'
          return selectedCuisineFilter.includes(cuisineName)
        })
        
        // If no matching cuisine styles found, fall back to all styles
        if (availableCuisineStyles.length === 0) {
          availableCuisineStyles = recipePatterns.cuisineStyles
        }
      }
      
      const cuisineStyle = availableCuisineStyles[Math.floor(Math.random() * availableCuisineStyles.length)]

      // Determine which user ingredients to use (2-4 ingredients)
      const numIngredientsToUse = Math.min(userIngredients.length, Math.floor(Math.random() * 3) + 2)
      const shuffledIngredients = [...userIngredients].sort(() => Math.random() - 0.5)
      const usedIngredients = shuffledIngredients.slice(0, numIngredientsToUse)

      // Generate missing ingredients based on what's used and cuisine style
      const missingIngredients = generateMissingIngredients(usedIngredients, cuisineStyle)

      // Create recipe title
      const primaryIngredient = usedIngredients[0]
      const title = `${cuisineStyle.style} ${cookingMethod.method} ${capitalizeFirst(primaryIngredient)}`

      // Check if this combination is unique
      if (!usedCombinations.has(title)) {
        // Create description
        const ingredientList = usedIngredients.slice(0, 2).join(' and ')
        const description = `${cookingMethod.description} ${ingredientList} and aromatic seasonings.`

        // Random servings and cook time variation
        const servings = Math.floor(Math.random() * 3) + 2 // 2-4 servings
        const baseTime = parseInt(cookingMethod.time.split('-')[0])
        const timeVariation = Math.floor(Math.random() * 5) - 2 // ±2 minutes
        const cookTime = `${Math.max(5, baseTime + timeVariation)} min`

        // Generate dietary tags
        const dietaryTags = generateDietaryTags(usedIngredients, missingIngredients)

        // Generate nutrition information
        const nutrition = generateNutritionInfo(usedIngredients, missingIngredients, servings)

        // Generate full ingredient list with quantities
        const fullIngredientList = generateFullIngredientList(usedIngredients, missingIngredients)

        // Create recipe object for instruction generation
        const recipeForInstructions = {
          title,
          usedIngredients,
          missingIngredients,
          cookTime,
          fullIngredientList
        }

        // Generate cooking instructions
        const instructions = generateCookingInstructions(recipeForInstructions)

        // Assign cuisine based on cuisine style
        const cuisine = cuisineStyle.style.includes('Asian') ? 'Chinese' :
                       cuisineStyle.style.includes('Mediterranean') ? 'Mediterranean' :
                       cuisineStyle.style.includes('Italian') ? 'Italian' :
                       cuisineStyle.style.includes('Mexican') ? 'Mexican' :
                       cuisineStyle.style.includes('Indian') ? 'Indian' :
                       cuisineStyle.style.includes('American') ? 'American' :
                       cuisineStyle.style.includes('Thai') ? 'Thai' :
                       cuisineStyle.style.includes('French') ? 'French' :
                       cuisineStyle.style.includes('Japanese') ? 'Japanese' :
                       cuisineStyle.style.includes('Middle Eastern') ? 'Middle Eastern' :
                       'Other'

        return {
          id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title,
          description,
          cookTime,
          servings,
          usedIngredients,
          missingIngredients,
          fullIngredientList,
          dietaryTags,
          cuisine,
          nutrition,
          instructions
        }
      }
    }

    return null
  }

  // Dynamic recipe generation function
  const generateRecipes = (userIngredients: string[], selectedCuisineFilter?: string[]): Recipe[] => {
    const recipes: Recipe[] = []
    const usedCombinations = new Set<string>()

    // Generate 5 unique recipes
    for (let i = 0; i < 5; i++) {
      const recipe = createUniqueRecipe(userIngredients, usedCombinations, selectedCuisineFilter)
      if (recipe) {
        recipes.push(recipe)
        usedCombinations.add(recipe.title)
      }
    }

    return recipes
  }

  // Onboarding functions
  const completeOnboarding = () => {
    localStorage.setItem('platemate_onboarding_completed', 'true')
    setShowOnboarding(false)
  }

  const skipOnboarding = () => {
    completeOnboarding()
  }

  const nextOnboardingStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      completeOnboarding()
    }
  }

  // Save recent ingredients to localStorage
  const saveRecentIngredients = (ingredients: string[]) => {
    const updatedIngredients = [...new Set([...ingredients, ...recentIngredients])].slice(0, 10)
    setRecentIngredients(updatedIngredients)
    localStorage.setItem('platemate_recent_ingredients', JSON.stringify(updatedIngredients))
  }

  // Generate smart suggestions based on user data
  const generateSmartSuggestions = () => {
    const suggestions: Recipe[] = []
    const cuisineFilter = selectedCuisines.length > 0 ? selectedCuisines : undefined
    
    // If user has recent ingredients, generate recipes from them
    if (recentIngredients.length > 0) {
      const recentRecipes = generateRecipes(recentIngredients.slice(0, 5), cuisineFilter)
      suggestions.push(...recentRecipes.slice(0, 2))
    }
    
    // If user has favorites, generate similar recipes
    if (favoriteRecipes.length > 0) {
      const favoriteIngredients = favoriteRecipes
        .flatMap(recipe => [...recipe.usedIngredients, ...recipe.missingIngredients])
        .slice(0, 8)
      const favoriteBasedRecipes = generateRecipes(favoriteIngredients, cuisineFilter)
      suggestions.push(...favoriteBasedRecipes.slice(0, 2))
    }
    
    // Fallback to popular combinations for new users
    if (suggestions.length === 0) {
      const popularCombinations = [
        ['chicken', 'broccoli', 'rice'],
        ['salmon', 'asparagus', 'quinoa'],
        ['beef', 'carrots', 'potatoes'],
        ['tofu', 'spinach', 'noodles']
      ]
      const randomCombo = popularCombinations[Math.floor(Math.random() * popularCombinations.length)]
      const popularRecipes = generateRecipes(randomCombo, cuisineFilter)
      suggestions.push(...popularRecipes.slice(0, 3))
    }
    
    // Apply dietary filters if any
    let filteredSuggestions = suggestions
    if (selectedFilters.length > 0) {
      filteredSuggestions = suggestions.filter(recipe => 
        selectedFilters.some(filter => recipe.dietaryTags.includes(filter))
      )
    }
    
    setSmartSuggestions(filteredSuggestions.slice(0, 4))
  }

  // Generate trending recipes based on ratings and favorites
  const generateTrendingRecipes = () => {
    const trendingData = [
      { ingredients: ['chicken', 'garlic', 'herbs'], rating: 4.8, favorites: 156 },
      { ingredients: ['salmon', 'lemon', 'asparagus'], rating: 4.7, favorites: 142 },
      { ingredients: ['pasta', 'tomatoes', 'basil'], rating: 4.6, favorites: 138 },
      { ingredients: ['beef', 'mushrooms', 'onions'], rating: 4.9, favorites: 134 },
      { ingredients: ['tofu', 'soy sauce', 'broccoli'], rating: 4.5, favorites: 128 },
      { ingredients: ['eggs', 'spinach', 'cheese'], rating: 4.7, favorites: 125 }
    ]
    
    // Don't apply cuisine filter to trending recipes - show diverse trending recipes
    const trending = trendingData.map(data => {
      const recipes = generateRecipes(data.ingredients)
      const recipe = recipes[0]
      if (recipe) {
        recipe.averageRating = data.rating
        recipe.totalRatings = Math.floor(Math.random() * 50) + 20
      }
      return recipe
    }).filter(Boolean).slice(0, 6)
    
    setTrendingRecipes(trending)
  }

  // Share recipe functionality
  const handleShareRecipe = (recipe: Recipe) => {
    setShareRecipe(recipe)
    setShowShareModal(true)
  }

  const copyRecipeToClipboard = async (recipe: Recipe) => {
    const recipeText = `🍽️ ${recipe.title}

${recipe.description}

⏱️ Cook Time: ${recipe.cookTime}
👥 Serves: ${recipe.servings}
⭐ Rating: ${recipe.averageRating ? `${recipe.averageRating.toFixed(1)}/5` : 'Not rated yet'}

✅ You have: ${recipe.usedIngredients.join(', ')}
🛒 You need: ${recipe.missingIngredients.join(', ')}

🏷️ Tags: ${recipe.dietaryTags.join(', ')}

Shared from PlateMate - Smart Recipe Finder`

    try {
      await navigator.clipboard.writeText(recipeText)
      // You could add a toast notification here
      console.log('Recipe copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy recipe:', error)
    }
  }

  const shareViaWhatsApp = (recipe: Recipe) => {
    const text = encodeURIComponent(`Check out this recipe: ${recipe.title} - ${recipe.description}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareViaEmail = (recipe: Recipe) => {
    const subject = encodeURIComponent(`Recipe: ${recipe.title}`)
    const body = encodeURIComponent(`I found this great recipe on PlateMate:

${recipe.title}
${recipe.description}

Cook Time: ${recipe.cookTime}
Serves: ${recipe.servings}

You have: ${recipe.usedIngredients.join(', ')}
You need: ${recipe.missingIngredients.join(', ')}

Try it out!`)
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  const shareViaFacebook = (recipe: Recipe) => {
    const text = encodeURIComponent(`Check out this delicious recipe: ${recipe.title}`)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${text}`, '_blank')
  }

  // Generate trending recipes on app load
  useEffect(() => {
    generateTrendingRecipes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Generate smart suggestions when user data changes
  useEffect(() => {
    if (recentIngredients.length > 0 || favoriteRecipes.length > 0 || selectedFilters.length > 0) {
      generateSmartSuggestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentIngredients, favoriteRecipes, selectedFilters])

  const findRecipes = async () => {
    if (!pantryInput.trim()) return

    setIsLoading(true)
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Parse ingredients from input
    const ingredients = pantryInput
      .toLowerCase()
      .split(/[,\s]+/)
      .map(ingredient => ingredient.trim())
      .filter(ingredient => ingredient.length > 1)

    if (ingredients.length === 0) {
      setIsLoading(false)
      return
    }

    // Save recent ingredients
    saveRecentIngredients(ingredients)

    // Generate dynamic recipes with cuisine filter
    const cuisineFilter = selectedCuisines.length > 0 ? selectedCuisines : undefined
    const generatedRecipes = generateRecipes(ingredients, cuisineFilter)
    
    setRecipes(generatedRecipes)
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      findRecipes()
    }
  }

  const handleFilterChange = (filter: string, checked: boolean) => {
    if (checked) {
      // Check if user can add more dietary filters (free users limited to 1)
      if (!canPerformAction('dietary_filter', 1)) {
        // Smart upgrade trigger for multiple filters
        triggerSmartUpgrade('multiple_filters')
        return
      }
    }

    setSelectedFilters(prev => {
      if (checked) {
        return [...prev, filter]
      } else {
        return prev.filter(f => f !== filter)
      }
    })
  }

  const handleCuisineChange = (cuisine: string, checked: boolean) => {
    setSelectedCuisines(prev => {
      if (checked) {
        return [...prev, cuisine]
      } else {
        return prev.filter(c => c !== cuisine)
      }
    })
  }

  const clearFilters = () => {
    setSelectedFilters([])
    setSelectedCuisines([])
  }

  const addRecipeToMeal = (day: string, mealSlot: 'meal1' | 'meal2', recipe: Recipe) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealSlot]: recipe
      }
    }))
  }

  const removeRecipeFromMeal = (day: string, mealSlot: 'meal1' | 'meal2') => {
    setMealPlan(prev => {
      const newPlan = { ...prev }
      if (newPlan[day]) {
        delete newPlan[day][mealSlot]
        if (!newPlan[day].meal1 && !newPlan[day].meal2) {
          delete newPlan[day]
        }
      }
      return newPlan
    })
  }

  const clearWeek = () => {
    setMealPlan({})
  }

  // Favorites management functions
  const isRecipeFavorited = (recipeId: string): boolean => {
    return favoriteRecipes.some(recipe => recipe.id === recipeId)
  }

  const toggleFavorite = (recipe: Recipe) => {
    const isCurrentlyFavorited = favoriteRecipes.some(fav => fav.id === recipe.id)
    
    if (!isCurrentlyFavorited) {
      // Check if user can add more favorites
      if (!canPerformAction('favorite_recipe', 1)) {
        // Smart upgrade trigger for favorites - show at 6th attempt (after 5 saved)
        if (favoriteRecipes.length >= 5) {
          triggerSmartUpgrade('favorites')
        } else {
          showUpgradeModalWithReason(`You can only save up to ${PRICING_LIMITS.free.maxFavoriteRecipes} favorite recipes on the free plan. Upgrade to Pro for unlimited favorites.`)
        }
        return
      }
    }

    setFavoriteRecipes(prev => {
      if (isCurrentlyFavorited) {
        // Remove from favorites
        return prev.filter(fav => fav.id !== recipe.id)
      } else {
        // Add to favorites
        return [...prev, recipe]
      }
    })
  }

  const removeFavorite = (recipeId: string) => {
    setFavoriteRecipes(prev => prev.filter(recipe => recipe.id !== recipeId))
  }

  // Ingredient categorization
  const categorizeIngredient = (ingredient: string): string => {
    const lowerIngredient = ingredient.toLowerCase()
    
    // Produce
    const produce = ['onions', 'garlic', 'bell peppers', 'carrots', 'celery', 'mushrooms', 'tomatoes', 'spinach', 'broccoli', 'cabbage', 'lettuce', 'cucumber', 'potatoes', 'sweet potatoes', 'avocado', 'lemon', 'lime', 'ginger', 'herbs', 'cilantro', 'parsley', 'basil', 'thyme', 'rosemary']
    if (produce.some(item => lowerIngredient.includes(item) || item.includes(lowerIngredient))) {
      return 'Produce'
    }
    
    // Proteins
    const proteins = ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'eggs', 'tofu', 'beans', 'lentils', 'chickpeas', 'turkey', 'shrimp', 'bacon', 'ham']
    if (proteins.some(item => lowerIngredient.includes(item) || item.includes(lowerIngredient))) {
      return 'Meat & Seafood'
    }
    
    // Dairy
    const dairy = ['cheese', 'milk', 'butter', 'cream', 'yogurt', 'sour cream', 'mozzarella', 'parmesan', 'cheddar']
    if (dairy.some(item => lowerIngredient.includes(item) || item.includes(lowerIngredient))) {
      return 'Dairy'
    }
    
    // Grains & Pantry
    const grains = ['rice', 'pasta', 'quinoa', 'bread', 'flour', 'noodles', 'couscous', 'barley', 'oats', 'cereal']
    if (grains.some(item => lowerIngredient.includes(item) || item.includes(lowerIngredient))) {
      return 'Grains & Pantry'
    }
    
    // Spices & Seasonings
    const spices = ['salt', 'pepper', 'olive oil', 'soy sauce', 'vinegar', 'cumin', 'paprika', 'chili powder', 'curry powder', 'turmeric', 'garam masala', 'oregano', 'bay leaves', 'cinnamon', 'nutmeg', 'vanilla', 'sesame oil', 'coconut oil', 'balsamic', 'mustard']
    if (spices.some(item => lowerIngredient.includes(item) || item.includes(lowerIngredient))) {
      return 'Spices & Seasonings'
    }
    
    // Canned & Packaged
    const canned = ['broth', 'stock', 'sauce', 'paste', 'canned', 'coconut milk', 'tomato sauce', 'tomato paste']
    if (canned.some(item => lowerIngredient.includes(item) || item.includes(lowerIngredient))) {
      return 'Canned & Packaged'
    }
    
    // Default category
    return 'Other'
  }

  // Generate grocery list from meal plan
  const generateGroceryList = async () => {
    // Check if user can generate more grocery lists this week
    if (!canPerformAction('grocery_list', 1)) {
      // Smart upgrade trigger for grocery lists - show at 4th attempt (after 3 generated)
      const currentCount = currentUsage['grocery_list'] || 0
      if (currentCount >= 3) {
        triggerSmartUpgrade('grocery_lists')
      } else {
        showUpgradeModalWithReason(`You can only generate ${PRICING_LIMITS.free.groceryListsPerWeek} grocery lists per week on the free plan. Upgrade to Pro for unlimited grocery lists.`)
      }
      return
    }
    const ingredientCounts: { [key: string]: number } = {}
    
    // Extract all ingredients from meal plan and count occurrences
    Object.values(mealPlan).forEach(dayMeals => {
      if (dayMeals.meal1) {
        dayMeals.meal1.missingIngredients.forEach(ingredient => {
          const normalizedName = ingredient.toLowerCase().trim()
          ingredientCounts[normalizedName] = (ingredientCounts[normalizedName] || 0) + 1
        })
      }
      if (dayMeals.meal2) {
        dayMeals.meal2.missingIngredients.forEach(ingredient => {
          const normalizedName = ingredient.toLowerCase().trim()
          ingredientCounts[normalizedName] = (ingredientCounts[normalizedName] || 0) + 1
        })
      }
    })

    // Create grocery items with quantities and categories
    const groceryItems: GroceryItem[] = Object.entries(ingredientCounts).map(([name, quantity]) => {
      const displayName = name.charAt(0).toUpperCase() + name.slice(1)
      return {
        name: displayName,
        quantity,
        category: categorizeIngredient(name),
        checked: false
      }
    })

    // Sort items alphabetically within each category
    groceryItems.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.name.localeCompare(b.name)
    })

    // Group by category
    const groupedItems: GroceryListByCategory = {}
    groceryItems.forEach(item => {
      if (!groupedItems[item.category]) {
        groupedItems[item.category] = []
      }
      groupedItems[item.category].push(item)
    })

    setGroceryList(groceryItems)
    setGroceryListByCategory(groupedItems)
    setCurrentScreen('grocery')

    // Track usage
    await updateUsage('grocery_list', 1)
  }

  // Toggle grocery item checked state
  const toggleGroceryItemChecked = (category: string, itemIndex: number) => {
    setGroceryListByCategory(prev => {
      const newList = { ...prev }
      if (newList[category] && newList[category][itemIndex]) {
        newList[category][itemIndex] = {
          ...newList[category][itemIndex],
          checked: !newList[category][itemIndex].checked
        }
      }
      return newList
    })

    // Also update the flat grocery list
    setGroceryList(prev => {
      const newList = [...prev]
      const item = newList.find(item => 
        item.category === category && 
        item.name === groceryListByCategory[category][itemIndex].name
      )
      if (item) {
        item.checked = !item.checked
      }
      return newList
    })
  }

  // Download grocery list as text file
  const downloadGroceryListAsText = () => {
    let textContent = 'GROCERY LIST\n'
    textContent += `Generated on ${new Date().toLocaleDateString()}\n`
    textContent += `Total items: ${groceryList.length}\n\n`

    Object.entries(groceryListByCategory).forEach(([category, items]) => {
      textContent += `${category.toUpperCase()}\n`
      textContent += '=' + '='.repeat(category.length - 1) + '\n'
      
      items.forEach(item => {
        const checkbox = item.checked ? '[✓]' : '[ ]'
        const quantity = item.quantity > 1 ? ` (${item.quantity} units)` : ''
        textContent += `${checkbox} ${item.name}${quantity}\n`
      })
      textContent += '\n'
    })

    textContent += '\n---\nGenerated by PlateMate - Smart Recipe Finder'

    // Create and download the file
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `grocery-list-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Download grocery list as PDF (using HTML to PDF conversion)
  const downloadGroceryListAsPDF = () => {
    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Grocery List</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6;
            color: #333;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #16a34a;
            padding-bottom: 20px;
          }
          .header h1 { 
            color: #16a34a; 
            margin: 0;
            font-size: 28px;
          }
          .header p { 
            margin: 5px 0; 
            color: #666;
          }
          .category { 
            margin: 25px 0; 
            page-break-inside: avoid;
          }
          .category h2 { 
            color: #16a34a; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 8px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .item { 
            display: flex; 
            align-items: center; 
            margin: 8px 0; 
            padding: 5px 0;
          }
          .checkbox { 
            width: 16px; 
            height: 16px; 
            border: 2px solid #16a34a; 
            margin-right: 12px; 
            display: inline-block;
            position: relative;
          }
          .checkbox.checked { 
            background-color: #16a34a; 
          }
          .checkbox.checked::after {
            content: '✓';
            color: white;
            position: absolute;
            left: 2px;
            top: -2px;
            font-size: 12px;
            font-weight: bold;
          }
          .item-name { 
            flex: 1; 
            font-weight: 500;
          }
          .quantity { 
            color: #f59e0b; 
            font-size: 12px; 
            background: #fef3c7; 
            padding: 2px 8px; 
            border-radius: 12px;
            margin-left: 8px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { margin: 20px; }
            .category { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛒 Grocery List</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
          <p>Total items: ${groceryList.length}</p>
        </div>
    `

    Object.entries(groceryListByCategory).forEach(([category, items]) => {
      htmlContent += `
        <div class="category">
          <h2>${category}</h2>
      `
      
      items.forEach(item => {
        const checkedClass = item.checked ? 'checked' : ''
        const quantity = item.quantity > 1 ? `<span class="quantity">${item.quantity} units</span>` : ''
        htmlContent += `
          <div class="item">
            <div class="checkbox ${checkedClass}"></div>
            <span class="item-name">${item.name}</span>
            ${quantity}
          </div>
        `
      })
      
      htmlContent += '</div>'
    })

    htmlContent += `
        <div class="footer">
          Generated by PlateMate - Smart Recipe Finder
        </div>
      </body>
      </html>
    `

    // Create a new window and print to PDF
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for content to load, then trigger print dialog
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          // Note: The user will need to choose "Save as PDF" in the print dialog
        }, 500)
      }
    }
  }

  // Nutrition toggle function
  const toggleNutritionExpanded = (recipeId: string) => {
    setExpandedNutrition(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }))
  }

  // Instructions toggle function
  const toggleInstructionsExpanded = (recipeId: string) => {
    setExpandedInstructions(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }))
  }

  // Reviews toggle function
  const toggleReviewsExpanded = (recipeId: string) => {
    setExpandedReviews(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }))
  }

  // Render star rating
  const renderStarRating = (rating: number, interactive: boolean = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRatingChange?.(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`h-4 w-4 ${
                star <= rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-primary rounded-xl p-4 mb-4 inline-block">
            <ChefHat className="h-8 w-8 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PlateMate</h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Recipe card component to avoid duplication
  const RecipeCard = ({ recipe, showRemoveFromFavorites = false }: { recipe: Recipe, showRemoveFromFavorites?: boolean }) => {
    const recipeRatings = ratings[recipe.id] || []
    const recentReviews = recipeRatings.filter(r => r.review).slice(0, 3)

    return (
      <Card key={recipe.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:-translate-y-2 hover:scale-105 rounded-3xl">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                {recipe.title}
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2 leading-relaxed">
                {recipe.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleShareRecipe(recipe)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-blue-500"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => showRemoveFromFavorites ? removeFavorite(recipe.id) : toggleFavorite(recipe)}
                  className={`h-8 w-8 p-0 ${
                    showRemoveFromFavorites || isRecipeFavorited(recipe.id)
                      ? 'text-amber-500 hover:text-amber-600' 
                      : 'text-gray-400 hover:text-amber-500'
                  }`}
                >
                  <Star className={`h-4 w-4 ${
                    showRemoveFromFavorites || isRecipeFavorited(recipe.id) ? 'fill-current' : ''
                  }`} />
                </Button>
              )}
            </div>
          </div>
          
          {/* Recipe Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recipe.cookTime}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
            </div>
            {recipe.averageRating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{recipe.averageRating.toFixed(1)}</span>
                <span className="text-gray-400">({recipe.totalRatings})</span>
              </div>
            )}
          </div>

          {/* Cuisine and Dietary Tags */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {/* Cuisine Tag */}
              {recipe.cuisine && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                >
                  {cuisineTypes.find(c => c.name === recipe.cuisine)?.flag} {recipe.cuisine}
                </Badge>
              )}
              
              {/* Dietary Tags */}
              {recipe.dietaryTags.map((tag, index) => (
                <Badge 
                  key={`${tag}-${index}`} 
                  variant="outline" 
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Used Ingredients */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-green-700 mb-2 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              You have ({recipe.usedIngredients.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {recipe.usedIngredients.map((ingredient, index) => (
                <Badge key={`${ingredient}-${index}`} variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>

          {/* Missing Ingredients */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              You need ({recipe.missingIngredients.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {recipe.missingIngredients.map((ingredient, index) => (
                <Badge key={`${ingredient}-${index}`} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                  {ingredient}
                </Badge>
              ))}
            </div>
          </div>

          {/* Full Ingredient List */}
          {recipe.fullIngredientList && recipe.fullIngredientList.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                Full Ingredient List
              </h4>
              <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {recipe.fullIngredientList.map((ingredient, index) => {
                    const isUsed = recipe.usedIngredients.some(used => 
                      used.toLowerCase().includes(ingredient.name.toLowerCase()) || 
                      ingredient.name.toLowerCase().includes(used.toLowerCase())
                    )
                    return (
                      <div 
                        key={`${ingredient.name}-${index}`} 
                        className={`flex items-center justify-between p-2 rounded transition-colors ${
                          isUsed ? 'bg-green-100 border border-green-200' : 'bg-white border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isUsed ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                          <span className={`text-sm font-medium ${isUsed ? 'text-green-800' : 'text-gray-800'}`}>
                            {ingredient.name}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${isUsed ? 'text-green-700' : 'text-amber-700'}`}>
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Information */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleNutritionExpanded(recipe.id)}
              className="w-full justify-between p-2 h-auto text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">View Nutrition Info</span>
              </div>
              {expandedNutrition[recipe.id] ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </Button>

            {expandedNutrition[recipe.id] && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top-2 duration-200">
                {recipe.nutrition ? (
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3">Per Serving:</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calories:</span>
                        <span className="font-medium">{recipe.nutrition.calories}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Protein:</span>
                        <span className="font-medium">{recipe.nutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Carbs:</span>
                        <span className="font-medium">{recipe.nutrition.carbohydrates}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fat:</span>
                        <span className="font-medium">{recipe.nutrition.fat}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-medium">{recipe.nutrition.fiber}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sugar:</span>
                        <span className="font-medium">{recipe.nutrition.sugar}g</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">
                      Nutrition info not available for this recipe.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step-by-Step Instructions */}
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleInstructionsExpanded(recipe.id)}
              className="w-full justify-between p-2 h-auto text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Step-by-Step Instructions</span>
              </div>
              {expandedInstructions[recipe.id] ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </Button>

            {expandedInstructions[recipe.id] && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top-2 duration-200">
                {recipe.instructions && recipe.instructions.length > 0 ? (
                  <div className="space-y-3">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3">Cooking Instructions:</h5>
                    <ol className="space-y-3">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-700 leading-relaxed">
                            {instruction}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">
                      Cooking instructions not available for this recipe.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Ratings and Reviews Section */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReviewsExpanded(recipe.id)}
              className="w-full justify-between p-2 h-auto text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Ratings & Reviews {recipe.totalRatings ? `(${recipe.totalRatings})` : ''}
                </span>
              </div>
              {expandedReviews[recipe.id] ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </Button>

            {expandedReviews[recipe.id] && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top-2 duration-200">
                {/* Average Rating Display */}
                {recipe.averageRating && (
                  <div className="mb-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {renderStarRating(recipe.averageRating)}
                      <span className="text-lg font-semibold">{recipe.averageRating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Based on {recipe.totalRatings} rating{recipe.totalRatings !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* User Rating Form */}
                {user && (
                  <div className="mb-4 p-3 bg-white rounded-lg border">
                    <h6 className="text-sm font-semibold text-gray-800 mb-3">
                      {recipe.userRating ? 'Update your rating' : 'Rate this recipe'}
                    </h6>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Your rating:</label>
                        {renderStarRating(
                          newRating[recipe.id] || recipe.userRating?.rating || 0,
                          true,
                          (rating) => setNewRating(prev => ({ ...prev, [recipe.id]: rating }))
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">Your review (optional):</label>
                        <Textarea
                          placeholder="Share your thoughts about this recipe..."
                          value={newReview[recipe.id] || recipe.userRating?.review || ''}
                          onChange={(e) => setNewReview(prev => ({ ...prev, [recipe.id]: e.target.value }))}
                          maxLength={300}
                          className="text-sm"
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(newReview[recipe.id] || recipe.userRating?.review || '').length}/300 characters
                        </p>
                      </div>
                      
                      <Button
                        size="sm"
                        onClick={() => submitRating(recipe.id)}
                        disabled={!newRating[recipe.id] && !recipe.userRating?.rating || isSubmittingRating[recipe.id]}
                        className="w-full"
                      >
                        {isSubmittingRating[recipe.id] ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          recipe.userRating ? 'Update Rating' : 'Submit Rating'
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Recent Reviews */}
                {recentReviews.length > 0 && (
                  <div>
                    <h6 className="text-sm font-semibold text-gray-800 mb-3">Recent Reviews:</h6>
                    <div className="space-y-3">
                      {recentReviews.map((rating) => (
                        <div key={rating.id} className="p-3 bg-white rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {renderStarRating(rating.rating)}
                              <span className="text-sm font-medium text-gray-700">
                                {rating.userEmail?.split('@')[0] || 'Anonymous'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {rating.review && (
                            <p className="text-sm text-gray-600">{rating.review}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Reviews Message */}
                {!user && recentReviews.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-2">No reviews yet.</p>
                    <p className="text-xs text-gray-400">Sign in to be the first to review this recipe!</p>
                  </div>
                )}

                {user && recentReviews.length === 0 && !recipe.userRating && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Save Button */}
          {user ? (
            <Button 
              variant="outline" 
              onClick={() => showRemoveFromFavorites ? removeFavorite(recipe.id) : toggleFavorite(recipe)}
              className={`w-full border-2 transition-all duration-200 ${
                showRemoveFromFavorites || isRecipeFavorited(recipe.id)
                  ? 'border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100'
                  : 'border-gray-200 hover:border-primary hover:bg-primary hover:text-white'
              }`}
            >
              <Bookmark className={`h-4 w-4 mr-2 ${
                showRemoveFromFavorites || isRecipeFavorited(recipe.id) ? 'fill-current' : ''
              }`} />
              {showRemoveFromFavorites || isRecipeFavorited(recipe.id) ? 'Remove from Favorites' : 'Save Recipe'}
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleLogin}
              className="w-full border-2 border-gray-200 hover:border-primary hover:bg-primary hover:text-white transition-all duration-200"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Sign in to Save Recipe
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderPantryScreen = () => (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Pro Teaser Banner */}
      {userSubscription?.plan === 'free' && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-amber-800">
              <Crown className="h-5 w-5" />
              <span className="font-medium">
                Pro users get full weekly meal plans, auto-generated. Try it!
              </span>
              <Button
                size="sm"
                onClick={() => {
                  setUpgradeReason('Upgrade to plan without limits and unlock the full PlateMate experience!')
                  setShowUpgradeModal(true)
                }}
                className="ml-3 bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1 h-7"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Trending This Week Section */}
      {trendingRecipes.length > 0 && (
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              🔥 Trending This Week
            </h2>
            <p className="text-gray-600">
              Most popular recipes based on user saves and high ratings from our community
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {trendingRecipes.slice(0, 6).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
      )}

      {/* Smart Picks Section */}
      {smartSuggestions.length > 0 && (
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
              🤖 Smart Picks for You
            </h2>
            <p className="text-gray-600">
              Personalized recipes based on your recent ingredients, favorites, and dietary preferences
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {smartSuggestions.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center mb-12">
        {/* Large Logo for Homepage */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-col items-center gap-4">
            <img 
              src="/platemate-logo.png" 
              alt="PlateMate Logo" 
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain drop-shadow-xl animate-fade-in hover:animate-bounce-gentle transition-all duration-300"
            />
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2">
                PlateMate
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 font-medium">
                Smart Recipe Finder
              </p>
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          What ingredients do you have?
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Enter your available ingredients and get 5 unique recipe ideas generated just for you.
        </p>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="e.g., eggs, cabbage, rice or potatoes, lentils, carrots..."
              value={pantryInput}
              onChange={(e) => setPantryInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-14 text-lg pl-6 pr-32 rounded-3xl border-2 border-red-200 focus:border-primary shadow-lg hover:shadow-xl transition-all duration-300"
            />
            <Button
              onClick={findRecipes}
              disabled={isLoading || !pantryInput.trim()}
              className="absolute right-2 top-2 h-10 px-6 rounded-2xl bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Find Recipes
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Quick suggestions */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <span className="text-sm text-gray-500">Try:</span>
          {['eggs, cabbage, rice', 'potatoes, lentils, carrots', 'chicken, tomatoes, pasta', 'salmon, broccoli, quinoa'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setPantryInput(suggestion)}
              className="text-sm bg-white hover:bg-red-50 text-gray-700 px-3 py-1 rounded-full border border-red-200 transition-all duration-200 hover:scale-105 hover:shadow-md"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Cuisine Type Filter */}
      {recipes.length > 0 && (
        <div className="mb-6">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Filter by Cuisine Type</CardTitle>
                </div>
                {selectedCuisines.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCuisines([])}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {cuisineTypes.map((cuisine) => (
                  <div key={cuisine.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={cuisine.name}
                      checked={selectedCuisines.includes(cuisine.name)}
                      onCheckedChange={(checked) => handleCuisineChange(cuisine.name, checked as boolean)}
                    />
                    <label
                      htmlFor={cuisine.name}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                    >
                      <span>{cuisine.flag}</span>
                      {cuisine.name}
                    </label>
                  </div>
                ))}
              </div>
              {selectedCuisines.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Active cuisines:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedCuisines.map((cuisine) => {
                        const cuisineType = cuisineTypes.find(c => c.name === cuisine)
                        return (
                          <Badge key={cuisine} variant="secondary" className="bg-primary/10 text-primary">
                            {cuisineType?.flag} {cuisine}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dietary Filters */}
      {recipes.length > 0 && (
        <div className="mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg rounded-3xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Filter by Dietary Preferences</CardTitle>
                </div>
                {selectedFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {dietaryFilters.map((filter) => (
                  <div key={filter} className="flex items-center space-x-2">
                    <Checkbox
                      id={filter}
                      checked={selectedFilters.includes(filter)}
                      onCheckedChange={(checked) => handleFilterChange(filter, checked as boolean)}
                    />
                    <label
                      htmlFor={filter}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {filter}
                    </label>
                  </div>
                ))}
              </div>
              {selectedFilters.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Active filters:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedFilters.map((filter) => (
                        <Badge key={filter} variant="secondary" className="bg-primary/10 text-primary">
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Section */}
      {filteredRecipes.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {selectedFilters.length > 0 || selectedCuisines.length > 0
                ? `${filteredRecipes.length} filtered recipe${filteredRecipes.length !== 1 ? 's' : ''}`
                : '5 unique recipes generated for you'
              }
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}

      {/* No Results After Filtering */}
      {recipes.length > 0 && filteredRecipes.length === 0 && (selectedFilters.length > 0 || selectedCuisines.length > 0) && (
        <div className="text-center py-12 animate-fade-in">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No recipes match your filters</h3>
            <p className="text-gray-500 mb-4">
              Try removing some {selectedFilters.length > 0 && selectedCuisines.length > 0 ? 'dietary or cuisine' : selectedFilters.length > 0 ? 'dietary' : 'cuisine'} filters to see more recipes.
            </p>
            <Button 
              onClick={clearFilters}
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {recipes.length === 0 && !pantryInput && !isLoading && (
        <div className="text-center py-12 animate-fade-in">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to cook?</h3>
            <p className="text-gray-500 mb-4">
              Start by typing ingredients like 'eggs, rice' above to discover amazing recipes.
            </p>
            <div className="text-sm text-gray-400">
              💡 Try combinations like "chicken, broccoli" or "pasta, tomatoes"
            </div>
          </div>
        </div>
      )}
    </main>
  )

  const renderMealPlannerScreen = () => (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Weekly Meal Planner
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Plan your week with recipes from your pantry search. Add up to 2 meals per day.
        </p>
        
        <Button 
          onClick={clearWeek}
          variant="outline"
          className="border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear Week
        </Button>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {daysOfWeek.map((day) => (
          <Card key={day} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-900 text-center">
                {day}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Meal Slot 1 */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[120px] hover:border-gray-300 transition-colors">
                {mealPlan[day]?.meal1 ? (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                        {mealPlan[day].meal1!.title}
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRecipeFromMeal(day, 'meal1')}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {mealPlan[day].meal1!.cookTime}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">
                      <Plus className="h-6 w-6 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Meal 1</p>
                    {recipes.length > 0 ? (
                      <select
                        className="w-full text-xs border-2 border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all duration-200"
                        onChange={(e) => {
                          const recipe = recipes.find(r => r.id === e.target.value)
                          if (recipe) addRecipeToMeal(day, 'meal1', recipe)
                        }}
                        value=""
                      >
                        <option value="">Select recipe...</option>
                        {recipes.map((recipe) => (
                          <option key={recipe.id} value={recipe.id}>
                            {recipe.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Generate recipes first
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Meal Slot 2 */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 min-h-[120px] hover:border-gray-300 transition-colors">
                {mealPlan[day]?.meal2 ? (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-sm text-gray-900 leading-tight">
                        {mealPlan[day].meal2!.title}
                      </h4>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeRecipeFromMeal(day, 'meal2')}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {mealPlan[day].meal2!.cookTime}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">
                      <Plus className="h-6 w-6 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Meal 2</p>
                    {recipes.length > 0 ? (
                      <select
                        className="w-full text-xs border-2 border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20 bg-white transition-all duration-200"
                        onChange={(e) => {
                          const recipe = recipes.find(r => r.id === e.target.value)
                          if (recipe) addRecipeToMeal(day, 'meal2', recipe)
                        }}
                        value=""
                      >
                        <option value="">Select recipe...</option>
                        {recipes.map((recipe) => (
                          <option key={recipe.id} value={recipe.id}>
                            {recipe.title}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Generate recipes first
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generate Grocery List Button */}
      <div className="text-center mt-12">
        <Button 
          variant="outline"
          size="lg"
          onClick={generateGroceryList}
          disabled={Object.keys(mealPlan).length === 0}
          className="border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 px-8 py-3"
        >
          Generate Grocery List
        </Button>
        {Object.keys(mealPlan).length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Add some recipes to your meal plan first
          </p>
        )}
      </div>

      {/* No Recipes Message */}
      {recipes.length === 0 && (
        <div className="text-center py-12 mt-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to plan your week?</h3>
            <p className="text-gray-500 mb-4">
              Pick meals to plan your week. Generate some recipes first to get started with meal planning.
            </p>
            <Button 
              onClick={() => setCurrentScreen('pantry')}
              className="bg-primary hover:bg-primary/90"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Recipes
            </Button>
          </div>
        </div>
      )}
    </main>
  )

  const renderGroceryListScreen = () => (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Grocery List
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          All the ingredients you need to buy for your weekly meal plan, organized by category.
        </p>
      </div>

      {/* Grocery List */}
      {groceryList.length > 0 ? (
        <div className="animate-fade-in space-y-6">
          {/* Summary Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Shopping List ({groceryList.length} items)
                </CardTitle>
                <div className="flex items-center gap-2">
                  {/* Download Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadGroceryListAsText}
                      className="text-primary hover:bg-primary hover:text-white border-primary"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadGroceryListAsPDF}
                      className="text-primary hover:bg-primary hover:text-white border-primary"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGroceryList([])
                      setGroceryListByCategory({})
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Clear List
                  </Button>
                </div>
              </div>
              <CardDescription>
                Generated from your weekly meal plan • Duplicates combined with quantities
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Categorized Items */}
          {Object.entries(groceryListByCategory).map(([category, items]) => (
            <Card key={category} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  {category}
                  <Badge variant="secondary" className="ml-2 bg-gray-100 text-gray-700">
                    {items.length} item{items.length !== 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item, index) => (
                    <div
                      key={`${item.name}-${index}`}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        item.checked 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <Checkbox
                        id={`${category}-${index}`}
                        checked={item.checked || false}
                        onCheckedChange={() => toggleGroceryItemChecked(category, index)}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <label
                        htmlFor={`${category}-${index}`}
                        className={`flex-1 font-medium cursor-pointer flex items-center justify-between transition-colors ${
                          item.checked 
                            ? 'text-green-700 line-through' 
                            : 'text-gray-800'
                        }`}
                      >
                        <span>{item.name}</span>
                        {item.quantity > 1 && (
                          <Badge 
                            variant="outline" 
                            className={`ml-2 ${
                              item.checked
                                ? 'bg-green-100 text-green-600 border-green-300'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {item.quantity} unit{item.quantity !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <Bookmark className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Your grocery list will appear here</h3>
            <p className="text-gray-500 mb-4">
              Generate your grocery list here once you've planned your meals. Add recipes to your meal plan first.
            </p>
            <Button 
              onClick={() => setCurrentScreen('planner')}
              className="bg-primary hover:bg-primary/90"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Go to Meal Planner
            </Button>
          </div>
        </div>
      )}
    </main>
  )

  const renderFavoritesScreen = () => (
    <main className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Your Favorite Recipes
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          All your starred recipes in one place. Click the ⭐ to remove from favorites.
        </p>
      </div>

      {/* Favorites Grid */}
      {favoriteRecipes.length > 0 ? (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {favoriteRecipes.length} favorite recipe{favoriteRecipes.length !== 1 ? 's' : ''}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} showRemoveFromFavorites={true} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Save your go-to recipes here</h3>
            <p className="text-gray-500 mb-4">
              {user ? 
                "Star recipes from your pantry search to save them here for easy access." :
                "Sign in to save your favorite recipes and access them anywhere."
              }
            </p>
            <Button 
              onClick={() => setCurrentScreen('pantry')}
              className="bg-primary hover:bg-primary/90"
            >
              <Search className="h-4 w-4 mr-2" />
              Find Recipes
            </Button>
          </div>
        </div>
      )}
    </main>
  )

  // Onboarding Modal Component
  const OnboardingModal = () => (
    <Dialog open={showOnboarding} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Welcome to PlateMate! 🍽️
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Step Indicator */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full ${
                  step === onboardingStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="text-center space-y-4">
            {onboardingStep === 1 && (
              <>
                <div className="text-6xl mb-4">🥘</div>
                <h3 className="text-xl font-bold text-gray-900">Tell us what's in your pantry</h3>
                <p className="text-gray-600">
                  Enter your available ingredients and we'll generate personalized recipes just for you.
                </p>
              </>
            )}
            
            {onboardingStep === 2 && (
              <>
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900">Get personalized recipes instantly</h3>
                <p className="text-gray-600">
                  Our smart algorithm creates unique recipes based on what you have, with dietary filters and ratings.
                </p>
              </>
            )}
            
            {onboardingStep === 3 && (
              <>
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-gray-900">Plan your week and generate grocery lists</h3>
                <p className="text-gray-600">
                  Add recipes to your weekly meal planner and automatically generate organized grocery lists.
                </p>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={skipOnboarding}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={nextOnboardingStep}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {onboardingStep === 3 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Share Modal Component
  const ShareModal = () => (
    <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Recipe
          </DialogTitle>
        </DialogHeader>
        
        {shareRecipe && (
          <div className="space-y-4">
            {/* Recipe Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-bold text-gray-900 mb-2">{shareRecipe.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{shareRecipe.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>⏱️ {shareRecipe.cookTime}</span>
                <span>👥 {shareRecipe.servings} servings</span>
                {shareRecipe.averageRating && (
                  <span>⭐ {shareRecipe.averageRating.toFixed(1)}/5</span>
                )}
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => copyRecipeToClipboard(shareRecipe)}
                className="w-full justify-start"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={() => shareViaWhatsApp(shareRecipe)}
                  className="flex-col h-16 text-xs bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <MessageSquare className="h-5 w-5 mb-1 text-green-600" />
                  WhatsApp
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareViaFacebook(shareRecipe)}
                  className="flex-col h-16 text-xs bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  <Facebook className="h-5 w-5 mb-1 text-blue-600" />
                  Facebook
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => shareViaEmail(shareRecipe)}
                  className="flex-col h-16 text-xs bg-gray-50 hover:bg-gray-100 border-gray-200"
                >
                  <Mail className="h-5 w-5 mb-1 text-gray-600" />
                  Email
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )

  // Upgrade Modal Component
  const UpgradeModal = () => (
    <Dialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-7 w-7 text-amber-500" />
            You're doing great — ready to go Pro?
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base leading-relaxed mt-3">
            {upgradeReason || "Upgrade to plan without limits and unlock advanced meal planning features that make cooking effortless."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Benefits of Pro */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl border border-amber-200">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Benefits of Pro
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-800 font-medium">Unlimited planning - save as many recipes and grocery lists as you want</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-800 font-medium">Advanced filters - combine multiple dietary preferences</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-800 font-medium">PDF export - print beautiful grocery lists for shopping</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-800 font-medium">Smart AI planner - get personalized weekly meal suggestions</span>
              </div>
            </div>
          </div>

          {/* Friendly messaging */}
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-blue-800 font-medium">
              "Upgrade to plan without limits."
            </p>
            <p className="text-blue-600 text-sm mt-1">
              Join thousands of home cooks who've simplified their meal planning with Pro
            </p>
          </div>

          {/* Pricing */}
          <div className="bg-white p-5 rounded-xl border-2 border-primary/20">
            <h4 className="font-bold text-gray-900 mb-4 text-center">Simple Pricing</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary">$4.99</div>
                <div className="text-sm text-gray-600">per month</div>
                <div className="text-xs text-gray-500 mt-1">Billed monthly</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 relative">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-600 text-white text-xs">Best Value</Badge>
                </div>
                <div className="text-2xl font-bold text-green-700">$39</div>
                <div className="text-sm text-gray-600">per year</div>
                <div className="text-xs text-green-600 mt-1 font-medium">Save $20/year</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="flex-1 border-2 border-gray-300 hover:bg-gray-50"
            >
              Maybe Later
            </Button>
            <Button
              onClick={async (e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Upgrade to Pro button clicked')
                try {
                  await upgradeToPro()
                  console.log('Upgrade successful!')
                } catch (error) {
                  console.error('Upgrade failed:', error)
                }
              }}
              className="flex-1 bg-gradient-to-r from-primary to-red-500 hover:from-primary/90 hover:to-red-500/90 text-white font-semibold py-3 cursor-pointer"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to PlateMate Pro
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/platemate-logo.png" 
                  alt="PlateMate Logo" 
                  className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain drop-shadow-lg animate-fade-in hover:animate-bounce-gentle transition-all duration-300 cursor-pointer"
                />
                <div className="flex flex-col">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                    PlateMate
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                    Smart Recipe Finder
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Navigation */}
              <nav className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant={currentScreen === 'pantry' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('pantry')}
                  size="sm"
                  className={`${currentScreen === 'pantry' ? 'bg-primary hover:bg-primary/90' : 'hover:bg-green-50'} px-2 sm:px-3`}
                >
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Pantry Recipes</span>
                  <span className="sm:hidden">Pantry</span>
                </Button>
                <Button
                  variant={currentScreen === 'planner' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('planner')}
                  size="sm"
                  className={`${currentScreen === 'planner' ? 'bg-primary hover:bg-primary/90' : 'hover:bg-green-50'} px-2 sm:px-3`}
                >
                  <Calendar className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Meal Planner</span>
                  <span className="sm:hidden">Planner</span>
                </Button>
                <Button
                  variant={currentScreen === 'favorites' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('favorites')}
                  size="sm"
                  className={`${currentScreen === 'favorites' ? 'bg-primary hover:bg-primary/90' : 'hover:bg-green-50'} px-2 sm:px-3`}
                >
                  <Star className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Favorites</span>
                  <span className="sm:hidden">Fav</span>
                  {user && favoriteRecipes.length > 0 && (
                    <Badge variant="secondary" className="ml-1 sm:ml-2 bg-amber-100 text-amber-800 text-xs">
                      {favoriteRecipes.length}
                    </Badge>
                  )}
                </Button>
                <Button
                  variant={currentScreen === 'grocery' ? 'default' : 'ghost'}
                  onClick={() => setCurrentScreen('grocery')}
                  size="sm"
                  className={`${currentScreen === 'grocery' ? 'bg-primary hover:bg-primary/90' : 'hover:bg-green-50'} px-2 sm:px-3`}
                >
                  <Bookmark className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Grocery List</span>
                  <span className="sm:hidden">List</span>
                  {groceryList.length > 0 && (
                    <Badge variant="secondary" className="ml-1 sm:ml-2 bg-green-100 text-green-800 text-xs">
                      {groceryList.length}
                    </Badge>
                  )}
                </Button>
              </nav>

              {/* User Authentication */}
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Go Pro Button - Less Aggressive */}
                  {userSubscription?.plan === 'free' && (
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Go Pro button clicked - subscription:', userSubscription)
                        setUpgradeReason('Upgrade to plan without limits and unlock the full PlateMate experience!')
                        setShowUpgradeModal(true)
                      }}
                      variant="outline"
                      size="sm"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 cursor-pointer px-2 sm:px-3"
                    >
                      <Crown className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Pro</span>
                    </Button>
                  )}
                  
                  {/* Pro Badge */}
                  {userSubscription?.plan === 'pro' && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                      <Crown className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Pro</span>
                    </Badge>
                  )}
                  
                  <div className="hidden md:flex items-center gap-2 text-sm text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="truncate max-w-32">{user.displayName || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-800 px-2"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleLogin}
                  size="sm"
                  className="bg-primary hover:bg-primary/90 px-3 sm:px-4"
                >
                  <span className="hidden sm:inline">Login / Sign Up</span>
                  <span className="sm:hidden">Login</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Pro Teaser Banner */}
      {userSubscription?.plan === 'free' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-amber-700">
                  <Crown className="h-5 w-5" />
                  <span className="font-medium">Pro users get full weekly meal plans, auto-generated. Try it!</span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setUpgradeReason('Upgrade to PlateMate Pro for unlimited access to all features!')
                  setShowUpgradeModal(true)
                }}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm px-4 py-2"
              >
                <Zap className="h-4 w-4 mr-1" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentScreen === 'pantry' && renderPantryScreen()}
      {currentScreen === 'planner' && renderMealPlannerScreen()}
      {currentScreen === 'favorites' && renderFavoritesScreen()}
      {currentScreen === 'grocery' && renderGroceryListScreen()}

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-green-100 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600">
            Made with ❤️ for home cooks everywhere
          </p>
        </div>
      </footer>

      {/* Modals */}
      <OnboardingModal />
      <ShareModal />
      <UpgradeModal />
    </div>
  )
}

export default App