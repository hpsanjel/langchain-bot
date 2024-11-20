import express from "express";
import cors from "cors";
import { OpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(
	cors({
		origin: ["http://localhost:5173", "https://your-app-name.vercel.app", process.env.FRONTEND_URL],
		methods: ["GET", "POST"],
		credentials: true,
		allowedHeaders: ["Content-Type"],
	})
);

app.use(express.json());

// Initialize LangChain model and memory
const model = new OpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY,
	temperature: 0.9,
});
const memory = new BufferMemory();
const chain = new ConversationChain({ llm: model, memory });

app.post("/chat", async (req, res) => {
	try {
		const { message } = req.body;

		if (!process.env.OPENAI_API_KEY) {
			throw new Error("OPENAI_API_KEY is not set in environment variables");
		}

		const response = await chain.call({ input: message });

		if (!response || !response.response) {
			throw new Error("No response received from OpenAI");
		}

		res.json({
			reply: response.response,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Detailed chat error:", error);
		res.status(500).json({
			error: error.message,
			type: "chat_error",
			details: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
});

// Add basic error handling middleware
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({ error: "Internal server error" });
});

// Update the server listening code
const PORT = process.env.PORT || 3000;
app
	.listen(PORT, "0.0.0.0", () => {
		console.log(`Server running on http://localhost:${PORT}`);
	})
	.on("error", (e) => {
		if (e.code === "EADDRINUSE") {
			console.error(`Port ${PORT} is busy. Please try these steps:`);
			console.error("1. Check if another instance of the server is running");
			console.error(`2. Run: lsof -i :${PORT} (on Mac/Linux) or netstat -ano | findstr :${PORT} (on Windows)`);
			console.error("3. Kill the process using that port or choose a different port");
		} else {
			console.error("Server error:", e);
		}
		process.exit(1); // Exit if we can't start the server
	});
