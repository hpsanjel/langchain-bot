"use client";

import React, { useState } from "react";
import axios from "axios";
import { Send, User, Bot } from "lucide-react";

const BACKEND_URL = "http://localhost:3000";

export default function Component() {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");

	const sendMessage = async (e) => {
		e.preventDefault();
		if (!input.trim()) return;

		try {
			setMessages((prev) => [...prev, { sender: "user", text: input }]);

			console.log(`Attempting to connect to ${BACKEND_URL}/chat`);

			const response = await axios.post(
				`${BACKEND_URL}/chat`,
				{ message: input },
				{
					headers: {
						"Content-Type": "application/json",
					},
					timeout: 10000,
					withCredentials: true,
				}
			);

			console.log("Response received:", response.data);

			if (response.data && response.data.reply) {
				setMessages((prev) => [...prev, { sender: "ai", text: response.data.reply, timestamp: response.data.timestamp }]);
			} else {
				throw new Error("Invalid response format from server");
			}

			setInput("");
		} catch (error) {
			console.error("Connection error details:", {
				message: error.message,
				code: error.code,
				response: error.response,
				request: error.request,
			});

			let errorMessage = "Network Error - ";
			if (!error.response) {
				errorMessage += "Cannot connect to server. Is it running?";
			} else {
				errorMessage += error.response.data?.error || error.message;
			}

			setMessages((prev) => [...prev, { sender: "system", text: errorMessage }]);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-t from-slate-500 to-slate-900 p-4">
			<div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden">
				<h1 className="text-3xl font-bold text-center py-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">Ask Me Anything</h1>
				<div className="h-[400px] overflow-y-auto p-6 space-y-4">
					{messages.map((msg, index) => (
						<div key={index} className="flex items-start space-x-2">
							<div className={`flex-shrink-0 ${msg.sender === "user" ? "order-last pl-2" : "order-first pl-2"}`}>
								<div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">{msg.sender === "user" ? <User className="w-5 h-5 text-blue-500" /> : msg.sender === "ai" ? <Bot className="w-5 h-5 text-gray-500" /> : <span className="text-xs font-semibold text-red-800">S</span>}</div>
							</div>
							<div className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"} flex-grow`}>
								<div className={`max-w-[70%] p-3 rounded-2xl ${msg.sender === "user" ? "bg-blue-500 text-white" : msg.sender === "ai" ? "bg-gray-200 text-gray-800" : "bg-red-100 text-red-800"}`}>
									<p className="text-sm whitespace-pre-wrap">{msg.text}</p>
								</div>
								{msg.sender === "user" && <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleTimeString()}</p>}
								{msg.timestamp && <p className="text-xs text-gray-500 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>}
							</div>
						</div>
					))}
				</div>
				<form onSubmit={sendMessage} className="p-4 bg-gray-50">
					<div className="flex items-center space-x-2">
						<input type="text" className="flex-grow px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question here" />
						<button type="submit" className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors duration-200">
							<Send className="w-5 h-5" />
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
