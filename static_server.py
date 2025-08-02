# Simple static file server for local development
import http.server
import socketserver
import os

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Try to serve /about as /about.html, etc.
        if not os.path.splitext(self.path)[1]:
            alt_path = self.path.rstrip('/') + '.html'
            file_path = os.path.join(DIRECTORY, alt_path.lstrip('/'))
            if os.path.isfile(file_path):
                self.path = alt_path
        try:
            return super().do_GET()
        except Exception:
            self.send_error(500)

    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.send_response(404)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            try:
                with open(os.path.join(DIRECTORY, '404.html'), 'rb') as f:
                    self.wfile.write(f.read())
            except Exception:
                self.wfile.write(b'<h1>404 Not Found</h1>')
        else:
            super().send_error(code, message, explain)

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True 

if __name__ == "__main__":
    print(f"Serving '{DIRECTORY}' at http://localhost:{PORT}")
    with ReusableTCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
            httpd.server_close()