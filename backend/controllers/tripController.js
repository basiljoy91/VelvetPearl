// backend/controllers/tripController.js

// Mock Database of destinations for recommendations
const destinations = [
  {
    id: 'd1',
    name: 'Ooty',
    location: 'Tamil Nadu, India',
    description: 'The Queen of Hill Stations. Famous for tea gardens, lakes, and the Nilgiri Mountain Railway.',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80',
    tags: ['Hill stations', 'Nature', 'Family trips', 'Peaceful destinations'],
    budget_tier: 'Medium',
    min_days: 2,
    max_days: 5,
    estimated_budget: '₹8,000 - ₹15,000',
    activities: ['Botanical Garden Visit', 'Ooty Lake Boating', 'Nilgiri Toy Train Ride']
  },
  {
    id: 'd2',
    name: 'Kodaikanal',
    location: 'Tamil Nadu, India',
    description: 'Princess of Hill Stations featuring a star-shaped man-made lake and breathtaking viewpoints.',
    image: 'https://images.unsplash.com/photo-1599814545084-5f56f1a8e132?auto=format&fit=crop&q=80',
    tags: ['Hill stations', 'Nature', 'Peaceful destinations', 'Family trips', 'Trekking'],
    budget_tier: 'Medium',
    min_days: 2,
    max_days: 4,
    estimated_budget: '₹7,000 - ₹12,000',
    activities: ['Coaker\'s Walk', 'Kodai Lake', 'Pillar Rocks', 'Trekking']
  },
  {
    id: 'd3',
    name: 'Manali',
    location: 'Himachal Pradesh, India',
    description: 'A high-altitude Himalayan resort town known for its cool climate and snow-capped peaks.',
    image: 'https://images.unsplash.com/photo-1605649487212-4d567bb3057e?auto=format&fit=crop&q=80',
    tags: ['Snowfall places', 'Hill stations', 'Adventure', 'Trekking'],
    budget_tier: 'Luxury',
    min_days: 4,
    max_days: 7,
    estimated_budget: '₹15,000 - ₹30,000',
    activities: ['Rohtang Pass', 'Solang Valley Sports', 'Hadimba Temple']
  },
  {
    id: 'd4',
    name: 'Munnar',
    location: 'Kerala, India',
    description: 'Rolling hills dotted with tea plantations established in the late 19th century.',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&q=80',
    tags: ['Hill stations', 'Nature', 'Peaceful destinations'],
    budget_tier: 'Medium',
    min_days: 2,
    max_days: 5,
    estimated_budget: '₹10,000 - ₹18,000',
    activities: ['Eravikulam National Park', 'Tea Museum', 'Mattupetty Dam']
  },
  {
    id: 'd5',
    name: 'Yercaud',
    location: 'Tamil Nadu, India',
    description: 'A quiet, inexpensive hill station nestled in the Shevaroy Hills of the Eastern Ghats.',
    image: 'https://images.unsplash.com/photo-1627993466184-5a210d7fc0bc?auto=format&fit=crop&q=80',
    tags: ['Hill stations', 'Nature', 'Peaceful destinations'],
    budget_tier: 'Low',
    min_days: 1,
    max_days: 3,
    estimated_budget: '₹4,000 - ₹8,000',
    activities: ['Emerald Lake', 'Lady\'s Seat', 'Killiyur Falls']
  },
  {
    id: 'd6',
    name: 'Rishikesh',
    location: 'Uttarakhand, India',
    description: 'Yoga capital of the world and a major destination for river rafting and adventure.',
    image: 'https://images.unsplash.com/photo-1605634571937-251f04499dce?auto=format&fit=crop&q=80',
    tags: ['Adventure', 'Nature', 'Peaceful destinations'],
    budget_tier: 'Medium',
    min_days: 3,
    max_days: 5,
    estimated_budget: '₹8,000 - ₹14,000',
    activities: ['River Rafting', 'Bungee Jumping', 'Ganga Aarti', 'Yoga']
  },
  {
    id: 'd7',
    name: 'Pondicherry',
    location: 'Puducherry, India',
    description: 'A charming coastal town blending French colonial architecture with traditional Indian culture.',
    image: 'https://images.unsplash.com/photo-1622308644420-a6125032dfa9?auto=format&fit=crop&q=80',
    tags: ['Peaceful destinations', 'Family trips'],
    budget_tier: 'Low',
    min_days: 2,
    max_days: 4,
    estimated_budget: '₹6,000 - ₹12,000',
    activities: ['Auroville Visit', 'Promenade Beach Walk', 'French Quarter Exploration']
  },
  {
    id: 'd8',
    name: 'Gulmarg',
    location: 'Jammu & Kashmir, India',
    description: 'A popular skiing destination offering panoramic views of the snow-clad Himalayas.',
    image: 'https://images.unsplash.com/photo-1596706037568-d0f507ed6b7b?auto=format&fit=crop&q=80',
    tags: ['Snowfall places', 'Adventure', 'Family trips', 'Hill stations'],
    budget_tier: 'Luxury',
    min_days: 4,
    max_days: 7,
    estimated_budget: '₹25,000 - ₹45,000',
    activities: ['Gondola Ride', 'Skiing', 'Snowboarding']
  },
  {
    id: 'd9',
    name: 'Mahabalipuram',
    location: 'Tamil Nadu, India',
    description: 'An ancient historic town and a bustling seaport with UNESCO World Heritage stone carvings.',
    image: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80',
    tags: ['Peaceful destinations', 'Family trips', 'Nature'],
    budget_tier: 'Low',
    min_days: 1,
    max_days: 3,
    estimated_budget: '₹3,000 - ₹7,000',
    activities: ['Shore Temple', 'Pancha Rathas', 'Surfing']
  },
  {
    id: 'd10',
    name: 'Kanyakumari',
    location: 'Tamil Nadu, India',
    description: 'The southernmost tip of India, famous for its beautiful sunrises and sunsets over the ocean.',
    image: 'https://images.unsplash.com/photo-1625026921389-9e8c3b7b2518?auto=format&fit=crop&q=80',
    tags: ['Peaceful destinations', 'Family trips', 'Nature'],
    budget_tier: 'Medium',
    min_days: 2,
    max_days: 4,
    estimated_budget: '₹6,000 - ₹10,000',
    activities: ['Vivekananda Rock Memorial', 'Thiruvalluvar Statue', 'Sunset View']
  },
  {
    id: 'd11',
    name: 'Coonoor',
    location: 'Tamil Nadu, India',
    description: 'A quieter alternative to Ooty, known for its production of Nilgiri tea and serene views.',
    image: 'https://images.unsplash.com/photo-1627993466184-5a210d7fc0bc?auto=format&fit=crop&q=80',
    tags: ['Hill stations', 'Nature', 'Peaceful destinations'],
    budget_tier: 'Medium',
    min_days: 2,
    max_days: 4,
    estimated_budget: '₹7,000 - ₹12,000',
    activities: ['Sim\'s Park', 'Dolphin\'s Nose', 'Highfield Tea Factory']
  },
  {
    id: 'd12',
    name: 'Wayanad',
    location: 'Kerala, India',
    description: 'A rural district full of waterfalls, historical caves, comfortable resorts and homestays.',
    image: 'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?auto=format&fit=crop&q=80',
    tags: ['Hill stations', 'Nature', 'Trekking', 'Adventure', 'Peaceful destinations'],
    budget_tier: 'Medium',
    min_days: 3,
    max_days: 6,
    estimated_budget: '₹9,000 - ₹16,000',
    activities: ['Edakkal Caves', 'Banasura Sagar Dam', 'Chembra Peak Trek']
  },
  {
    id: 'd13',
    name: 'Andaman Islands',
    location: 'Andaman & Nicobar, India',
    description: 'Pristine white-sand beaches, crystal clear waters, and world-class scuba diving.',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80',
    tags: ['Nature', 'Adventure', 'Family trips', 'Peaceful destinations'],
    budget_tier: 'Luxury',
    min_days: 5,
    max_days: 10,
    estimated_budget: '₹30,000 - ₹60,000',
    activities: ['Scuba Diving', 'Radhanagar Beach', 'Cellular Jail']
  }
];

const getRecommendations = async (req, res) => {
  try {
    const { budget, days, interests } = req.body;

    if (!budget || !days || !interests || !Array.isArray(interests)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid input. Budget, days, and interests (array) are required.' 
      });
    }

    const requestedDays = parseInt(days, 10);

    // Filter algorithm (Strict Match)
    const strictMatches = destinations.filter(dest => {
      // 1. Strict Budget Match
      const budgetMatch = dest.budget_tier === budget;

      // 2. Strict Days Match
      const daysMatch = requestedDays >= dest.min_days && requestedDays <= dest.max_days;

      // 3. Strict Interests Match (At least one selected interest must match)
      const matchedInterests = dest.tags.filter(tag => interests.includes(tag));
      const interestsMatch = matchedInterests.length > 0;

      return budgetMatch && daysMatch && interestsMatch;
    });

    // Score the strict matches to rank them (if multiple exist)
    const scoredDestinations = strictMatches.map(dest => {
      const matchedInterests = dest.tags.filter(tag => interests.includes(tag));
      return {
        ...dest,
        matchScore: matchedInterests.length, // More matching interests = higher rank
        matchReasons: [
          `Matches ${budget} budget`,
          `Perfect for ${requestedDays} days`,
          `Features: ${matchedInterests.join(', ')}`
        ]
      };
    });

    // Sort by score descending and take top 4
    const recommended = scoredDestinations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 4);

    res.status(200).json({
      success: true,
      data: recommended
    });

  } catch (error) {
    console.error('Error generating trip recommendations:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  getRecommendations
};
