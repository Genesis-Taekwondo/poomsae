# <img src="public/poomsae-logo.jpeg" alt="poomsae logo" width="28" style="vertical-align:middle; margin-right:8px; border-radius:50%"> poomsae
[![CI](https://github.com/Genesis-Taekwondo/poomsae/actions/workflows/ci.yml/badge.svg)](https://github.com/Genesis-Taekwondo/poomsae/actions/workflows/ci.yml)
A simple web app for training with Kukkiwon/WT style poomsae, or forms.

Node version
------------

This project supports Node.js **22.x or later**. For local setup with `nvm` install or switch to the 22.x line:

```bash
nvm install 22
nvm use 22
```

The repository's `.nvmrc` requests the `22` major (latest 22.x) and CI requires `22.x` so any Node `22.x` version will also work.

Testing
-------

This project includes a simple integration test using **Mocha** and **Supertest** that verifies the homepage responds and contains the app title.

To run the tests locally:

```bash
# install dependencies (includes dev deps)
npm install

# build the Tailwind stylesheet (if needed)
npm run build:css

# run the test suite
npm test
```

Notes:
- The test harness requires the project dependencies (dev deps) to be installed.
- `server.js` exports the Express `app`, so tests run without starting a persistent server.
