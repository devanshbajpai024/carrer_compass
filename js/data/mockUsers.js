/**
 * mockUsers.js
 * Demo student profiles for demonstrating the recommendation engine.
 * The recommendation engine must produce DIFFERENT results for each profile.
 * Replace with real user data from backend when available.
 */

const DEMO_PROFILES = {
  // Profile 1: AI/ML focused 3rd year student
  "demo-ai": {
    id: "demo-ai",
    name: "Arjun Sharma",
    email: "arjun@demo.com",
    avatar: null,
    basic: {
      age: 21,
      college: "IIT Delhi",
      degree: "B.Tech",
      branch: "Computer Science & AI",
      year: 3,
      semester: 6,
      location: "Delhi, India",
      cgpa: 8.9,
    },
    skills: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "TensorFlow",
      "PyTorch",
      "SQL",
      "Data Analysis",
      "Research Writing",
      "Mathematics",
      "Statistics",
    ],
    interests: [
      "Artificial Intelligence",
      "Data Science",
      "Research",
      "Open Source",
      "Competitive Programming",
    ],
    careerGoals: ["AI Engineer", "Researcher", "Data Scientist"],
    preferences: {
      opportunityTypes: ["Internship", "Research", "Workshop", "Project"],
      mode: "Remote",
      locationPreference: "Pan India",
      paid: true,
      durationPreference: "3-6 months",
      domains: ["Artificial Intelligence", "Data Science", "Computer Science Research"],
      deadlinePreference: "flexible",
    },
    savedOpportunities: [],
    applications: [],
    completionScore: 88,
  },

  // Profile 2: Web/Fullstack developer, entrepreneur mindset
  "demo-web": {
    id: "demo-web",
    name: "Priya Reddy",
    email: "priya@demo.com",
    avatar: null,
    basic: {
      age: 20,
      college: "BITS Pilani",
      degree: "B.E.",
      branch: "Computer Science",
      year: 2,
      semester: 4,
      location: "Pilani, Rajasthan",
      cgpa: 8.2,
    },
    skills: [
      "JavaScript",
      "React",
      "Node.js",
      "CSS",
      "HTML",
      "Python",
      "Git",
      "Figma",
      "UI/UX",
    ],
    interests: [
      "Web Development",
      "Startups",
      "Entrepreneurship",
      "Design",
      "Open Source",
    ],
    careerGoals: ["Full Stack Developer", "Product Manager", "Entrepreneur"],
    preferences: {
      opportunityTypes: ["Internship", "Hackathon", "Project", "Freelance"],
      mode: "Remote",
      locationPreference: "Remote",
      paid: false,
      durationPreference: "1-3 months",
      domains: ["Web Development", "UI/UX Design", "Product Management"],
      deadlinePreference: "soon",
    },
    savedOpportunities: [],
    applications: [],
    completionScore: 75,
  },

  // Profile 3: Cybersecurity specialist
  "demo-cyber": {
    id: "demo-cyber",
    name: "Rahul Nair",
    email: "rahul@demo.com",
    avatar: null,
    basic: {
      age: 22,
      college: "NIT Calicut",
      degree: "B.Tech",
      branch: "Information Technology",
      year: 4,
      semester: 7,
      location: "Kozhikode, Kerala",
      cgpa: 7.8,
    },
    skills: [
      "Cybersecurity",
      "Linux",
      "Python",
      "Networking",
      "Kali Linux",
      "C++",
      "Cryptography",
    ],
    interests: [
      "Cybersecurity",
      "Competitive Programming",
      "Open Source",
    ],
    careerGoals: ["Cybersecurity Engineer", "Penetration Tester", "Security Researcher"],
    preferences: {
      opportunityTypes: ["Internship", "Competition", "Workshop"],
      mode: "On-site",
      locationPreference: "Bangalore, India",
      paid: true,
      durationPreference: "3-6 months",
      domains: ["Cybersecurity", "Networking", "Security"],
      deadlinePreference: "flexible",
    },
    savedOpportunities: [],
    applications: [],
    completionScore: 70,
  },

  // Profile 4: Design/UX student
  "demo-design": {
    id: "demo-design",
    name: "Kavya Singh",
    email: "kavya@demo.com",
    avatar: null,
    basic: {
      age: 19,
      college: "NID Ahmedabad",
      degree: "B.Des",
      branch: "Interaction Design",
      year: 2,
      semester: 3,
      location: "Ahmedabad, Gujarat",
      cgpa: 8.5,
    },
    skills: ["UI/UX", "Figma", "User Research", "Sketch", "Communication", "Leadership"],
    interests: ["Design", "Startups", "Entrepreneurship", "Web Development"],
    careerGoals: ["UI/UX Designer", "Product Designer", "Creative Director"],
    preferences: {
      opportunityTypes: ["Internship", "Workshop", "Freelance"],
      mode: "Hybrid",
      locationPreference: "Mumbai, India",
      paid: true,
      durationPreference: "3 months",
      domains: ["UI/UX Design", "Product Design"],
      deadlinePreference: "soon",
    },
    savedOpportunities: [],
    applications: [],
    completionScore: 65,
  },
};

// Active demo profile for quick demo login
const DEFAULT_DEMO_PROFILE = DEMO_PROFILES["demo-ai"];
