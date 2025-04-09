import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const cookiesPath = path.join(process.cwd(), 'pinterest-cookies.json');

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || !url.match(/^https:\/\/[a-z]{2,3}?\.?pinterest\.com\/pin\/\d+\/?$/)) {
    return NextResponse.json({ error: 'Invalid Pinterest URL' }, { status: 400 });
  }

  try {
    const pinIdMatch = url.match(/pin\/(\d+)/);
    if (!pinIdMatch) throw new Error('Could not extract Pin ID from URL');
    const pinId = pinIdMatch[1];

    // Load cookies if available
    let cookieHeader = '';
    if (fs.existsSync(cookiesPath)) {
      const cookies = JSON.parse(fs.readFileSync(cookiesPath, 'utf-8'));
      cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    } else {
      throw new Error('Cookies required. Please set up pinterest-cookies.json manually.');
    }

    const apiUrl = `https://www.pinterest.com/resource/PinResource/get?id=${pinId}`;
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.pinterest.com/',
        'Cookie': cookieHeader,
      },
    });

    const responseText = await response.text();
    console.log('Raw API response:', responseText.slice(0, 200)); // Log for debugging

    if (!response.ok || responseText.includes('Invalid')) {
      throw new Error('API rejected request (likely needs valid login cookies)');
    }

    const data = JSON.parse(responseText);
    const videoUrl = data?.resource_response?.data?.videos?.video_list?.V_720P?.url;

    if (!videoUrl) {
      console.error('API response:', responseText);
      throw new Error('No video URL found in API response');
    }

    const videoResponse = await fetch(videoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.pinterest.com/',
        'Cookie': cookieHeader,
      },
    });

    if (!videoResponse.ok) throw new Error('Failed to fetch video stream');

    return new NextResponse(videoResponse.body, {
      headers: {
        'Content-Disposition': `attachment; filename="pinterest-${pinId}.mp4"`,
        'Content-Type': 'video/mp4',
      },
    });
  } catch (error) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: 'Failed to download', details: error.message }, { status: 500 });
  }
}

export const config = { api: { responseLimit: false } };