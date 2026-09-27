import requests

PS_URL = "https://smartmart-oily-shelf-ps.sage.cloud.layerbase.dev"
PS_USERNAME = "root"

password = input("Enter PS password: ")

response = requests.post(
    PS_URL,
    auth=(PS_USERNAME, password),
    json={
        "query": "SELECT 1"
    },
    timeout=30
)

print("HTTP STATUS:", response.status_code)
print("RESPONSE:")
print(response.text)