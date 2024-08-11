// import { NextResponse } from "next/server"; // Import NextResponse from Next.js for handling responses
// import OpenAI from "openai"; // Import OpenAI library for interacting with the OpenAI API

// // System prompt for the AI, providing guidelines on how to respond to users
// const systemPrompt = `You are an AI-powered customer support assistant for HeadStartAI. Your role is to assist users with inquiries about our AI-powered interview platform for software engineering positions. Provide helpful, clear, and respectful support while maintaining user privacy. Guide users through technical issues, connect them with human representatives if necessary, and ensure they have the best experience with our platform.

// 1. HeadStartAI offers AI-powered interviews for software engineering positions.

// 2. Our platform helps candidates practice and prepare for real job interviews, covering a wide range of topics including algorithms, data structures, system design, and behavioral questions.

// 3. Users can access our services through our website or mobile app.

// 4. If users experience technical issues, guide them to our troubleshooting page or suggest contacting our technical support team.

// 5. Always maintain user privacy and do not share personal information.

// 6. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.

// 7. Ensure all communications are clear, respectful, and supportive to provide the best user experience.

// Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStartAI users.`;

// // POST function to handle incoming requests
// export async function POST(req) {
//     try{

//         const openai = new OpenAI(); // Create a new instance of the OpenAI client
//         const data = await req.json(); // Parse the JSON body of the incoming request

//         // Create a chat completion request to the OpenAI API
//         const completion = await openai.chat.completions.create({
//           messages: [{ role: "system", content: systemPrompt }, ...data], // Include the system prompt and user messages
//           model: "gpt-4o", // Specify the model to use
//           stream: true, // Enable streaming responses
//         });

//         // Create a ReadableStream to handle the streaming response
//         const stream = new ReadableStream({
//           async start(controller) {
//             const encoder = new TextEncoder(); // Create a TextEncoder to convert strings to Uint8Array
//             try {
//               // Iterate over the streamed chunks of the response
//               for await (const chunk of completion) {
//                 const content = chunk.choices[0]?.delta?.content; // Extract the content from the chunk
//                 if (content) {
//                   const text = encoder.encode(content); // Encode the content to Uint8Array
//                   controller.enqueue(text); // Enqueue the encoded text to the stream
//                 }
//               }
//             } catch (err) {
//               controller.error(err); // Handle any errors that occur during streaming
//             } finally {
//               controller.close(); // Close the stream when done
//             }
//           },
//         });

//         return new NextResponse(stream); // Return the stream as the response
//     } catch(e) {
//         return new NextResponse({
//             message: 'error backend'
//         })
//     }

// }

import { NextResponse } from "next/server";
const { GoogleGenerativeAI } = require("@google/generative-ai");

const systemPrompt = `You are an AI-powered customer support assistant for HeadStartAI. Your role is to assist users with inquiries about our AI-powered interview platform for software engineering positions. Provide helpful, clear, and respectful support while maintaining user privacy. Guide users through technical issues, connect them with human representatives if necessary, and ensure they have the best experience with our platform.

1. HeadStartAI offers AI-powered interviews for software engineering positions.
2. Our platform helps candidates practice and prepare for real job interviews, covering a wide range of topics including algorithms, data structures, system design, and behavioral questions.
3. Users can access our services through our website or mobile app.
4. If users experience technical issues, guide them to our troubleshooting page or suggest contacting our technical support team.
5. Always maintain user privacy and do not share personal information.
6. If you're unsure about any information, it's okay to say you don't know and offer to connect the user with a human representative.
7. Ensure all communications are clear, respectful, and supportive to provide the best user experience.

Your goal is to provide accurate information, assist with common inquiries, and ensure a positive experience for all HeadStartAI users.`;

// POST function to handle incoming requests
export async function POST(req) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY); // Initialize Google Generative AI with API key
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Specify the Gemini model

    const data = await req.json(); // Parse the incoming request JSON
    const prompt = `${systemPrompt}\nUser: ${data.message}\nAssistant:`; // Combine system prompt with user message

    // Generate content using the Gemini model
    const result = await model.generateContent({ prompt });
    const response = await result.response;
    const text = response.text;

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          const text = encoder.encode(text);
          controller.enqueue(text);
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, { status: 200 });
  } catch (err) {
    console.log(err);
    return new NextResponse(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
