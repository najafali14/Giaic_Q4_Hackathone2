"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // ✅ FIXED: Correct backend URL for local development
  const BACKEND_URL = "https://jubilant-fortnight-j9r7q59j7jvfg77-8000.app.github.dev";

  const fetchTodos = async () => {
    try {
      setLoading(true);
      console.log(`Fetching todos from: ${BACKEND_URL}/todos`);
      
      const response = await axios.get(`${BACKEND_URL}/todos`, {
        timeout: 10000 // 10 second timeout
      });
      
      setTodos(response.data);
      setMessage(`✅ Loaded ${response.data.length} todos`);
    } catch (error: any) {
      console.error("Error fetching todos:", error);
      
      if (error.code === 'ECONNREFUSED') {
        setMessage("❌ Cannot connect to backend. Make sure FastAPI is running: `python main.py`");
      } else if (error.response) {
        setMessage(`❌ Server error: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        setMessage("❌ No response from server. Check if backend is running.");
      } else {
        setMessage("❌ Failed to fetch todos");
      }
      
      // Clear todos on error
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputPrompt.trim()) {
      setMessage("Please enter a command.");
      return;
    }

    try {
      setLoading(true);
      setMessage("🤖 AI agent is thinking...");
      
      console.log(`Sending prompt to: ${BACKEND_URL}/chat`);
      console.log(`Prompt: "${inputPrompt}"`);
      
      const response = await axios.post(
        `${BACKEND_URL}/chat`,
        { prompt: inputPrompt },
        { timeout: 30000 } // 30 seconds timeout for AI processing
      );

      console.log("Response from backend:", response.data);

      const { action, message: agentMessage, todo } = response.data;

      if (action === "created" && todo) {
        setMessage(`✅ Created: "${todo.title}"`);
      } else if (action === "deleted" && todo) {
        setMessage(`🗑️ Deleted: "${todo.title}"`);
      } else if (action === "not_found") {
        setMessage(`❌ Todo not found`);
      } else if (action === "already_exists") {
        setMessage(`⚠️ Todo already exists`);
      } else if (action === "no_action") {
        setMessage("🤔 Please be more specific (e.g., 'create todo for gym' or 'delete study todo')");
      } else if (agentMessage) {
        setMessage(agentMessage);
      } else {
        setMessage("Received response from AI");
      }

      // Clear input and refresh todos
      setInputPrompt("");
      setTimeout(() => fetchTodos(), 500); // Small delay before refresh
    } catch (error: any) {
      console.error("Error sending message:", error);
      
      if (error.code === 'ECONNREFUSED') {
        setMessage("❌ Backend server not running. Start it with: `python main.py`");
      } else if (error.response) {
        setMessage(`❌ Backend error: ${error.response.data?.detail || error.response.statusText}`);
      } else if (error.request) {
        setMessage("❌ No response from backend server");
      } else if (error.message.includes('timeout')) {
        setMessage("⏱️ Request timeout. AI is taking too long to respond.");
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
        console.log("✅ Backend connection successful");
        fetchTodos();
      } catch (error) {
        console.log("❌ Backend not available, will retry...");
        setMessage("⚠️ Backend not connected. Starting server...");
      }
    };
    
    testConnection();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 pt-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🤖 AI Todo Assistant
          </h1>
          <p className="text-gray-600">Talk naturally to create and delete todos</p>
         
        </header>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes("✅") ? "bg-green-50 border-green-200 text-green-800" :
            message.includes("❌") ? "bg-red-50 border-red-200 text-red-800" :
            message.includes("⚠️") ? "bg-yellow-50 border-yellow-200 text-yellow-800" :
            "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            <div className="flex items-center">
              <span className="text-xl mr-3">
                {message.includes("✅") ? "✅" :
                 message.includes("❌") ? "❌" :
                 message.includes("⚠️") ? "⚠️" :
                 message.includes("🤖") ? "🤖" :
                 message.includes("🗑️") ? "🗑️" : "💡"}
              </span>
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Todos Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Your Todos {todos.length > 0 && `(${todos.length})`}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMessage("Testing connection...");
                    axios.get(`${BACKEND_URL}/health`)
                      .then(res => setMessage(`✅ ${res.data.status} - ${res.data.database}`))
                      .catch(err => setMessage("❌ Connection failed"));
                  }}
                  className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  🔗 Test
                </button>
                <button
                  onClick={fetchTodos}
                  disabled={loading}
                  className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "⏳" : "🔄"} Refresh
                </button>
              </div>
            </div>

            {loading && todos.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500">Connecting to database...</p>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-xl">
                <p className="text-gray-500 mb-2">No todos yet</p>
                <p className="text-sm text-gray-400">Try creating one below!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={`p-4 rounded-xl border ${
                      todo.completed 
                        ? "bg-green-50 border-green-200" 
                        : "bg-gray-50 border-gray-200 hover:border-blue-300"
                    } transition-colors`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`font-medium ${
                        todo.completed ? "line-through text-green-700" : "text-gray-900"
                      }`}>
                        {todo.title}
                      </h3>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {formatDate(todo.created_at)}
                      </span>
                    </div>
                    {todo.description && (
                      <p className="text-gray-600 text-sm mb-3">{todo.description}</p>
                    )}
                    <div className="flex justify-between items-center text-xs">
                      <span className={`px-2 py-1 rounded ${
                        todo.completed 
                          ? "bg-green-100 text-green-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {todo.completed ? "✅ Completed" : "⏳ Pending"}
                      </span>
                      <span className="text-gray-400 font-mono">ID: {todo.id.slice(0, 8)}...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Examples Section */}
          <div className="mb-6 bg-gray-50 p-5 rounded-xl">
            <h3 className="font-medium text-gray-800 mb-3">💡 Example Commands:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-lg border">

                <div className="text-sm text-gray-600">"create a todo for gym"</div>
         </div>
              <div className="bg-white p-3 rounded-lg border">
                <div className="text-sm text-gray-600">"delete my gym todo"</div>
                
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                className="flex-1 p-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-gray-800 placeholder-gray-400"
                placeholder="Type your command (e.g., 'create todo for reading books')..."
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleSendMessage();
                  }
                }}
                disabled={loading}
              />
              <button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-md min-w-[100px]"
                onClick={handleSendMessage}
                disabled={loading || !inputPrompt.trim()}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing
                  </span>
                ) : "create/delete"}
              </button>
            </div>
            
            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>
                <span className="font-medium">Status:</span> 
                <span className={`ml-2 ${todos.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                  {todos.length > 0 ? 'Connected' : 'Waiting for connection...'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-8 pb-6">
          <p>AI Todo Assistant • Built with FastAPI + Next.js + Gemini AI</p>
          <p className="mt-1">
            Run backend first: <code className="bg-gray-100 px-2 py-1 rounded mx-1">cd backend && python main.py</code>
          </p>
        </footer>
      </div>
    </div>
  );
}