#bmLaunch
## About
A Firefox Addon which acts as launchbad for bookmarks.
For each bookmark-group it generates a div in an individual color featuring all the bookmarks you collected.


## Getting started (for developers on Linux)
### Installing Requirements
1. Requirements: npm
- Execute: sudo apt install npm
2. Install jpm
- Execute: sudo npm install jpm --global

### Run Addon while developing
1. Navigate to the project folder
2. Run addon in a new empty temporary firefox profile
- Execute: jpm run -b $(which firefox)

### Generating a build
1. Generate an .xpi
- Execute: jpm xpi

### Troubleshooting
1. /usr/bin/env: node: No such file or directory
- Fix: ln -s /usr/bin/nodejs /usr/bin/node
