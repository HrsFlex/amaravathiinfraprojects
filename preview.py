#!/usr/bin/env python3
"""Static local preview with byte-range support for browser video playback."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import argparse, os, re, shutil

class MediaHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.byte_range = None
        path = self.translate_path(self.path)
        if not os.path.isfile(path):
            return super().send_head()
        try:
            stream = open(path, 'rb')
        except OSError:
            self.send_error(404)
            return None
        stat = os.fstat(stream.fileno())
        size = stat.st_size
        requested = self.headers.get('Range')
        if requested:
            match = re.fullmatch(r'bytes=(\d*)-(\d*)', requested.strip())
            if not match or not any(match.groups()):
                stream.close()
                self.send_error(416, 'Invalid byte range')
                return None
            first, last = match.groups()
            if first:
                start, end = int(first), min(int(last), size - 1) if last else size - 1
            else:
                start, end = max(0, size - int(last)), size - 1
            if start >= size or start > end:
                stream.close()
                self.send_response(416)
                self.send_header('Content-Range', f'bytes */{size}')
                self.send_header('Content-Length', '0')
                self.end_headers()
                return None
            self.send_response(206)
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.byte_range = start, end
            stream.seek(start)
            length = end - start + 1
        else:
            self.send_response(200)
            length = size
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Length', str(length))
        self.send_header('Last-Modified', self.date_time_string(stat.st_mtime))
        self.end_headers()
        return stream

    def copyfile(self, source, outputfile):
        try:
            if self.byte_range is None:
                shutil.copyfileobj(source, outputfile)
                return
            remaining = self.byte_range[1] - self.byte_range[0] + 1
            while remaining:
                chunk = source.read(min(256 * 1024, remaining))
                if not chunk:
                    break
                outputfile.write(chunk)
                remaining -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass  # Browsers cancel earlier media requests when seeking or pausing.

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=4174)
    args = parser.parse_args()
    os.chdir(Path(__file__).resolve().parent)
    print(f'Amaravathi Infra Projects preview: http://127.0.0.1:{args.port}/', flush=True)
    ThreadingHTTPServer(('127.0.0.1', args.port), MediaHandler).serve_forever()
