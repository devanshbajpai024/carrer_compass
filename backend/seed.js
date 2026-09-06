require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Opportunity = require('./src/models/Opportunity');
const Project = require('./src/models/Project');
const bcrypt = require('bcryptjs');

async function seedData() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Clear existing test data
    console.log('Clearing old test data...');
    await User.deleteMany({ email: 'student@example.com' });
    await Opportunity.deleteMany({ organization: 'TestOrg' });
    await Project.deleteMany({ source: 'seed' });

    // 1. Create a Test User — fields match User schema exactly
    console.log('Creating test user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      name: 'Test Student',
      email: 'student@example.com',
      password: hashedPassword,
      education: {
        college: 'Example University',
        degree: 'B.Tech',
        branch: 'Computer Science',
        year: 3,
        cgpa: 8.5,
        graduationYear: 2026
      },
      skills: [
        { name: 'JavaScript', level: 70 },
        { name: 'Node.js', level: 55 },
        { name: 'Python', level: 40 },
        { name: 'React', level: 50 }
      ],
      interests: ['Web Development', 'Open Source', 'Machine Learning'],
      careerGoals: ['Web Developer', 'Software Developer'],
      certifications: [],
      experience: [],
      preferences: {
        remote: true,
        preferredOpportunityTypes: ['INTERNSHIP', 'HACKATHON']
      }
    });
    console.log(`User created: ${user.email} (Password: password123)`);

    // 2. Create sample Opportunities — fields match Opportunity schema exactly
    console.log('Creating opportunities...');
    const opportunities = [
      {
        title: 'Backend Engineering Intern',
        type: 'INTERNSHIP',
        organization: 'TestOrg',
        description: 'Work on our core Node.js backend services. Build APIs, optimize queries, and deploy to production.',
        location: 'Remote',
        remote: true,
        skills: [
          { skill: 'Node.js', importance: 'required' },
          { skill: 'MongoDB', importance: 'required' },
          { skill: 'JavaScript', importance: 'required' }
        ],
        careerDomains: ['Software Developer', 'Web Developer'],
        tags: ['backend', 'nodejs', 'remote'],
        eligibility: { minimumCGPA: 7.0, minimumYear: 2 },
        stipend: '₹15,000/month',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE'
      },
      {
        title: 'Global AI Hackathon 2026',
        type: 'HACKATHON',
        organization: 'TestOrg',
        description: 'Build innovative AI solutions in 48 hours. Prizes worth $50,000.',
        location: 'San Francisco, CA',
        remote: false,
        skills: [
          { skill: 'Python', importance: 'required' },
          { skill: 'Machine Learning', importance: 'preferred' }
        ],
        careerDomains: ['AI/ML Engineer', 'Data Scientist'],
        tags: ['ai', 'hackathon', 'machine learning'],
        eligibility: {},
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE'
      },
      {
        title: 'Full Stack Development Bootcamp',
        type: 'WORKSHOP',
        organization: 'TestOrg',
        description: 'Learn MERN stack development from scratch with live projects.',
        location: 'Online',
        remote: true,
        skills: [
          { skill: 'React', importance: 'preferred' },
          { skill: 'Node.js', importance: 'preferred' }
        ],
        careerDomains: ['Web Developer'],
        tags: ['mern', 'fullstack', 'workshop'],
        eligibility: {},
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE'
      },
      {
        title: 'Open Source React Component Library',
        type: 'PROJECT',
        organization: 'TestOrg',
        description: 'Contribute to an open-source React UI library used by 10k+ developers.',
        location: 'Remote',
        remote: true,
        skills: [
          { skill: 'React', importance: 'required' },
          { skill: 'JavaScript', importance: 'required' }
        ],
        careerDomains: ['Web Developer'],
        tags: ['react', 'open-source', 'frontend'],
        eligibility: {},
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE'
      },
      {
        title: 'Data Science Research Fellowship',
        type: 'FELLOWSHIP',
        organization: 'TestOrg',
        description: 'Work alongside researchers on real-world data science problems.',
        location: 'Hybrid',
        remote: false,
        skills: [
          { skill: 'Python', importance: 'required' },
          { skill: 'Statistics', importance: 'required' },
          { skill: 'SQL', importance: 'preferred' }
        ],
        careerDomains: ['Data Scientist', 'AI/ML Engineer'],
        tags: ['data science', 'research', 'fellowship'],
        eligibility: { minimumCGPA: 8.0 },
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE'
      }
    ];

    await Opportunity.insertMany(opportunities);
    console.log('Opportunities created.');

    // 3. Create sample Projects so project recommendations work
    console.log('Creating projects...');
    const projects = [
      {
        title: 'Personal Portfolio Website',
        description: 'Build a responsive portfolio website using HTML, CSS, and JavaScript to showcase your projects and skills.',
        difficulty: 'Beginner',
        skills: ['HTML/CSS', 'JavaScript'],
        careerDomains: ['Web Developer'],
        estimatedDuration: '1 week',
        technologies: ['HTML', 'CSS', 'JavaScript'],
        learningOutcomes: ['HTML/CSS', 'JavaScript', 'Responsive Design'],
        source: 'seed'
      },
      {
        title: 'Task Manager App with React',
        description: 'Create a full-featured task management app with CRUD operations, local storage persistence, and drag-and-drop.',
        difficulty: 'Intermediate',
        skills: ['React', 'JavaScript'],
        careerDomains: ['Web Developer', 'Software Developer'],
        estimatedDuration: '2 weeks',
        technologies: ['React', 'CSS'],
        learningOutcomes: ['React', 'JavaScript', 'State Management'],
        source: 'seed'
      },
      {
        title: 'REST API with Node.js & MongoDB',
        description: 'Build a complete REST API with authentication, CRUD operations, and proper error handling.',
        difficulty: 'Intermediate',
        skills: ['Node.js', 'MongoDB', 'JavaScript'],
        careerDomains: ['Web Developer', 'Software Developer'],
        estimatedDuration: '2 weeks',
        technologies: ['Node.js', 'Express', 'MongoDB'],
        learningOutcomes: ['Node.js', 'MongoDB', 'JavaScript', 'REST API Design'],
        source: 'seed'
      },
      {
        title: 'ML Sentiment Analysis Model',
        description: 'Train a sentiment analysis model on Twitter data using Python, scikit-learn, and deploy as a Flask API.',
        difficulty: 'Intermediate',
        skills: ['Python', 'Machine Learning'],
        careerDomains: ['AI/ML Engineer', 'Data Scientist'],
        estimatedDuration: '3 weeks',
        technologies: ['Python', 'scikit-learn', 'Flask'],
        learningOutcomes: ['Python', 'Machine Learning', 'Data Visualization'],
        source: 'seed'
      },
      {
        title: 'Data Dashboard with D3.js',
        description: 'Build an interactive data visualization dashboard with charts, filters, and real-time data updates.',
        difficulty: 'Advanced',
        skills: ['JavaScript', 'Data Visualization'],
        careerDomains: ['Data Scientist', 'Web Developer'],
        estimatedDuration: '3 weeks',
        technologies: ['D3.js', 'JavaScript', 'CSS'],
        learningOutcomes: ['Data Visualization', 'JavaScript', 'SQL'],
        source: 'seed'
      },
      {
        title: 'Algorithms & Data Structures Practice',
        description: 'Implement 50 classic DSA problems in Java — sorting, graphs, dynamic programming, and trees.',
        difficulty: 'Intermediate',
        skills: ['Data Structures', 'Algorithms', 'Java'],
        careerDomains: ['Software Developer'],
        estimatedDuration: '4 weeks',
        technologies: ['Java'],
        learningOutcomes: ['Data Structures', 'Algorithms', 'Java', 'System Design'],
        source: 'seed'
      }
    ];

    await Project.insertMany(projects);
    console.log('Projects created.');

    console.log('\n✅ Seeding complete!');
    console.log('Login with: student@example.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
