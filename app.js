// https://github.com/openai/openai-node/discussions/217
// https://github.com/jddev273/simple-chatgpt-chat-streaming-demo/blob/master/app.js
// https://platform.openai.com/docs/api-reference/introduction
// https://github.com/jddev273/streamed-chatgpt-api/blob/master/index.js

const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// New
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

// Define a route to serve the index.html file
app.get("/", (_, res) => {
  res.sendFile("index.html", { root: __dirname + "/public" });
});

app.post("/chat", async (req, res) => {
  const { message, username } = req.body;
  // Check if username is provided
  if (!username) {
    return res.status(400).send("A username is required.");
  }

  // Update chat history with the user's message
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
    stream: true,
  });
  let completeResponse = "";
  for await (const part of stream) {
    const content = part.choices[0].delta.content;
    if (content) {
      res.write(content);
      completeResponse += content;
    }
  }
  res.end();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
