from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from agents import Agent, Runner, OpenAIChatCompletionsModel, set_tracing_disabled
import asyncpg
import asyncio
import uuid
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
import traceback
import time

# Configuration - آپ کے credentials
NEONDB_CONNECTION_STRING = "postgresql://neondb_owner:npg_BN7ZDfqk9Vvc@ep-late-night-ahw1x6n6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
GEMINI_API_KEY = "AIzaSyCIMVO766uwbru8dKEJvCUb3TAAC95a60U"

# FastAPI App Initialization
app = FastAPI()

# CORS Middleware - Updated for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],  # Only allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection pool for better performance
pool = None

async def get_db_pool():
    """Create database connection pool"""
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            NEONDB_CONNECTION_STRING,
            min_size=1,
            max_size=10,
            command_timeout=60
        )
    return pool

async def get_db_connection():
    """Get connection from pool"""
    pool = await get_db_pool()
    return await pool.acquire()

async def release_db_connection(conn):
    """Release connection back to pool"""
    if conn:
        await pool.release(conn)

# Pydantic models for request/response
class ChatPrompt(BaseModel):
    prompt: str

class TodoItem(BaseModel):
    id: str  # Changed from UUID to string for frontend compatibility
    title: str
    description: Optional[str] = None
    completed: bool
    created_at: str  # Changed to string for JSON serialization

class ChatResponse(BaseModel):
    action: str
    todo: Optional[dict] = None
    message: Optional[str] = None

# User's provided TODO model
class TODO(BaseModel):
    todo_name: str
    todo_description: str
    delete_todo_name: Optional[str]

# AI Agent Setup
client = AsyncOpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=GEMINI_API_KEY
)
set_tracing_disabled(disabled=True)

# Enhanced Todo Agent with better instructions
Todo_Agent = Agent(
    name="Todo Agent",
    instructions="""
    You are an intelligent todo assistant. Your task is to understand user requests and create or delete todos.
    
    IMPORTANT RULES:
    1. When user wants to CREATE a todo:
       - Extract a short, clear todo_name (1-3 words)
       - Extract a descriptive todo_description (what needs to be done)
       - Set delete_todo_name to None or empty
    
    2. When user wants to DELETE a todo:
       - Extract the exact todo_name to delete from user's message
       - Set todo_name and todo_description to empty strings
       - Provide delete_todo_name with the title to delete
    
    3. Always respond in this exact JSON format:
       {
         "todo_name": "title here" OR "",
         "todo_description": "description here" OR "",
         "delete_todo_name": "title to delete" OR null
       }
    
    Examples:
    User: "create a todo for reading books"
    Response: {"todo_name": "Read Books", "todo_description": "Read 30 pages daily", "delete_todo_name": null}
    
    User: "delete my gym todo"
    Response: {"todo_name": "", "todo_description": "", "delete_todo_name": "gym"}
    
    User: "make a todo to study programming"
    Response: {"todo_name": "Study Programming", "todo_description": "Learn Python and FastAPI", "delete_todo_name": null}
    
    User: "remove the shopping todo"
    Response: {"todo_name": "", "todo_description": "", "delete_todo_name": "shopping"}
    """,
    output_type=TODO,
    model=OpenAIChatCompletionsModel(model="gemini-2.5-flash", openai_client=client),
)

# On startup: Create todos table if it doesn't exist
@app.on_event("startup")
async def startup_event():
    conn = None
    try:
        pool = await get_db_pool()
        async with pool.acquire() as conn:
            await conn.execute('''
                CREATE TABLE IF NOT EXISTS todos (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    title TEXT NOT NULL,
                    description TEXT,
                    completed BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
                )
            ''')
            print("✅ Database table 'todos' ready")
            # Create index for faster searches
            await conn.execute("CREATE INDEX IF NOT EXISTS idx_todos_title ON todos(title)")
            print("✅ Database indexes created")
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        traceback.print_exc()
    finally:
        if conn:
            await pool.release(conn)

@app.on_event("shutdown")
async def shutdown_event():
    """Close database pool on shutdown"""
    if pool:
        await pool.close()

# Main chat endpoint
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(chat_prompt: ChatPrompt):
    conn = None
    try:
        print(f"📩 Received prompt: {chat_prompt.prompt}")
        
        # Get AI response
        start_time = time.time()
        result = await Runner.run(Todo_Agent, chat_prompt.prompt)
        ai_time = time.time() - start_time
        print(f"🤖 AI processing time: {ai_time:.2f}s")
        
        final_output = result.final_output
        print(f"🤖 AI Response: {final_output}")

        # Get database connection
        pool = await get_db_pool()
        conn = await pool.acquire()
        
        title = final_output.todo_name.strip() if final_output.todo_name else ""
        description = final_output.todo_description.strip() if final_output.todo_description else ""
        delete_title = final_output.delete_todo_name.strip() if final_output.delete_todo_name else ""

        # DELETE LOGIC
        if delete_title:
            print(f"🗑️ Attempting to delete todo: '{delete_title}'")
            
            # Search for todo (case-insensitive, partial match)
            existing_todo = await conn.fetchrow(
                "SELECT id, title, description, completed, created_at FROM todos WHERE LOWER(title) LIKE LOWER($1) LIMIT 1",
                f"%{delete_title}%"
            )
            
            if existing_todo:
                await conn.execute("DELETE FROM todos WHERE id = $1", existing_todo['id'])
                print(f"✅ Deleted todo: {existing_todo['title']}")
                
                return ChatResponse(
                    action="deleted",
                    todo={
                        "id": str(existing_todo['id']),
                        "title": existing_todo['title'],
                        "description": existing_todo['description'],
                        "completed": existing_todo['completed'],
                        "created_at": existing_todo['created_at'].isoformat()
                    },
                    message=f"Todo '{existing_todo['title']}' deleted successfully."
                )
            else:
                print(f"❌ Todo not found: '{delete_title}'")
                return ChatResponse(
                    action="not_found", 
                    message=f"Todo '{delete_title}' not found in database."
                )
        
        # CREATE LOGIC
        elif title:
            print(f"📝 Creating new todo: '{title}'")
            
            # Check if similar todo already exists
            existing = await conn.fetchrow(
                "SELECT id FROM todos WHERE LOWER(title) = LOWER($1) LIMIT 1",
                title
            )
            
            if existing:
                print(f"⚠️ Todo already exists: '{title}'")
                return ChatResponse(
                    action="already_exists",
                    message=f"Todo '{title}' already exists in database."
                )
            
            # Insert new todo
            await conn.execute(
                "INSERT INTO todos (title, description) VALUES ($1, $2)",
                title, description
            )
            
            # Get the newly created todo
            new_todo = await conn.fetchrow(
                "SELECT id, title, description, completed, created_at FROM todos WHERE title = $1 ORDER BY created_at DESC LIMIT 1",
                title
            )
            
            print(f"✅ Created todo: {new_todo['title']}")
            
            return ChatResponse(
                action="created",
                todo={
                    "id": str(new_todo['id']),
                    "title": new_todo['title'],
                    "description": new_todo['description'],
                    "completed": new_todo['completed'],
                    "created_at": new_todo['created_at'].isoformat()
                },
                message=f"Todo '{title}' created successfully."
            )
        
        # NO ACTION
        else:
            print("❓ No action specified by AI")
            return ChatResponse(
                action="no_action", 
                message="Please specify what todo to create or delete."
            )

    except Exception as e:
        print(f"❌ Error in chat_endpoint: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    finally:
        if conn:
            await pool.release(conn)

# Get all todos
@app.get("/todos", response_model=List[TodoItem])
async def get_todos():
    conn = None
    try:
        print("📋 Fetching todos...")
        pool = await get_db_pool()
        conn = await pool.acquire()
        
        todos = await conn.fetch(
            "SELECT id, title, description, completed, created_at FROM todos ORDER BY created_at DESC"
        )
        
        print(f"✅ Found {len(todos)} todos")
        
        return [
            TodoItem(
                id=str(todo['id']),  # Convert UUID to string
                title=todo['title'],
                description=todo['description'],
                completed=todo['completed'],
                created_at=todo['created_at'].isoformat()  # Convert datetime to string
            ) for todo in todos
        ]
    except Exception as e:
        print(f"❌ Error in get_todos: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to fetch todos. Check database connection."
        )
    finally:
        if conn:
            await pool.release(conn)

# Create todo directly (optional endpoint)
@app.post("/todos/create", response_model=TodoItem)
async def create_todo_directly(title: str, description: Optional[str] = None):
    conn = None
    try:
        pool = await get_db_pool()
        conn = await pool.acquire()
        
        # Insert new todo
        await conn.execute(
            "INSERT INTO todos (title, description) VALUES ($1, $2)",
            title, description
        )
        
        # Get the newly created todo
        new_todo = await conn.fetchrow(
            "SELECT id, title, description, completed, created_at FROM todos WHERE title = $1 ORDER BY created_at DESC LIMIT 1",
            title
        )
        
        return TodoItem(
            id=str(new_todo['id']),
            title=new_todo['title'],
            description=new_todo['description'],
            completed=new_todo['completed'],
            created_at=new_todo['created_at'].isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            await pool.release(conn)

# Health check endpoint
@app.get("/health")
async def health_check():
    try:
        pool = await get_db_pool()
        conn = await pool.acquire()
        # Test database connection
        await conn.fetchval("SELECT 1")
        await pool.release(conn)
        
        return {
            "status": "healthy",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# Root endpoint
@app.get("/")
async def read_root():
    return {
        "message": "Welcome to Todo Chatbot Backend API!",
        "endpoints": {
            "POST /chat": "Send natural language commands to create/delete todos",
            "GET /todos": "Get all todos",
            "POST /todos/create": "Create todo directly",
            "GET /health": "Check API health",
            "docs": "/docs"
        },
        "ai_agent": "Gemini 2.5 Flash via OpenAI Agents SDK",
        "database": "NeonDB PostgreSQL"
    }

# Debug endpoint to check database
@app.get("/debug/db")
async def debug_db():
    conn = None
    try:
        pool = await get_db_pool()
        conn = await pool.acquire()
        
        # Get database info
        table_info = await conn.fetch("SELECT COUNT(*) as count FROM todos")
        table_schema = await conn.fetch("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'todos'
        """)
        
        return {
            "table_exists": True,
            "row_count": table_info[0]['count'],
            "schema": [dict(row) for row in table_schema],
            "connection_string": NEONDB_CONNECTION_STRING.split('@')[0] + "@***"  # Hide password
        }
    except Exception as e:
        return {"error": str(e), "table_exists": False}
    finally:
        if conn:
            await pool.release(conn)

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Todo Chatbot Backend...")
    print(f"📊 Database: {NEONDB_CONNECTION_STRING.split('@')[-1]}")
    print("🤖 AI Agent: Gemini 2.5 Flash")
    print("🌐 API will be available at: http://localhost:8000")
    print("📚 Swagger UI: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )