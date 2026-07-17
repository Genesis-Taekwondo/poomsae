# <img src="public/poomsae-logo.jpeg" alt="poomsae logo" width="28" style="vertical-align:middle; margin-right:8px; border-radius:50%"> poomsae

A simple web app for training with Kukkiwon/WT style poomsae, or forms.

[![CI](https://github.com/Genesis-Taekwondo/poomsae/actions/workflows/ci.yml/badge.svg)](https://github.com/Genesis-Taekwondo/poomsae/actions/workflows/ci.yml)
<a href='https://ko-fi.com/Y8Y56BPH' target='_blank'><img height='1.7em' style='border:0px;height:1.7em;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Live Demo at [https://poomsae.onrender.com/](https://poomsae.onrender.com/) 

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

Running Locally
-------

To run the application locally:

```bash
# Start the server
npm run start
```

By default, the application uses port 3000. Open your browser to http://localhost:3000 once the server has started to view the application.


Notes:
- The test harness requires the project dependencies (dev deps) to be installed.
- `server.js` exports the Express `app`, so tests run without starting a persistent server.
