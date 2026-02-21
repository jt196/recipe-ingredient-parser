import { i18nMap } from './index.js'

const baseNutrientAliases = {
	calories: ['calories', 'calorie', 'energy', 'kcal', 'kilocalories'],
	carbohydrates: ['carbohydrate', 'carbohydrates', 'carbs', 'carb'],
	protein: ['protein', 'proteins'],
	fat: ['fat', 'total fat', 'fats'],
	saturatedFat: ['saturated fat'],
	transFat: ['trans fat'],
	polyunsaturatedFat: ['polyunsaturated fat'],
	monounsaturatedFat: ['monounsaturated fat'],
	cholesterol: ['cholesterol'],
	sodium: ['sodium', 'salt'],
	potassium: ['potassium'],
	fiber: ['fiber', 'fibre', 'dietary fiber', 'dietary fibre'],
	sugar: ['sugar', 'sugars'],
	vitaminA: ['vitamin a'],
	vitaminC: ['vitamin c'],
	vitaminD: ['vitamin d'],
	vitaminE: ['vitamin e'],
	vitaminK: ['vitamin k'],
	calcium: ['calcium'],
	iron: ['iron']
}

const baseDisplayNames = {
	calories: 'Calories',
	carbohydrates: 'Carbohydrates',
	protein: 'Protein',
	fat: 'Fat',
	saturatedFat: 'Saturated Fat',
	transFat: 'Trans Fat',
	polyunsaturatedFat: 'Polyunsaturated Fat',
	monounsaturatedFat: 'Monounsaturated Fat',
	cholesterol: 'Cholesterol',
	sodium: 'Sodium',
	potassium: 'Potassium',
	fiber: 'Fiber',
	sugar: 'Sugar',
	vitaminA: 'Vitamin A',
	vitaminC: 'Vitamin C',
	vitaminD: 'Vitamin D',
	vitaminE: 'Vitamin E',
	vitaminK: 'Vitamin K',
	calcium: 'Calcium',
	iron: 'Iron'
}

const baseIgnoreTokens = [
	'nutrition facts',
	'amount per serving',
	'% daily value',
	'daily value',
	'full nutrition',
	'guidelines',
	'servings:',
	'serving size',
	'amounts per',
	'this recipe is'
]

const baseExtraUnitAliases = {
	kcal: ['kcal'],
	kj: ['kj'],
	mg: ['mg'],
	g: ['g'],
	kg: ['kg'],
	mcg: ['mcg', 'µg', 'μg', 'ug'],
	iu: ['iu'],
	ml: ['ml'],
	l: ['l'],
	percent: ['%']
}

function buildLocaleFromConfig(config = {}) {
	const nutrientAliases = config.nutrientAliases
		? config.nutrientAliases
		: Object.fromEntries(
				Object.entries(baseNutrientAliases).map(([canonical, aliases]) => [
					canonical,
					[...aliases, ...((config.nutrientAliasExtras && config.nutrientAliasExtras[canonical]) || [])]
				])
			)

	const nutrientDisplayNames = config.nutrientDisplayNames || baseDisplayNames
	const perServingPhrases = config.perServingPhrases || ['per serving', 'amount per serving', 'serving:']
	const ignoreTokens = config.ignoreTokens || [...baseIgnoreTokens, ...(config.ignoreTokenExtras || [])]

	const extraUnitAliases = config.extraUnitAliases
		? config.extraUnitAliases
		: Object.fromEntries(
				Object.entries(baseExtraUnitAliases).map(([canonical, aliases]) => [
					canonical,
					[...aliases, ...((config.extraUnitAliasExtras && config.extraUnitAliasExtras[canonical]) || [])]
				])
			)

	return {
		nutrientAliases,
		nutrientDisplayNames,
		perServingPhrases,
		ignoreTokens,
		extraUnitAliases
	}
}

const nutritionI18n = Object.fromEntries(
	Object.entries(i18nMap).map(([code, langData]) => [code, buildLocaleFromConfig(langData?.nutrition || {})])
)

export function getNutritionLocale(language = 'eng') {
	if (nutritionI18n[language]) {
		return nutritionI18n[language]
	}
	return nutritionI18n.eng
}

export function getNutritionLocalesWithFallback(language = 'eng') {
	const requested = getNutritionLocale(language)
	if (language === 'eng') {
		return [requested]
	}
	return [requested, nutritionI18n.eng]
}

export { nutritionI18n }
