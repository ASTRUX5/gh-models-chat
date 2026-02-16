
export async function onRequestPost(context) {
  try {
    // 1. Get the message sent from your website
    const { request, env } = context;
    const body = await request.json();
    const userMessage = body.message;

    // 2. Prepare the call to GitHub Models (GPT-4o-mini)
    const response = await fetch("https://models.inference.ai.azure.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.GH_MODELS_TOKEN}` // This pulls the key we will save in Cloudflare later
      },
      body: JSON.stringify({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: userMessage }
        ],
        model: "gpt-4o-mini",
        temperature: 0.7
      })
    });

    // 3. Get the answer back
    const data = await response.json();
    
    // Check if there was an error from the AI
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), { status: 500 });
    }

    const reply = data.choices[0].message.content;

    // 4. Send the answer back to your website
    return new Response(JSON.stringify({ reply }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
