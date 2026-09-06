const payload = {
  "student": {
    "name": "Jane Doe",
    "skills": [
      { "name": "Python", "level": 85 },
      { "name": "SQL", "level": 70 }
    ],
    "interests": ["Machine Learning", "Data Science"],
    "careerGoals": ["AI Engineer"],
    "education": {
      "degree": "B.Tech",
      "branch": "Computer Science"
    },
    "preferences": {
      "remote": true
    },
    "experience": [
      { "title": "Data Intern" }
    ]
  },
  "opportunity": {
    "_id": "opp_test_123",
    "title": "Machine Learning Intern",
    "skills": [
      { "skill": "Python" },
      { "skill": "Machine Learning" }
    ],
    "tags": ["Machine Learning", "AI"],
    "careerDomains": ["AI Engineer", "Data Scientist"],
    "type": "INTERNSHIP",
    "remote": true,
    "eligibility": {
      "degrees": ["B.Tech"]
    }
  }
};

fetch('http://localhost:3000/api/recommendations/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
})
  .then(res => res.json())
  .then(data => console.log('Response:', JSON.stringify(data, null, 2)))
  .catch(err => console.error('Error:', err));
