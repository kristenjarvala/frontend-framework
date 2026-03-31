import http.server
import socketserver
import json
import re
import os

PORT = 8000
DATA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'todos.json')

def read_todos():
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('todos', [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_todos(todos):
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump({"todos": todos}, f, indent=2)

class TodoHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/todos':
            todos = read_todos()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(todos).encode('utf-8'))
        elif self.path.startswith('/framework/'):
            # Serve framework files from the directory above
            framework_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', self.path.lstrip('/'))
            if os.path.exists(framework_path) and os.path.isfile(framework_path):
                self.send_response(200)
                # Simple content type guessing
                if framework_path.endswith('.js'):
                    self.send_header('Content-Type', 'application/javascript')
                elif framework_path.endswith('.css'):
                    self.send_header('Content-Type', 'text/css')
                self.end_headers()
                with open(framework_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_error(404)
        else:
            # Fallback to serving static files (index.html, etc.)
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/todos':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            todos = read_todos()
            
            new_todo = {
                "id": int(pk_generator()),
                "text": data.get("text", ""),
                "done": data.get("done", False)
            }
            todos.append(new_todo)
            write_todos(todos)
            
            self.send_response(201)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(new_todo).encode('utf-8'))
        else:
            self.send_error(404)

    def do_PUT(self):
        # Match /api/todos/{id}
        match = re.search(r'/api/todos/(\d+)', self.path)
        if match:
            todo_id = int(match.group(1))
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            
            todos = read_todos()
            found_todo = None
            
            for todo in todos:
                if todo['id'] == todo_id:
                    todo.update(data)
                    found_todo = todo
                    break
            
            if found_todo:
                write_todos(todos)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(found_todo).encode('utf-8'))
            else:
                self.send_error(404)
        else:
            self.send_error(404)

    def do_DELETE(self):
        # Match /api/todos/{id}
        match = re.search(r'/api/todos/(\d+)', self.path)
        if match:
            todo_id = int(match.group(1))
            
            todos = read_todos()
            initial_len = len(todos)
            todos = [t for t in todos if t['id'] != todo_id]
            
            if len(todos) < initial_len:
                write_todos(todos)
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'{"success": true}')
            else:
                self.send_error(404)
        else:
            self.send_error(404)

def pk_generator():
    import time
    return int(time.time() * 1000)

print(f"Starting API Server on port {PORT}")
# Change directory to the script's directory to serve static files correctly
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print(f"Reading data from: {DATA_FILE}")
print(f"Available endpoints:")
print(f"  GET    http://localhost:{PORT}/api/todos")
print(f"  POST   http://localhost:{PORT}/api/todos")
print(f"  PUT    http://localhost:{PORT}/api/todos/<id>")
print(f"  DELETE http://localhost:{PORT}/api/todos/<id>")

with socketserver.TCPServer(("", PORT), TodoHandler) as httpd:
    httpd.serve_forever()
