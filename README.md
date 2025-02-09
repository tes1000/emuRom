EmuRom is a Dockerized lightweight wrapper for EmulatorJS.


Environment Setup
Create a .env file in the project root with the following variables:

NEXT_PUBLIC_API_BASE_URL=127.0.0.1
NEXT_PUBLIC_SSL=0   # Use 1 to enable SSL
NEXT_PUBLIC_PORT=3000
UPLOAD_PASSWORD_HASH=

Note: To generate a bcrypt hash for your upload password, use this Python script:

import bcrypt
import getpass

def main():
    password = getpass.getpass("Enter password to hash: ")
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password_bytes, salt)
    print("\nYour hashed password is:")
    print(hashed_password.decode('utf-8'))

if __name__ == "__main__":
    main()

Data Structure

The game data should be organized and mounted to /app/data in the container. The expected structure is:

data/
 ├── platform1/
 │    ├── game1/
 │    │    ├── rom/      # Contains the ROM file
 │    │    ├── data/     # Additional game data (optional)
 │    │    └── images/   # Game images (optional)
 │    └── ...
 └── uploads/             # Temporary upload folder

Usage

    Start the Containers:

    Make sure your host's data directory is mounted to /app/data in the container. Then run:

    docker-compose up -d

    Access the Application:

    Open your browser at http://127.0.0.1:{port}.

Enjoy managing and playing your ROM-based games with EmuRom!