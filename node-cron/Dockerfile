# Use Node.js 18 (lightweight Alpine version)
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files
COPY . .

# Start the cron job script
CMD ["node", "cronJob.js"]
