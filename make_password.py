from werkzeug.security import generate_password_hash

password = "2002@Brian"

hashed_password = generate_password_hash(password)

print(hashed_password)