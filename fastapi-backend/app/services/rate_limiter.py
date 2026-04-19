from collections import defaultdict
import time

# Simple in-memory rate limiter: max 10 requests per minute per IP
REQUEST_LIMIT = 10
TIME_WINDOW = 60  # seconds

request_counts = defaultdict(list)

def rate_limit(ip: str) -> bool:
    current_time = time.time()
    # Remove old requests outside the time window
    request_counts[ip] = [t for t in request_counts[ip] if current_time - t < TIME_WINDOW]
    if len(request_counts[ip]) >= REQUEST_LIMIT:
        return False
    request_counts[ip].append(current_time)
    return True