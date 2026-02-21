import requests
import json

url = "http://127.0.0.1:8000/api/auth/register/"
payload = {
    "username": "debuguser",
    "email": "debug@example.com",
    "password": "Password123!",
    "password_confirm": "Password123!"
}
headers = {"Content-Type": "application/json"}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
