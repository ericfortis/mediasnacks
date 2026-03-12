# Match GitHub Actions CI environment exactly
FROM ubuntu:24.04

# Install dependencies (same as CI)
RUN apt-get update && \
    apt-get install -y \
    zsh \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 24 (same as CI)
RUN curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Make shell scripts executable
RUN chmod +x src/*.sh

# Default command: run tests
CMD ["npm", "run", "test"]
