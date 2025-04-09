export async function GET() {
    // Simulate dynamic data (replace with your actual data source)
    const analytics = {
      live: Math.floor(Math.random() * 500) + 50, // Random number between 50 and 550
      totalGenerated: Math.floor(Math.random() * 100000) + 10000, // Random number between 10000 and 110000
      totalUsers: Math.floor(Math.random() * 20000) + 5000, // Random number between 5000 and 25000
    };
  
    return new Response(JSON.stringify(analytics), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }