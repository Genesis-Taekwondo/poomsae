(() => {
  const storageKey = 'poomsae.player-settings';
  const defaultsElement = document.getElementById('player-settings-defaults');
  const defaults = JSON.parse(defaultsElement.textContent);
  const settingsControls = Array.from(document.querySelectorAll('[data-setting]'));
  const feedback = document.getElementById('settings-feedback');
  const playerFeedback = document.getElementById('player-settings-feedback');
  const voiceControl = document.getElementById('player-voice');
  const voiceStatus = document.getElementById('voice-status');
  let availableVoiceCount = 0;
  let voiceLoadAttempts = 0;
  let voiceLoadTimer;

  const showSaved = () => {
    const indicator = document.getElementById('saved-indicator');
    if (!indicator) return;
    indicator.textContent = `Last saved ${new Date().toISOString()}`;
    indicator.classList.remove('saved-flash');
    void indicator.offsetWidth;
    indicator.classList.add('saved-flash');
  };

  const showError = message => {
    const target = feedback || playerFeedback;
    if (!target) return;
    target.textContent = message;
    target.setAttribute('role', 'alert');
    target.classList.remove('hidden');
    target.classList.remove('text-white/60');
    target.classList.add('text-rose-300');
  };

  const normalizeSettings = value => {
    const normalized = { ...defaults };
    if (!value || typeof value !== 'object' || Array.isArray(value)) return normalized;

    Object.keys(defaults).forEach(key => {
      if (typeof defaults[key] === 'boolean' && typeof value[key] === 'boolean') {
        normalized[key] = value[key];
      }
    });
    if (typeof value.voice === 'string') {
      normalized.voice = value.voice === 'default' ? 'browser-default' : value.voice;
    }
    if (Number.isFinite(value.volume)) {
      normalized.volume = Math.max(0, Math.min(1, value.volume));
    }
    return normalized;
  };

  let settings = { ...defaults };
  try {
    const storedSettings = window.localStorage.getItem(storageKey);
    if (storedSettings !== null) settings = normalizeSettings(JSON.parse(storedSettings));
  } catch {
    showError('Could not load saved settings. Defaults are being used.');
  }

  const updateSettingsControls = () => {
    settingsControls.forEach(control => {
      const key = control.dataset.setting;
      if (control.type === 'checkbox') {
        control.checked = settings[key];
      } else {
        const selectedOptionExists = control.type !== 'select-one'
          || Array.from(control.options).some(option => option.value === settings[key]);
        control.value = selectedOptionExists ? settings[key] : 'none';
        if (key === 'volume') {
          control.setAttribute('aria-valuetext', `${Math.round(settings.volume * 100)}%`);
        }
      }
    });
  };

  const populateVoiceOptions = () => {
    if (!voiceControl) return;

    const speechSynthesisAvailable = 'speechSynthesis' in window;
    const voices = speechSynthesisAvailable ? window.speechSynthesis.getVoices() : [];
    availableVoiceCount = voices.length;
    window.clearTimeout(voiceLoadTimer);
    if (voices.length) {
      voiceLoadAttempts = 0;
      if (voiceStatus) voiceStatus.textContent = '';
    } else if (!speechSynthesisAvailable) {
      if (voiceStatus) {
        voiceStatus.textContent = 'Speech synthesis is not supported in this browser.';
      }
    } else if (voiceLoadAttempts < 20) {
      voiceLoadAttempts += 1;
      if (voiceStatus) voiceStatus.textContent = 'Loading browser voices...';
      voiceLoadTimer = window.setTimeout(populateVoiceOptions, 250);
    } else if (voiceStatus) {
      voiceStatus.textContent = 'No voices are available. Check your system speech settings or try another browser.';
    }

    const createOption = (label, value) => {
      const option = document.createElement('option');
      option.textContent = label;
      option.value = value;
      return option;
    };
    const options = [createOption('None', 'none')];
    const voiceUris = new Set();
    const browserDefault = voices.find(voice => voice.default) || voices[0];

    voices.forEach(voice => {
      if (!voice.voiceURI || voiceUris.has(voice.voiceURI)) return;
      voiceUris.add(voice.voiceURI);
      const isBrowserDefault = voice === browserDefault;
      const value = isBrowserDefault ? 'browser-default' : voice.voiceURI;
      const browserDefaultLabel = isBrowserDefault ? ' - Browser default' : '';
      options.push(createOption(`${voice.name} (${voice.lang})${browserDefaultLabel}`, value));
    });

    voiceControl.replaceChildren(...options);
    const selectedVoiceExists = settings.voice === 'none'
      || (settings.voice === 'browser-default' && Boolean(browserDefault))
      || voices.some(voice => voice.voiceURI === settings.voice);
    if (!selectedVoiceExists && voices.length) {
      settings.voice = 'browser-default';
    }
    const optionExists = options.some(option => option.value === settings.voice);
    voiceControl.value = optionExists ? settings.voice : 'none';
  };

  const volumeControl = document.getElementById('volume-control');
  if (volumeControl) {
    volumeControl.addEventListener('input', () => {
      volumeControl.setAttribute('aria-valuetext', `${Math.round(Number(volumeControl.value) * 100)}%`);
    });
  }

  const setHidden = (element, hidden) => {
    element.hidden = hidden;
    element.classList.toggle('hidden', hidden);
  };

  const removeParentheticalText = text => text.replace(/\s*\([^)]*\)/g, '').trim();

  const applyPlayerSettings = () => {
    document.querySelectorAll('[data-movement-technique]').forEach(element => {
      setHidden(element, !settings.display_move_technique);
      const technique = element.closest('.step-item').dataset.technique;
      element.textContent = settings.include_korean_techniques
        ? technique
        : removeParentheticalText(technique);
    });
    document.querySelectorAll('[data-movement-direction]').forEach(element => {
      setHidden(element, !settings.display_move_direction);
    });
    document.querySelectorAll('[data-movement-stance]').forEach(element => {
      setHidden(element, !settings.display_move_stance);
      const stance = element.closest('.step-item').dataset.stance;
      element.textContent = settings.display_korean_stance_names
        ? stance
        : removeParentheticalText(stance);
    });

    const formDetails = document.getElementById('form-details');
    if (formDetails) setHidden(formDetails, !settings.display_form_details);

    const newMoves = document.getElementById('new-moves-introduced');
    if (newMoves) setHidden(newMoves, !settings.display_new_moves);

    const notesSection = document.getElementById('step-notes-section');
    if (notesSection) setHidden(notesSection, !settings.display_move_notes);

    window.poomsaePlayerSettings = settings;
    window.dispatchEvent(new Event('poomsae:settings-changed'));
  };

  const saveSettings = () => {
    const nextSettings = { ...settings };
    settingsControls.forEach(control => {
      const key = control.dataset.setting;
      if (key === 'voice' && availableVoiceCount === 0) {
        nextSettings.voice = settings.voice;
        return;
      }
      nextSettings[key] = control.type === 'checkbox'
        ? control.checked
        : control.type === 'range'
          ? Number(control.value)
          : control.value;
    });
    settings = normalizeSettings(nextSettings);
    updateSettingsControls();
    applyPlayerSettings();

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(settings));
      showSaved();
    } catch {
      showError('Changes apply now but could not be saved on this device.');
    }
  };

  settingsControls.forEach(control => control.addEventListener('change', saveSettings));
  if ('speechSynthesis' in window) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      voiceLoadAttempts = 0;
      populateVoiceOptions();
    });
  }
  window.addEventListener('storage', event => {
    if (event.key !== storageKey) return;
    try {
      settings = event.newValue === null
        ? { ...defaults }
        : normalizeSettings(JSON.parse(event.newValue));
      updateSettingsControls();
      applyPlayerSettings();
      if (feedback) feedback.textContent = 'Settings updated from another tab.';
    } catch {
      showError('Could not load settings updated in another tab.');
    }
  });

  updateSettingsControls();
  populateVoiceOptions();
  applyPlayerSettings();
})();
