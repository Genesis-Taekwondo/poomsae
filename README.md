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

Player Settings
---------------

Use the gear button in the form player to configure which movement details are shown, including whether Korean technique and stance names are displayed. Changes are saved automatically in the current browser and apply when returning to the player. Default settings are defined in `src/config/player_config.yml`.

The form player uses browser speech synthesis to narrate the current movement during playback. Narration volume defaults to 75% when a voice is available; use the volume slider between the play and next-step controls to adjust it. The Voice setting lists installed browser voices, supports None, and uses the browser's default voice when available; if no voices are available, narration is disabled until one is selected. Narration settings control whether step numbers, move direction, technique, stance, and kihap are spoken. During playback, a progress line at the bottom of the active move fills over the configured playback interval.

Notes:
- The test harness requires the project dependencies (dev deps) to be installed.
- `server.js` exports the Express `app`, so tests run without starting a persistent server.
