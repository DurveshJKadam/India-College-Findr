class ChatbotService {
  static extractEntities(message) {
    const entities = {
      state: null,
      district: null,
      course: null
    };

    const lowerMessage = message.toLowerCase();

    // State patterns
    const statePatterns = {
      'maharashtra': ['maharashtra', 'mh'],
      'karnataka': ['karnataka', 'ka'],
      'tamil nadu': ['tamil nadu', 'tn', 'tamilnadu'],
      'kerala': ['kerala'],
      'andhra pradesh': ['andhra pradesh', 'ap'],
      'telangana': ['telangana', 'ts'],
      'gujarat': ['gujarat', 'gj'],
      'rajasthan': ['rajasthan', 'rj'],
      'uttar pradesh': ['uttar pradesh', 'up'],
      'madhya pradesh': ['madhya pradesh', 'mp'],
      'west bengal': ['west bengal', 'wb'],
      'bihar': ['bihar'],
      'odisha': ['odisha', 'orissa'],
      'punjab': ['punjab', 'pb'],
      'haryana': ['haryana', 'hr'],
      'himachal pradesh': ['himachal pradesh', 'hp'],
      'uttarakhand': ['uttarakhand', 'uk'],
      'jharkhand': ['jharkhand', 'jh'],
      'chhattisgarh': ['chhattisgarh', 'cg'],
      'assam': ['assam', 'as'],
      'goa': ['goa'],
      'delhi': ['delhi', 'new delhi'],
      'jammu and kashmir': ['jammu and kashmir', 'j&k', 'jk'],
      'ladakh': ['ladakh']
    };

    // District patterns (major cities/districts)
    const districtPatterns = {
      'mumbai': ['mumbai', 'bombay'],
      'pune': ['pune'],
      'nashik': ['nashik'],
      'nagpur': ['nagpur'],
      'aurangabad': ['aurangabad'],
      'bangalore': ['bangalore', 'bengaluru'],
      'mysore': ['mysore', 'mysuru'],
      'mangalore': ['mangalore', 'mangaluru'],
      'chennai': ['chennai', 'madras'],
      'coimbatore': ['coimbatore'],
      'madurai': ['madurai'],
      'kochi': ['kochi', 'cochin'],
      'thiruvananthapuram': ['thiruvananthapuram', 'trivandrum'],
      'hyderabad': ['hyderabad'],
      'visakhapatnam': ['visakhapatnam', 'vizag'],
      'ahmedabad': ['ahmedabad'],
      'surat': ['surat'],
      'vadodara': ['vadodara', 'baroda'],
      'jaipur': ['jaipur'],
      'jodhpur': ['jodhpur'],
      'udaipur': ['udaipur'],
      'lucknow': ['lucknow'],
      'kanpur': ['kanpur'],
      'agra': ['agra'],
      'varanasi': ['varanasi', 'banaras'],
      'indore': ['indore'],
      'bhopal': ['bhopal'],
      'kolkata': ['kolkata', 'calcutta'],
      'patna': ['patna'],
      'bhubaneswar': ['bhubaneswar'],
      'chandigarh': ['chandigarh'],
      'gurgaon': ['gurgaon', 'gurugram'],
      'noida': ['noida'],
      'faridabad': ['faridabad']
    };

    // Course patterns
    const coursePatterns = {
      'computer engineering': ['computer engineering', 'computer science', 'cse', 'cs', 'computer'],
      'information technology': ['information technology', 'it', 'info tech'],
      'artificial intelligence & machine learning (ai/ml)': ['ai/ml', 'aiml', 'artificial intelligence', 'machine learning', 'ai', 'ml'],
      'artificial intelligence & data science (ai/ds)': ['ai/ds', 'aids', 'data science', 'ds'],
      'cybersecurity': ['cybersecurity', 'cyber security', 'security'],
      'management': ['management', 'mba', 'business'],
      'electronics': ['electronics', 'ece', 'electronics engineering'],
      'mechanical': ['mechanical', 'mechanical engineering', 'mech']
    };

    // Extract state
    for (const [state, patterns] of Object.entries(statePatterns)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        entities.state = state;
        break;
      }
    }

    // Extract district
    for (const [district, patterns] of Object.entries(districtPatterns)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        entities.district = district;
        break;
      }
    }

    // Extract course
    for (const [course, patterns] of Object.entries(coursePatterns)) {
      if (patterns.some(pattern => lowerMessage.includes(pattern))) {
        entities.course = course;
        break;
      }
    }

    return entities;
  }

  static formatResponse(userMessage, entities, results) {
    if (results.length === 0) {
      let response = "I couldn't find any colleges matching your criteria";
      
      const criteria = [];
      if (entities.course) criteria.push(`course: ${entities.course}`);
      if (entities.state) criteria.push(`state: ${entities.state}`);
      if (entities.district) criteria.push(`district: ${entities.district}`);
      
      if (criteria.length > 0) {
        response += ` (${criteria.join(', ')})`;
      }
      
      response += ". Please try with different search terms or check if the college information is available in our database.";
      return response;
    }

    let response = `I found ${results.length} college${results.length > 1 ? 's' : ''} matching your query`;
    
    const criteria = [];
    if (entities.course) criteria.push(entities.course);
    if (entities.district) criteria.push(entities.district);
    if (entities.state) criteria.push(entities.state);
    
    if (criteria.length > 0) {
      response += ` for ${criteria.join(' in ')}`;
    }
    
    response += ":\n\n";
    
    // Group results by state and district for better readability
    const groupedResults = {};
    results.forEach(college => {
      const key = `${college.state} - ${college.district}`;
      if (!groupedResults[key]) {
        groupedResults[key] = [];
      }
      groupedResults[key].push(college);
    });

    Object.entries(groupedResults).forEach(([location, colleges]) => {
      response += `${location}:\n`;
      colleges.forEach(college => {
        response += `• ${college.college_name} - ${college.course_name}\n`;
      });
      response += "\n";
    });

    if (results.length >= 50) {
      response += "Note: Showing first 50 results. Please refine your search for more specific results.";
    }

    return response;
  }
}

module.exports = ChatbotService;