import os
from git import Repo
from github import Github, Auth

ACCESS_TOKEN = os.environ.get('GITHUB_ACCESS_TOKEN')
ORG_NAME = os.environ.get('ORG_NAME')
auth = Auth.Token(ACCESS_TOKEN)
g = Github(auth=auth)
org = g.get_organization(ORG_NAME)

def create_repo(repo_name, git_folder_path):
# Create a new repository
  repo = org.create_repo(repo_name)
  print(f"Created new repository: {repo.full_name}")

  # Initialize a new Git repository object
  local_repo = Repo.init(git_folder_path)

  # Add the remote GitHub repository as origin
  remote_url = f"https://x-access-token:{ACCESS_TOKEN}@github.com/{ORG_NAME}/{repo_name}.git"
  origin = local_repo.create_remote('origin', url=remote_url)
  print(f"Remote repository URL: {repo.clone_url}")

  # Add all files, commit, and push to the remote repository
  local_repo.git.add(A=True)  # Add all files
  local_repo.index.commit('Migration commit')
  origin.push(refspec='main:main')  # Push changes to main branch

  print("Content pushed to GitHub repository successfully.")
