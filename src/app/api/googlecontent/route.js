import { NextResponse } from 'next/server';
import axios from 'axios';

// Environment variable for security
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBmjAevjVK50y-3lxkPmMTlEAGS71lmICI';

export async function POST(req) {
  const { businessDescription, targetAudience, platforms, language } = await req.json();

  if (!businessDescription || !targetAudience || !platforms || !language) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  try {
    const prompt = `Generate 4 unique content ideas (Awareness, Interest, Desire, Action) based on: Business Description: ${businessDescription}, Target Audience: ${targetAudience}, Platforms: ${platforms}, Language: ${language}. Each idea should have at least 3 paragraphs or bullet points of detailed, original, and dynamic content, tailored to the inputs, avoiding repetitive or default phrases.`;

    // Updated Gemini API endpoint (REST API for free tier)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('API Response:', response.data); // Log the full response for debugging
    const contentText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!contentText) throw new Error('No content returned from API');

    const content = contentText.split('\n\n').reduce((acc, section) => {
      const [category, ...rest] = section.split('\n');
      if (category && rest.length >= 3) acc[category.toLowerCase()] = rest.join('\n');
      return acc;
    }, { awareness: '', interest: '', desire: '', action: '' });

    if (Object.values(content).every(v => !v)) throw new Error('Invalid content format from API');

    return NextResponse.json(content);
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config?.url,
    });
    if (error.code === 'ENOTFOUND' || error.response?.status === 404) {
      return NextResponse.json({ error: 'API endpoint not found, using fallback. Please verify the Gemini API URL.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'API request failed, using fallback. Check console for details.' }, { status: 500 });
  }
}