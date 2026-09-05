const User = require('../models/User');

exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get the student's profile context
    const student = await User.findById(req.user._id).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Build the system prompt with student data
    const systemPrompt = `You are an expert Career Coach Assistant for the Student Opportunity Engine. 
Your goal is to provide highly personalized career advice, project ideas, and guidance.
Do not be a generic AI; always tailor your advice based on this student's profile:
- Name: ${student.name || 'Student'}
- Skills: ${student.skills ? student.skills.map(s => s.name).join(', ') : 'None listed'}
- Interests: ${student.interests ? student.interests.join(', ') : 'None listed'}
- Career Goals: ${student.careerGoals ? student.careerGoals.join(', ') : 'None listed'}
- Experience: ${student.experience ? student.experience.map(e => e.title).join(', ') : 'None listed'}
- Education: ${student.education && student.education.degree ? student.education.degree + ' in ' + student.education.branch : 'Not listed'}

Keep your responses concise, encouraging, and highly relevant to their specific goals and skills.`;

    // Prepare Groq API request
    const groqPayload = {
      model: 'groq/compound', // using a supported model found on this instance
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    };

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(groqPayload)
    });

    if (!groqResponse.ok) {
      const errorData = await groqResponse.text();
      throw new Error(`Groq API Error: ${errorData}`);
    }

    const data = await groqResponse.json();
    const reply = data.choices[0].message.content;

    res.json({ success: true, data: { reply } });

  } catch (error) {
    console.error('AI Chat Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to communicate with AI Assistant' });
  }
};
