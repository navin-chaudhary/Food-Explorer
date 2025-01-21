import React from 'react';

const NutritionFacts = ({ nutriments, ingredients_text }) => {
  const formatNutrient = (value, unit = 'g') => {
    if (value === undefined || value === null) return 'N/A';
    return `${parseFloat(value).toFixed(1)}${unit}`;
  };

  const nutritionItems = [
    { label: 'Energy', value: formatNutrient(nutriments?.energy_100g, 'kcal'), icon: '⚡' },
    { label: 'Proteins', value: formatNutrient(nutriments?.proteins_100g), icon: '🥩' },
    { label: 'Carbohydrates', value: formatNutrient(nutriments?.carbohydrates_100g), icon: '🌾' },
    { label: 'Fat', value: formatNutrient(nutriments?.fat_100g), icon: '🥑' },
    { label: 'Fiber', value: formatNutrient(nutriments?.fiber_100g), icon: '🥬' },
    { label: 'Salt', value: formatNutrient(nutriments?.salt_100g), icon: '🧂' }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Nutrition Facts <span className="text-gray-500 text-lg">(per 100g)</span>
        </h3>
        <div className="grid grid-cols-2 gap-6">
          {nutritionItems.map((item, index) => (
            <div 
              key={index} 
              className="bg-gray-100 backdrop-blur-sm p-4 rounded-xl hover:shadow-md transition-all duration-300 group hover:bg-gray-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{item.icon}</span>
                <p className="text-sm font-medium text-gray-600">{item.label}</p>
              </div>
              <p className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {ingredients_text && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h3>
          <p className="text-gray-700 leading-relaxed text-lg">{ingredients_text}</p>
        </div>
      )}
    </div>
  );
};

export default NutritionFacts;