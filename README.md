# Apposing Nest Libs

This repository contains a collection of internal Apposing libraries, used to avoid needing to copy common functionality across projects, and to standardise common functionality such as auth.

## Installation

### General

These steps will need to be done for each project

1. Create a `.npmrc` file in the project root
2. Add this line to the `.npmrc` file: `@apposing:registry=https://npm.pkg.github.com`
3. This file should be checked into version control

### For local development

These steps will only need to be done once per developer

1. [Create a Personal Access Token](https://github.com/settings/tokens/new) via GitHub with the `read:packages` scope
2. Find your local `.npmrc` file (it should be in your home directory home)
3. Add this line to your `.npmrc` file: `//npm.pkg.github.com/:_authToken=abc123`, replacing `abc123` with your Personal Access token

### For GitHub Actions

This step will need to be done for each project

1. Before the step that installs dependencies, create a step that runs this command: `echo "//npm.pkg.github.com/:_authToken=${{ secrets.READ_PACKAGES_TOKEN }}" >> .npmrc`
