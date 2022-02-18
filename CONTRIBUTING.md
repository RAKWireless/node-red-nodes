# Contributing to Node-RED

We welcome contributions, but request you follow these guidelines.

 - [Raising issues](#raising-issues)
 - [Feature requests](#feature-requests)
 - [Pull-Requests](#pull-requests)
   - [Contributor License Agreement](#contributor-license-agreement)

This project adheres to the [Contributor Covenant 1.4](http://contributor-covenant.org/version/1/4/).
By participating, you are expected to uphold this code. Please report unacceptable
behavior to any of the [project's core team](https://github.com/orgs/node-red/teams/core).

## Raising issues

Please raise any bug reports on the project's issue tracker. Be sure to search the list to see if your issue has already been raised.

A good bug report is one that make it easy for us to understand what you were trying to do and what went wrong.

Provide as much context as possible so we can try to recreate the issue. If possible, include the relevant part of your flow. To do this, select the relevant nodes, press Ctrl-E and copy the flow data from the Export dialog.

At a minimum, please include:

 - Version of Node-RED - either release number if you downloaded a zip, or the first few lines of `git log` if you are cloning the repository directly.
 - Version of node.js - what does `node -v` say?

## Feature requests

For feature requests, please raise an issue on the project's issue tracker.

Be clear about the motivation and the expected output of the new feature.

## Pull-Requests

If you want to raise a pull-request with a new feature, or a refactoring of existing code, it may well get rejected if you haven't first discussed it on the issue tracker.

### Contributor License Agreement

By default, all contributions will share the same license declared for the whole repository.

### Coding standards

Please ensure you follow the coding standards used through-out the existing code base. Some basic rules include:

 - indent with 4-spaces, no tabs. No arguments.
 - opening brace on same line as `if`/`for`/`function` and so on, closing brace  on its own line.
 - There are .jshintrc and .jscsrc files included in the project which may help
