const request = require('supertest');
const assert = require('assert');
const app = require('../src/app');
const config = require('../src/config');

describe('App', function () {
  it('exposes the configured server port', function () {
    assert.strictEqual(app.server_port, config.server.port);
  });

  it('GET /health responds with 200', async function () {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
  });

  it('GET / responds with 200 and contains Poomsae', async function () {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('Poomsae'));
  });

  it('GET / includes a Select Form link to the form selection screen', async function () {
    const res = await request(app).get('/');
    assert.ok(res.text.includes('Select Form'));
    assert.ok(res.text.includes('/form-selection'));
  });

  it('GET /styles.css serves a static asset', async function () {
    const res = await request(app).get('/styles.css');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('.display-font'));
    assert.ok(res.text.includes('.toggle-track'));
    assert.ok(res.text.includes('#volume-control'));
    assert.ok(res.text.includes('.taeguk-form-hover'));
  });

  it('serves all authored styles from a single stylesheet', async function () {
    const pages = ['index', 'form-selection', 'form-player', 'settings'];
    for (const page of pages) {
      const url = {
        index: '/',
        'form-player': '/form-player?form=data%2Fforms%2Ftaeguk%2Ftaegeuk_il_jang.yml',
      }[page] || `/${page}`;
      const res = await request(app).get(url);
      assert.strictEqual(res.status, 200);
      assert.ok(res.text.includes('href="/styles.css"'));
      assert.ok(!res.text.includes(`href="/${page}.css"`));
    }

    const styles = await request(app).get('/styles.css');
    assert.strictEqual(styles.status, 200);
    assert.ok(styles.text.includes('#volume-control'));
    assert.ok(styles.text.includes('.taeguk-hover-pal-jang'));
    assert.ok(styles.text.includes('.toggle-track'));
  });

  it('loads the configured player settings defaults', function () {
    assert.deepStrictEqual(config.player, {
      include_korean_techniques: false,
      display_korean_stance_names: false,
      display_move_technique: true,
      display_move_direction: true,
      display_move_stance: true,
      display_move_notes: true,
      display_form_details: true,
      display_new_moves: false,
      read_move_direction: true,
      read_move_technique: true,
      read_move_stance: true,
      read_kihap: true,
      read_step_number: false,
      voice: 'browser-default',
      volume: 0.75,
    });
  });

  it('GET /player-settings.js serves the settings behavior', async function () {
    const res = await request(app).get('/player-settings.js');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('poomsae.player-settings'));
    assert.ok(res.text.includes('getVoices()'));
    assert.ok(res.text.includes('voice.voiceURI'));
    assert.ok(res.text.includes("createOption('None', 'none')"));
    assert.ok(!res.text.includes("createOption('Default', 'default')"));
    assert.ok(res.text.includes("'browser-default'"));
    assert.ok(res.text.includes('removeParentheticalText(stance)'));
    assert.ok(res.text.includes("addEventListener('voiceschanged'"));
    assert.ok(res.text.includes('voiceLoadAttempts < 20'));
    assert.ok(res.text.includes('Loading browser voices...'));
  });

  it('GET /form-selection responds with 200 and contains a Home button', async function () {
    const res = await request(app).get('/form-selection');
    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('aria-label="Home"'));
    assert.ok(res.text.includes('<h1 class="display-font text-2xl font-semibold leading-tight"'));
    assert.ok(!res.text.includes('Back Home'));
    assert.ok(!res.text.includes('border-t border-slate-800'));
    assert.ok(res.text.includes('rounded-xl border border-white/10 bg-white/[0.03]'));
    assert.ok(res.text.includes('Taegeuk Il Jang'));
    assert.ok(res.text.includes('/form-player?form=data%2Fforms%2Ftaeguk%2Ftaegeuk_il_jang.yml'));
    assert.ok(res.text.includes('rounded-lg border border-white/10 bg-white/[0.05]'));
    assert.ok(!res.text.includes('{{formGroups}}'));
    [
      'taeguk-hover-il-jang',
      'taeguk-hover-ee-jang',
      'taeguk-hover-sam-jang',
      'taeguk-hover-sa-jang',
      'taeguk-hover-oh-jang',
      'taeguk-hover-yook-jang',
      'taeguk-hover-chil-jang',
      'taeguk-hover-pal-jang',
    ].forEach(hoverClass => assert.ok(res.text.includes(hoverClass)));
  });

  it('GET /form-player renders form metadata and movement controls', async function () {
    const res = await request(app)
      .get('/form-player')
      .query({ form: 'data/forms/taeguk/taegeuk_ee_jang.yml' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('<title>Form Player</title>'));
    assert.ok(res.text.includes('data-form-name="Taegeuk Ee Jang"'));
    assert.ok(res.text.includes('Taegeuk Ee Jang'));
    assert.ok(res.text.includes('태극 2장'));
    assert.ok(res.text.includes('Joy and Lake (Tae)'));
    assert.ok(res.text.includes('aria-label="Trigram ☱">☱</span>'));
    const formTitle = res.text.match(/<a href="\/form-selection"[^>]*>([\s\S]*?)<\/a>/);
    assert.ok(formTitle);
    assert.ok(!formTitle[1].includes('☱'));
    assert.ok(res.text.includes('<nav class="flex items-center justify-between gap-3" aria-label="Player navigation">'));
    assert.ok(!res.text.includes('<path d="M4 6h16M4 12h16M4 18h16" />'));
    assert.ok(res.text.includes('aria-label="Back to form selection"'));
    assert.ok(!res.text.includes('<h1 '));
    const formDetails = res.text.slice(res.text.indexOf('aria-label="Form details"'));
    assert.ok(formDetails.indexOf('7th Geup') < formDetails.indexOf('aria-label="Trigram ☱"'));
    assert.ok(formDetails.indexOf('aria-label="Trigram ☱"') < formDetails.indexOf('Joy and Lake (Tae)'));
    assert.ok(res.text.includes('7th Geup'));
    assert.ok(res.text.includes('18 steps'));
    assert.ok(res.text.includes('data-step="18"'));
    assert.ok(res.text.includes('Execute Kihap'));
    const stepOne = res.text.match(/<button[^>]*data-step="1"[\s\S]*?<\/button>/);
    const stepEighteen = res.text.match(/<button[^>]*data-step="18"[\s\S]*?<\/button>/);
    assert.ok(stepOne);
    assert.ok(stepEighteen);
    assert.ok(stepOne[0].includes('data-kihap="false"'));
    assert.ok(stepEighteen[0].includes('data-kihap="true"'));
    assert.ok(res.text.includes('step-duration-indicator'));
    assert.ok(!stepOne[0].includes('aria-label="Kihap"'));
    assert.ok(stepEighteen[0].includes('class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#448AFF] text-sm leading-5 text-[#448AFF]"'));
    assert.ok(stepEighteen[0].includes('&#x1F5E3;&#xFE0E;'));
    assert.ok(res.text.includes('aria-label="Home"'));
    assert.ok(res.text.includes('aria-label="Settings"'));
    assert.ok(res.text.includes('href="/settings?form=data%2Fforms%2Ftaeguk%2Ftaegeuk_ee_jang.yml"'));
    assert.strictEqual((res.text.match(/h-11 w-11 items-center justify-center rounded-full border border-white\/25/g) || []).length, 4);
    assert.strictEqual((res.text.match(/mx-4 h-3\.5 shrink-0 border-l border-white\/25/g) || []).length, 3);
    assert.strictEqual((res.text.match(/width="24" height="24"/g) || []).length, 1);
    assert.ok(res.text.includes('class="player-steps step-list-scroll min-h-0 flex-1 overflow-y-auto px-0 py-3"'));
    assert.ok(res.text.includes('class="step-item relative w-full'));
    assert.ok(res.text.includes('data-movement-technique'));
    assert.ok(res.text.includes('data-movement-direction'));
    assert.ok(res.text.includes('data-movement-stance'));
    assert.ok(res.text.includes('data-kihap="true"'));
    assert.ok(res.text.includes('<span data-movement-stance class="min-w-0 flex-1 text-sm font-normal text-white/50">Left walking stance (Ap seogi)</span>'));
    assert.ok(res.text.includes("settings.display_korean_stance_names"));
    assert.ok(res.text.includes('id="step-notes-section" class="h-20 shrink-0 overflow-hidden border-t border-white/10 px-5 py-2" aria-label="Step notes"'));
    assert.ok(res.text.includes('<div id="notes-row" class="hidden">'));
    assert.ok(res.text.includes('class="notes-content mt-1 text-sm text-white/90"'));
    assert.ok(!res.text.includes('id="context-direction"'));
    assert.ok(!res.text.includes('id="context-stance"'));
    assert.ok(!res.text.includes('id="context-technique"'));
    assert.ok(!res.text.includes('>Poomsae</span>'));
    assert.ok(!res.text.includes('<span>Previous</span>'));
    assert.ok(!res.text.includes('<span>Next</span>'));
    assert.ok(res.text.includes('id="play-toggle"'));
    assert.ok(res.text.includes('id="mute-toggle"'));
    assert.ok(res.text.includes('aria-label="Mute narration" aria-pressed="false"'));
    assert.ok(res.text.includes('id="muted-icon"'));
    assert.ok(res.text.includes('volumeControl.value = \'0\''));
    assert.ok(res.text.includes('lastUnmutedVolume = volume'));
    assert.ok(res.text.includes('volumeControl.classList.toggle(\'is-muted\', isMuted)'));
    assert.ok(res.text.includes('id="volume-control" data-setting="volume" type="range" min="0" max="1" step="0.01" value="0.75"'));
    assert.ok(res.text.includes('aria-valuetext="75%"'));
    assert.ok(res.text.includes('new SpeechSynthesisUtterance(narration)'));
    assert.ok(res.text.includes("settings.read_move_direction ? step.dataset.direction : ''"));
    assert.ok(res.text.includes("settings.read_move_technique ? technique : ''"));
    assert.ok(res.text.includes("settings.read_move_stance ? stance : ''"));
    assert.ok(res.text.includes("settings.read_step_number ? `Step ${step.dataset.step}` : ''"));
    assert.ok(res.text.includes("settings.read_kihap && step.dataset.kihap === 'true' ? 'Kihap!' : ''"));
    assert.ok(res.text.includes('const fillDuration = interval - completionFlash'));
    assert.ok(res.text.includes('indicator.style.transitionDuration = `${fillDuration}ms`'));
    assert.ok(!res.text.includes('kihap.pitch ='));
    assert.ok(res.text.includes('getActiveVoice()'));
    assert.ok(res.text.includes('id="active-voice-label"'));
    assert.ok(res.text.includes(": 'None'"));
    assert.ok(res.text.includes('volumeControl.disabled = voiceUnavailable'));
    assert.ok(res.text.includes('id="step-progress"'));
    assert.ok(res.text.includes('const intervalMs = 1000'));
    assert.ok(res.text.includes('class="mt-2 flex w-full items-center justify-center gap-1" role="group" aria-label="Playback speed"'));
    assert.ok(res.text.includes('href="/form-selection"'));
    assert.ok(res.text.indexOf('id="play-toggle"') < res.text.indexOf('id="volume-control"'));
    assert.ok(res.text.indexOf('id="volume-control"') < res.text.indexOf('id="next-step"'));
    assert.ok(res.text.includes('utterance.volume = isMuted ? 0 : Number(volumeControl.value)'));
    assert.ok(res.text.includes('utterance.rate = speed'));
    assert.deepStrictEqual(
      Array.from(res.text.matchAll(/data-speed="([^"]+)"/g), match => match[1]),
      ['0.1', '0.3', '0.5', '0.75', '1', '1.3', '1.5', '1.75', '2']
    );
    assert.ok(!res.text.includes('{{movements}}'));
  });

  it('GET /form-player rejects a form file that is not enabled in config', async function () {
    const res = await request(app)
      .get('/form-player')
      .query({ form: '../../package.json' });

    assert.strictEqual(res.status, 404);
  });

  it('GET /settings displays player settings and returns to the selected form player', async function () {
    const res = await request(app)
      .get('/settings')
      .query({ form: 'data/forms/taeguk/taegeuk_ee_jang.yml' });

    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('<title>Settings</title>'));
    assert.ok(res.text.includes('id="voice-status"'));
    assert.strictEqual((res.text.match(/type="checkbox"/g) || []).length, 13);
    assert.strictEqual((res.text.match(/role="switch"/g) || []).length, 13);
    assert.strictEqual((res.text.match(/rounded-lg border border-white\/10 bg-white\/5/g) || []).length, 0);
    assert.strictEqual((res.text.match(/<option /g) || []).length, 0);
    [
      'include_korean_techniques',
      'display_korean_stance_names',
      'display_move_technique',
      'display_move_direction',
      'display_move_stance',
      'display_move_notes',
      'display_form_details',
      'display_new_moves',
      'read_move_direction',
      'read_move_technique',
      'read_move_stance',
      'read_kihap',
      'read_step_number',
    ].forEach(setting => assert.ok(res.text.includes(`data-setting="${setting}"`)));
    assert.ok(res.text.indexOf('data-setting="read_step_number"') < res.text.indexOf('data-setting="read_move_direction"'));
    assert.ok(res.text.includes('aria-label="Read step number"'));
    assert.ok(res.text.indexOf('id="player-voice"') < res.text.indexOf('<legend class="mb-3 text-sm font-semibold uppercase tracking-wider text-white/60">Narration</legend>'));
    assert.ok(res.text.includes('aria-label="Read kihap (yell)"'));
    assert.ok(res.text.includes('aria-label="Display Korean technique names"'));
    assert.ok(res.text.includes('Display Korean stance names'));
    assert.ok(!res.text.includes('<option value="default">Default</option>'));
    assert.ok(res.text.includes('id="saved-indicator" class="saved-indicator min-w-0 flex-1 px-2 text-center"'));
    assert.ok(res.text.includes('class="toggle-track"'));
    assert.ok(res.text.indexOf('Settings</h1>') < res.text.indexOf('id="saved-indicator"'));
    assert.ok(res.text.indexOf('id="saved-indicator"') < res.text.indexOf('aria-label="Back to form player"'));
    const koreanSetting = res.text.indexOf('data-setting="include_korean_techniques"');
    const koreanToggleTrack = res.text.indexOf('class="toggle-track"', koreanSetting);
    const koreanSettingLabel = res.text.indexOf('Display Korean technique names', koreanToggleTrack);
    assert.ok(koreanSetting < koreanToggleTrack);
    assert.ok(koreanToggleTrack < koreanSettingLabel);
    assert.ok(res.text.indexOf('data-setting="display_korean_stance_names"') > koreanSettingLabel);
    assert.ok(res.text.includes('href="/form-player?form=data%2Fforms%2Ftaeguk%2Ftaegeuk_ee_jang.yml"'));
    assert.ok(res.text.includes('aria-label="Back to form player"'));
    assert.ok(!res.text.includes('{{playerUrl}}'));
    assert.ok(!res.text.includes('{{playerSettings}}'));
  });

  it('GET /settings defaults to an enabled form when no form is selected', async function () {
    const res = await request(app).get('/settings');

    assert.strictEqual(res.status, 200);
    assert.ok(res.text.includes('href="/form-player?form=data%2Fforms%2Ftaeguk%2Ftaegeuk_il_jang.yml"'));
  });

  it('GET /settings rejects a form file that is not enabled in config', async function () {
    const res = await request(app)
      .get('/settings')
      .query({ form: '../../package.json' });

    assert.strictEqual(res.status, 404);
  });
});
