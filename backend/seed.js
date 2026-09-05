const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Opportunity = require('./src/models/Opportunity');
const Project = require('./src/models/Project');

dotenv.config();

const opportunities = [
  {
    title: 'AI/ML Engineering Intern',
    description: 'Work on cutting-edge machine learning models.',
    type: 'INTERNSHIP',
    organization: 'TechCorp AI',
    skills: [
      { skill: 'Python', importance: 'required' },
      { skill: 'Machine Learning', importance: 'required' },
      { skill: 'TensorFlow', importance: 'preferred' }
    ],
    eligibility: {
      degrees: ['B.Tech', 'B.E'],
      branches: ['CSE', 'AI'],
      minimumYear: 2,
      maximumYear: 4,
      minimumCGPA: 7.0
    },
    careerDomains: ['AI/ML Engineer', 'Data Scientist'],
    location: 'Bangalore',
    remote: true,
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 2)), // 2 months from now
    status: 'ACTIVE'
  },
  {
    title: 'Global ML Hackathon',
    description: 'Build predictive models to solve real-world problems.',
    type: 'HACKATHON',
    organization: 'DataMinds',
    skills: [
      { skill: 'Python', importance: 'required' },
      { skill: 'Data Science', importance: 'preferred' }
    ],
    eligibility: {
      degrees: ['Any'],
      branches: ['Any'],
      minimumYear: 1,
      maximumYear: 4,
      minimumCGPA: 0
    },
    careerDomains: ['Data Scientist', 'AI/ML Engineer'],
    location: 'Online',
    remote: true,
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: 'ACTIVE'
  },
  {
    title: 'Frontend Web Dev Internship',
    description: 'Build responsive web apps using React.',
    type: 'INTERNSHIP',
    organization: 'WebSolutions',
    skills: [
      { skill: 'HTML/CSS', importance: 'required' },
      { skill: 'JavaScript', importance: 'required' },
      { skill: 'React', importance: 'preferred' }
    ],
    eligibility: {
      degrees: ['B.Tech', 'BCA'],
      branches: ['CSE', 'IT'],
      minimumYear: 2,
      maximumYear: 4,
      minimumCGPA: 6.5
    },
    careerDomains: ['Web Developer', 'Software Developer'],
    location: 'Mumbai',
    remote: false,
    deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)),
    status: 'ACTIVE'
  }
];

const projects = [
  {
    title: 'AI Resume Screening System',
    description: 'A system to automatically parse and score resumes using NLP.',
    difficulty: 'Advanced',
    skills: ['Python', 'NLP', 'Machine Learning'],
    careerDomains: ['AI/ML Engineer'],
    estimatedDuration: '4 weeks',
    technologies: ['Python', 'Spacy', 'TensorFlow'],
    learningOutcomes: ['NLP', 'Machine Learning']
  },
  {
    title: 'E-commerce React Dashboard',
    description: 'A responsive dashboard for an online store.',
    difficulty: 'Intermediate',
    skills: ['React', 'JavaScript', 'HTML/CSS'],
    careerDomains: ['Web Developer'],
    estimatedDuration: '2 weeks',
    technologies: ['React', 'Tailwind', 'Chart.js'],
    learningOutcomes: ['React', 'Data Visualization']
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding');

    // Clear existing
    await Opportunity.deleteMany();
    await Project.deleteMany();

    // Insert new
    await Opportunity.insertMany(opportunities);
    await Project.insertMany(projects);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedDB();
