#!/bin/bash

current_name=$(git config --global user.name)
current_email=$(git config --global user.email)

if [ -n "$current_name" ] && [ -n "$current_email" ]; then
    echo "Git is already configured for:"
    echo "Name: $current_name"
    echo "Email: $current_email"
    echo "Do you want to reconfigure Git? (y/n)"
    read answer
    if [ "$answer" != "y" ]; then
        echo "Exiting without reconfiguration."
        exit 0
    fi
fi

echo "Please enter your name for Git:"
read git_name
git config --global user.name "$git_name"

echo "Please enter your email for Git:"
read git_email
git config --global user.email "$git_email"

echo "Git successfully configured!"

if [ -z "$git_name" ]; then
    git_name="$current_name"
    if [ -z "$git_name" ]; then
        echo "Error: No name specified for Git."
        exit 1
    fi
fi

branch_name="${git_name}_dev"

if git show-ref --verify --quiet refs/heads/$branch_name; then
    echo "The branch $branch_name already exists. Switching to it..."
    git checkout "$branch_name" || { echo "Error switching to branch $branch_name"; exit 1; }
else
    echo "The branch $branch_name doesn't exist. Creating it..."
    git checkout -b "$branch_name" || { echo "Error creating branch $branch_name"; exit 1; }
fi
