#!/bin/bash

# Check if GITHUB_WORKSPACE is set, if not, set gits_folder to /tmp/gits
if [ -z "${GITHUB_WORKSPACE}" ]; then
    gits_folder="${GITHUB_WORKSPACE}/tmp/gits" # without last /
else
    gits_folder="/tmp/gits" # without last /
fi

branch="main"
flathub_target_repo='flathub/com.github.victorwads.QRookieNode'
this_project_repo='https://github.com/victorwads/QRookieNode'

# Remove existing gits_folder if it exists and create a new one
if [ -d "$gits_folder" ] ; then
    rm -rf "$gits_folder"
fi
mkdir -vp "$gits_folder"
cd "$gits_folder" && echo "Moving in $gits_folder" || exit 1

# Remove existing flathub and this_project directories if they exist
if [ -d flathub ]; then
    rm -rf "$gits_folder/flathub"
fi
if [ -d flathub ]; then
    rm -rf "$gits_folder/this_project"
fi

# Clone the flathub and this_project repositories
git clone --depth=1 --recursive "https://github.com/$flathub_target_repo.git" "$gits_folder/flathub"
git clone --depth=1 --recursive "https://github.com/$this_project_repo.git" "$gits_folder/this_project"

# Get the latest release name, preferring prereleases if available and published after 2025-01-01
relname=$(curl -s "https://api.github.com/repos/$this_project_repo/releases" | jq -r '[.[] | select(.prerelease == true and (.published_at | fromdateiso8601) > 1735689600)][0].tag_name // empty')
if [ -z "$relname" ]; then
    relname=$(curl -s https://api.github.com/repos/$this_project_repo/releases/latest | jq -r .tag_name)
fi
echo "Using release: $relname"

# Checkout the main branch in the this_project repository
cd "$gits_folder/this_project" && echo "Moving in $gits_folder/this_project" && git checkout "$branch"

# Create a new branch in the flathub repository with the release name
cd "$gits_folder"/flathub && echo "Moving in $gits_folder/flathub" || exit 1
git checkout -b "$relname"
echo "Current directory: $(pwd)"
ls -lah

# Remove all files in the flathub repository and clean the git index
git rm -rf *
git clean -fxd # restoring git index

# Copy specific files from the this_project repository to the flathub repository
files_to_copy=('LICENSE' 'README.md' 'other_licenses.txt' 'com.github.victorwads.QRookieNode.yml' 'com.github.victorwads.QRookieNode.metainfo.xml')
for file in "${files_to_copy[@]}"; do
    if ! cp -fv "$gits_folder/this_project/$file" "$gits_folder/flathub"; then
        echo "Warning: $file not found in $gits_folder/this_project"
    fi
done

cd "$gits_folder/flathub" && echo "Moving in $gits_folder/flathub" || exit 1
ls -lah

# Create a flathub.json file specifying the architecture
cat << EOF >> flathub.json
{
"only-arches": ["x86_64"]
}
EOF

# If running in a GitHub workflow, configure git and authenticate with GitHub
if [ -n "${GITHUB_WORKFLOW}" ]; then
    git config --global user.name "$GIT_NAME"
    git config --global user.email "$GIT_MAIL"
    git config --global credential.helper store
    gh auth login
# If not in a GitHub workflow, prompt the user for git configuration if not already set
elif [[ -z $(git config --get user.name) || -z $(git config --get user.email) ]]; then
    read -p "No git user.name set, please enter your name: " git_username
    git config --local user.name "$git_username"
    read -p "No git user.email set, please enter your email: " git_email
    git config --local user.email "$git_email"
fi

# Commit the changes and push to the new branch
git add .
git commit -m "Update QRookie to v$relname from victorwads/QRookieNode/$branch"

# Push the changes to the remote repository, using authentication if in a GitHub workflow
if [ -n "${GITHUB_WORKFLOW}" ]; then
    git remote set-url origin https://x-access-token:${GH_TOKEN}@github.com/${flathub_target_repo}
    git push --force origin "$relname"
else
    git push --force "https://github.com/${flathub_target_repo}" "$relname"
fi

