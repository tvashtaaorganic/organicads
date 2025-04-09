import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
  const { html, css, js } = await req.json();

  const minify = async (code, type) => {
    try {
      const response = await axios.post(`https://api.minifier.org/${type}`, { code });
      return response.data.minified;
    } catch {
      return code
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, "")
        .replace(/\s+/g, " ")
        .trim();
    }
  };

  const [minifiedHtml, minifiedCss, minifiedJs] = await Promise.all([
    minify(html, "html"),
    minify(css, "css"),
    minify(js, "js"),
  ]);

  const minifiedOutput = `
    <!DOCTYPE html><html><head><style>${minifiedCss}</style></head><body>${minifiedHtml}<script>${minifiedJs}</script></body></html>
  `.trim();

  return NextResponse.json({ minifiedOutput });
}