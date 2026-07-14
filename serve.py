"""Static server for the Calculus of Homotopy Functors app.

    python serve.py            # serve this folder on port 8051
    python serve.py --port N   # custom port

Serves only this directory; it has no dependency on the KnotLab app.
"""
import argparse
import http.server
import os

ROOT = os.path.dirname(os.path.abspath(__file__))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=8051)
    ap.add_argument("--host", default="0.0.0.0")
    args = ap.parse_args()

    os.chdir(ROOT)
    handler = http.server.SimpleHTTPRequestHandler
    server = http.server.ThreadingHTTPServer((args.host, args.port), handler)
    print("Homotopy Functor Calculus app on http://localhost:%d" % args.port, flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()


if __name__ == "__main__":
    main()
