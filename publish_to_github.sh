#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Configure Git user identity for this repository
echo "--- Configuring Git user identity... ---"
git config user.email "teachermorger@gmail.com"
git config user.name "ossyugioh"

# 2. Initialize Git Repository if it doesn't exist
if [ ! -d ".git" ]; then
    echo "--- Initializing Git repository... ---"
    git init
    git branch -M main
fi

# 3. Add all files to staging
echo "--- Adding all files... ---"
git add .

# 4. Commit the files
echo "--- Committing files... ---"
# Use git diff-index to check if there are changes to commit
if ! git diff-index --quiet HEAD --; then
    git commit -m "Initial commit: Create Today's Work App"
else
    echo "--- No changes to commit. ---"
fi

# 5. Add the remote repository if it's not already added
if ! git remote | grep -q "origin"; then
    REMOTE_URL="https://github.com/ossyugioh/todays-work-app.git"
    echo "--- Adding remote repository: $REMOTE_URL ---"
    git remote add origin $REMOTE_URL
fi

# 6. Push the code to GitHub
echo "--- Pushing to GitHub... ---"
git push -u origin main

echo "--- ✨ Successfully published to GitHub! ---"