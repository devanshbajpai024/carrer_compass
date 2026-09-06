

const generateGroqResponse = async (systemPrompt, userMessage) => {
  try {
    const groqPayload = {
      model: 'qwen/qwen3.8-27b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 400,
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
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error.message);
    throw error;
  }
};

module.exports = {
  generateGroqResponse
};
