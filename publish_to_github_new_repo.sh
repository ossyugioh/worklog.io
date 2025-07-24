#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Configure Git user identity
echo "--- Configuring Git user identity... ---"
git config user.email "teachermorger@gmail.com"
git config user.name "ossyugioh"

# Initialize Git Repository
echo "--- Initializing Git repository... ---"
git init

# Set branch to main
echo "--- Setting branch to main... ---"
git branch -M main

# Add all files to staging
echo "--- Adding all files... ---"
git add .

# Commit the files
echo "--- Committing files... ---"
git commit -m "Initial commit for todaywork-io: Setup app and GitHub Actions workflow"

# Add the remote repository
REMOTE_URL="https://github.com/ossyugioh/todaywork-io.git"
echo "--- Adding remote repository: $REMOTE_URL ---"
git remote add origin $REMOTE_URL

# Push the code to GitHub
echo "--- Pushing to GitHub... ---"
git push -u origin main

echo "--- ✨ Successfully published to GitHub! ---"
