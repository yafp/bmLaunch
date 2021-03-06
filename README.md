[![License](https://img.shields.io/badge/license-GPL3-brightgreen.svg)](LICENSE)

![Logo](https://raw.githubusercontent.com/yafp/bmLaunch/master/data/img/fa-external-link-square_64_0_cc6600_none.png) bmLaunch
=========

## About
bmLaunch is a Firefox AddOn which acts as launchpad for your bookmarks.
It loads all bookmarks into a filterable table for easy access.

![UI](https://raw.githubusercontent.com/yafp/bmLaunch/master/doc/currentVersion.png)


## Why
I was in need for a Firefox-AddOn playground - simple as that.

## Keyboard & Shortcuts
* ESC - Jumps focus to search or resets the content of search



## Developers (on Linux)
### Installing Requirements
1. Requirements: npm & jpm

> sudo apt install npm

> sudo npm install jpm --global


### Run Addon while developing
1. Navigate to the project folder
2. Run addon in a new empty temporary firefox profile

> jpm run -b $(which firefox)


### Run Addon-Tests while developing
1. Navigate to the project folder
2. Run addon in a new empty temporary firefox profile

> jpm test -b $(which firefox)


### Generating a build
1. Generate an .xpi

> jpm xpi

### Installing unsigned addons
set
> xpinstall.signatures.required

to
> false

in about:config


### Troubleshooting
1. /usr/bin/env: node: No such file or directory

> ln -s /usr/bin/nodejs /usr/bin/node
