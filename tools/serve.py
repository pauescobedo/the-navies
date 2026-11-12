#!/usr/bin/env python3
"""Local static server with byte-range support for audio seeking."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
import re


class RangeRequestHandler(SimpleHTTPRequestHandler):
    range_to_send = None

    def send_head(self):
        path = self.translate_path(self.path)
        range_header = self.headers.get("Range")
        if not range_header or not os.path.isfile(path):
            self.range_to_send = None
            return super().send_head()

        match = re.fullmatch(r"bytes=(\d*)-(\d*)", range_header.strip())
        if not match:
            self.send_error(400, "Invalid byte range")
            return None

        size = os.path.getsize(path)
        start_text, end_text = match.groups()
        if not start_text:
            length = int(end_text or 0)
            start = max(0, size - length)
            end = size - 1
        else:
            start = int(start_text)
            end = min(int(end_text) if end_text else size - 1, size - 1)

        if start >= size or start > end:
            self.send_response(416)
            self.send_header("Content-Range", f"bytes */{size}")
            self.end_headers()
            return None

        source = open(path, "rb")
        self.range_to_send = (start, end)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Content-Length", str(end - start + 1))
        self.send_header("Last-Modified", self.date_time_string(os.path.getmtime(path)))
        self.end_headers()
        return source

    def copyfile(self, source, outputfile):
        if not self.range_to_send:
            return super().copyfile(source, outputfile)
        start, end = self.range_to_send
        source.seek(start)
        remaining = end - start + 1
        while remaining:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 4173), RangeRequestHandler).serve_forever()
