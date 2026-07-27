(() => {
  'use strict';

  const STORAGE_KEY = 'posture-strength-tracker-v1';
  const APP_VERSION = 2;
  const DAY_MS = 86_400_000;
  const MIN_PIN_LENGTH = 6;

  // Version 1 kept the warm-up inside each strength plan. Version 2 moved it into
  // its own always-visible section, so those check marks have to move with it.
  const LEGACY_WARMUP_IDS = {
    'a-march': 'warmup-march',
    'b-march': 'warmup-march',
    'a-shoulder-circles': 'warmup-shoulder-circles',
    'b-shoulder-circles': 'warmup-shoulder-circles',
    'a-cat-cow': 'warmup-cat-cow',
    'b-cat-cow': 'warmup-cat-cow',
    'a-wall-slides': 'warmup-wall-slides',
    'b-wall-slides': 'warmup-wall-slides',
    'a-squats-warmup': 'warmup-squats',
    'b-squats-warmup': 'warmup-squats'
  };

  const PLANS = {
    daily: {
      title: 'Daily posture routine',
      description: 'A light routine for movement quality. It should not feel like a hard workout.',
      exercises: [
        {
          id: 'chin-tucks',
          name: 'Chin tucks',
          target: '2 × 8 reps · hold 3–5 sec',
          cue: 'Slide your head straight back without looking down. Keep the movement gentle and stop if it causes dizziness or sharp pain.',
          group: 'Posture control'
        },
        {
          id: 'wall-slides',
          name: 'Wall slides',
          target: '2 × 8–10 reps',
          cue: 'Keep your ribs relaxed and shoulders away from your ears. Use a comfortable range; your hands do not have to stay against the wall.',
          group: 'Posture control'
        },
        {
          id: 'band-pull-aparts-daily',
          name: 'Band pull-aparts',
          target: '2 × 15 reps',
          cue: 'Move from the shoulder blades without arching your lower back. Keep a soft bend in the elbows.',
          group: 'Upper back'
        },
        {
          id: 'thoracic-extension',
          name: 'Thoracic extension on a yoga block',
          target: '5 slow breaths',
          seconds: 45,
          cue: 'Place the block across the upper back, not under the lower back. Support your head and avoid forcing the range.',
          group: 'Mobility'
        },
        {
          id: 'glute-bridge-daily',
          name: 'Glute bridge',
          target: '2 × 15 reps',
          cue: 'Lift with your glutes while keeping your ribs down. Stop before the lower back starts to overarch.',
          group: 'Hip support'
        }
      ]
    },
    warmup: {
      title: 'Warm-up',
      description: 'Five easy minutes before a strength session — about one minute per movement.',
      exercises: [
        { id: 'warmup-march', name: 'March in place', target: '60 sec', seconds: 60, cue: 'Move easily and let your arms swing.', group: 'Warm-up' },
        { id: 'warmup-shoulder-circles', name: 'Shoulder circles', target: '60 sec · 10 each direction', seconds: 60, cue: 'Use a smooth, comfortable range without shrugging.', group: 'Warm-up' },
        { id: 'warmup-cat-cow', name: 'Cat–cow', target: '60 sec · 6–8 reps', seconds: 60, cue: 'Move gently through the spine without forcing either end position.', group: 'Warm-up' },
        { id: 'warmup-wall-slides', name: 'Wall slides', target: '60 sec · 8 reps', seconds: 60, cue: 'Keep your ribs relaxed and shoulders away from your ears.', group: 'Warm-up' },
        { id: 'warmup-squats', name: 'Bodyweight squats', target: '60 sec · 10 reps', seconds: 60, cue: 'Use a comfortable depth and keep your whole foot in contact with the floor.', group: 'Warm-up' }
      ]
    },
    A: {
      title: 'Workout A',
      description: 'Chest, back, legs and trunk stability. Leave about 1–3 good repetitions in reserve.',
      exercises: [
        { id: 'a-pullups', name: 'Pull-ups or slow negatives', target: '3 sets', cue: 'Use clean repetitions. For negatives, start at the top and lower for 3–5 seconds.', group: 'Main workout' },
        { id: 'a-pushups', name: 'Push-ups', target: '3 × 6–15 reps', cue: 'Keep your body in one line, avoid sagging through the lower back, and keep elbows roughly 30–60° from your torso.', group: 'Main workout' },
        { id: 'a-band-row', name: 'Resistance-band row', target: '3 × 12–20 reps', cue: 'Pull toward your lower ribs. Keep your shoulders down and avoid leaning backward.', group: 'Main workout' },
        { id: 'a-lunges', name: 'Reverse lunges or Bulgarian split squats', target: '3 × 8–12 each leg', cue: 'Use support for balance if needed. Keep the movement controlled and pain-free.', group: 'Main workout' },
        { id: 'a-glute-bridge', name: 'Glute bridge', target: '3 × 12–20 reps', cue: 'Finish with the glutes rather than pushing into a large lower-back arch.', group: 'Main workout' },
        { id: 'a-dead-bug', name: 'Dead bug', target: '3 × 6–10 each side', cue: 'Move slowly while keeping the trunk steady. Shorten the lever if your lower back lifts or discomfort appears.', group: 'Main workout' }
      ]
    },
    B: {
      title: 'Workout B',
      description: 'Shoulders, shoulder blades, legs and trunk stability. Keep every repetition controlled.',
      exercises: [
        { id: 'b-face-pulls', name: 'Resistance-band face pulls', target: '3 × 12–20 reps', cue: 'Pull toward your forehead and separate your hands. Keep the neck relaxed and avoid leaning back.', group: 'Main workout' },
        { id: 'b-pike-pushups', name: 'Pike push-ups', target: '3 × 5–12 reps', cue: 'Keep your hips high and lower your head slightly forward between your hands. Use an easier angle if needed.', group: 'Main workout' },
        { id: 'b-lateral-raises', name: 'Dumbbell lateral raises', target: '3 × 12–20 reps', cue: 'Raise with control and keep the shoulders away from your ears. Use one arm at a time if 3 kg is too heavy for strict form.', group: 'Main workout' },
        { id: 'b-band-pull-aparts', name: 'Band pull-aparts', target: '3 × 12–20 reps', cue: 'Keep the ribs stacked over the pelvis and avoid turning the movement into a lower-back arch.', group: 'Main workout' },
        { id: 'b-squats', name: 'Squats with a dumbbell or backpack', target: '3 × 10–20 reps', cue: 'Use a load you can control and a depth that feels comfortable.', group: 'Main workout' },
        { id: 'b-bird-dog', name: 'Bird dog', target: '3 × 6–10 each side', cue: 'Reach long rather than high. Keep your hips level and avoid rotating or arching.', group: 'Main workout' },
        { id: 'b-side-plank', name: 'Side plank', target: '2–3 × 15–40 sec each side', seconds: 30, cue: 'Keep your body long and breathe normally. Use the bent-knee version if necessary.', group: 'Main workout' }
      ]
    }
  };

  const dom = {};
  let state = loadState();
  let selectedDate = startOfDay(new Date());
  let calendarCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  let currentView = 'today';
  let timerIntervalId = null;
  let timerRunning = false;
  let timerRemainingSeconds = state.settings.breakInterval * 60;
  let supabaseClient = null;
  let authUser = null;
  let cloudSaveTimer = null;
  let syncing = false;
  let gateMode = 'signIn';
  let gateDismissed = false;
  let wakeLock = null;
  // One countdown per exercise card, keyed by `${section}:${exerciseId}`.
  const exerciseTimers = new Map();
  const warmupRun = { active: false, index: 0, deadline: 0, remaining: 0, paused: false, intervalId: null };
  const saveNotesDebounced = debounce((dateKey, value) => {
    const log = ensureLog(dateKey);
    log.notes = value.trim();
    touchLog(log);
    persistState();
  }, 300);

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    cacheDom();
    bindEvents();
    applyTheme();
    populateSettings();
    renderAll();
    // loadState() upgrades older payloads in memory; write the result back so the
    // stored copy matches the current schema instead of migrating on every launch.
    persistState({ skipCloud: true });
    initSupabase();
    registerServiceWorker();
  }

  function cacheDom() {
    const ids = [
      'connectionBadge', 'themeToggle', 'todayView', 'calendarView', 'progressView', 'settingsView',
      'previousDay', 'nextDay', 'relativeDate', 'todayHeading', 'dayProgressValue', 'dayProgressBar',
      'streakValue', 'dailyExerciseList', 'dailySectionProgress', 'strengthSection', 'strengthEyebrow',
      'strengthHeading', 'strengthTypeSelect', 'strengthSectionProgress', 'strengthDescription',
      'strengthExerciseList', 'dayNotes', 'finishTitle', 'finishMessage', 'completeDayButton',
      'timerDisplay', 'timerToggle', 'timerReset', 'previousMonth', 'nextMonth', 'calendarHeading',
      'calendarGrid', 'progressRange', 'completedDaysStat', 'strengthSessionsStat', 'routineRateStat',
      'bestStreakStat', 'activityChart', 'historyList', 'anchorTypeSelect', 'anchorDateInput',
      'breakIntervalSelect', 'saveScheduleButton', 'cloudStatusBadge', 'cloudDescription',
      'signedOutControls', 'signedInControls', 'authEmail', 'magicLinkButton', 'signedInEmail',
      'syncNowButton', 'signOutButton', 'exportButton', 'importInput', 'resetButton', 'toastRegion',
      'exerciseTemplate',
      'warmupSection', 'warmupSectionProgress', 'warmupDescription', 'warmupExerciseList',
      'runWarmupButton', 'warmupRunPanel', 'warmupRunStep', 'warmupRunName', 'warmupRunCue',
      'warmupRunRemaining', 'warmupRunPause', 'warmupRunSkip', 'warmupRunStop',
      'authGate', 'authGateTitle', 'authGateSubtitle', 'authModeSignIn', 'authModeRegister',
      'authGateForm', 'gateEmail', 'gatePin', 'gatePinConfirmField', 'gatePinConfirm', 'gateError',
      'gateSubmit', 'gateMagicLink', 'gateSkip',
      'authPin', 'pinSignInButton', 'pinRegisterButton', 'newPinInput', 'changePinButton', 'lockButton'
    ];
    ids.forEach((id) => { dom[id] = document.getElementById(id); });
    dom.tabButtons = [...document.querySelectorAll('.tab-button')];
    dom.views = [...document.querySelectorAll('.view')];
    dom.weekdayInputs = [...document.querySelectorAll('.weekday-picker input[type="checkbox"]')];
  }

  function bindEvents() {
    dom.tabButtons.forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view)));
    dom.previousDay.addEventListener('click', () => changeSelectedDay(-1));
    dom.nextDay.addEventListener('click', () => changeSelectedDay(1));
    dom.previousMonth.addEventListener('click', () => changeMonth(-1));
    dom.nextMonth.addEventListener('click', () => changeMonth(1));
    dom.strengthTypeSelect.addEventListener('change', handleStrengthTypeChange);
    dom.dayNotes.addEventListener('input', (event) => {
      saveNotesDebounced(formatDateKey(selectedDate), event.target.value);
    });
    dom.completeDayButton.addEventListener('click', toggleDayComplete);
    dom.themeToggle.addEventListener('click', toggleTheme);
    dom.progressRange.addEventListener('change', renderProgress);
    dom.saveScheduleButton.addEventListener('click', saveScheduleSettings);
    dom.timerToggle.addEventListener('click', toggleTimer);
    dom.timerReset.addEventListener('click', resetTimer);
    dom.magicLinkButton.addEventListener('click', () => sendMagicLink(dom.authEmail.value));
    dom.syncNowButton.addEventListener('click', () => syncWithCloud(true));
    dom.signOutButton.addEventListener('click', signOut);
    dom.exportButton.addEventListener('click', exportData);
    dom.importInput.addEventListener('change', importData);
    dom.resetButton.addEventListener('click', resetAllData);

    dom.runWarmupButton.addEventListener('click', startWarmupRun);
    dom.warmupRunPause.addEventListener('click', toggleWarmupRunPause);
    dom.warmupRunSkip.addEventListener('click', () => advanceWarmupRun(false));
    dom.warmupRunStop.addEventListener('click', () => stopWarmupRun('Warm-up stopped.'));

    dom.pinSignInButton.addEventListener('click', () => signInWithPin(dom.authEmail.value, dom.authPin.value));
    dom.pinRegisterButton.addEventListener('click', () => registerWithPin(dom.authEmail.value, dom.authPin.value));
    dom.changePinButton.addEventListener('click', changePin);
    dom.lockButton.addEventListener('click', lockApp);

    dom.authModeSignIn.addEventListener('click', () => setGateMode('signIn'));
    dom.authModeRegister.addEventListener('click', () => setGateMode('register'));
    dom.authGateForm.addEventListener('submit', handleGateSubmit);
    dom.gateMagicLink.addEventListener('click', () => sendMagicLink(dom.gateEmail.value));
    dom.gateSkip.addEventListener('click', () => {
      gateDismissed = true;
      hideAuthGate();
      showToast('Working on this device only. Sign in from Settings whenever you want to sync.', '', 6000);
    });
  }

  function renderAll() {
    renderToday();
    renderCalendar();
    renderProgress();
    updateConnectionUi();
  }

  function renderToday() {
    const dateKey = formatDateKey(selectedDate);
    const log = getVirtualLog(dateKey);
    const strengthType = effectiveStrengthType(dateKey, log);

    dom.relativeDate.textContent = relativeDateLabel(selectedDate);
    dom.todayHeading.textContent = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(selectedDate);

    renderExerciseList(dom.dailyExerciseList, PLANS.daily.exercises, 'daily', log);

    renderExerciseList(dom.warmupExerciseList, PLANS.warmup.exercises, 'warmup', log);
    const warmupDone = countCompleted(log.warmup.completed, PLANS.warmup.exercises);
    dom.warmupSectionProgress.textContent = `${warmupDone}/${PLANS.warmup.exercises.length}`;
    dom.warmupDescription.textContent = strengthType === 'none'
      ? 'No strength session today, so the warm-up is optional — it does not count toward the day.'
      : PLANS.warmup.description;

    dom.strengthTypeSelect.value = strengthType;
    if (strengthType === 'none') {
      dom.strengthEyebrow.textContent = isScheduledStrengthDay(selectedDate) ? 'Strength session skipped' : 'Recovery day';
      dom.strengthHeading.textContent = 'No strength workout scheduled';
      dom.strengthDescription.textContent = 'Complete the daily posture routine and stay generally active.';
      dom.strengthExerciseList.innerHTML = '<p class="empty-state">No strength exercises for this day.</p>';
      dom.strengthSectionProgress.textContent = 'Rest';
    } else {
      const plan = PLANS[strengthType];
      dom.strengthEyebrow.textContent = isScheduledStrengthDay(selectedDate) ? 'Scheduled strength session' : 'Manually added strength session';
      dom.strengthHeading.textContent = plan.title;
      dom.strengthDescription.textContent = plan.description;
      renderExerciseList(dom.strengthExerciseList, plan.exercises, 'strength', log);
      const strengthDone = countCompleted(log.strength.completed, plan.exercises);
      dom.strengthSectionProgress.textContent = `${strengthDone}/${plan.exercises.length}`;
    }

    const dailyDone = countCompleted(log.daily.completed, PLANS.daily.exercises);
    dom.dailySectionProgress.textContent = `${dailyDone}/${PLANS.daily.exercises.length}`;
    dom.dayNotes.value = log.notes || '';

    const progress = dayCompletionRatio(dateKey, log);
    const progressPercent = Math.round(progress * 100);
    dom.dayProgressValue.textContent = `${progressPercent}%`;
    dom.dayProgressBar.style.width = `${progressPercent}%`;
    dom.streakValue.textContent = pluralDays(calculateCurrentStreak());

    const finishCard = dom.completeDayButton.closest('.finish-card');
    if (log.completed) {
      finishCard.classList.add('complete');
      dom.finishTitle.textContent = 'Day completed';
      dom.finishMessage.textContent = 'Nice work. You can reopen the day if you need to edit it.';
      dom.completeDayButton.textContent = 'Reopen day';
      dom.completeDayButton.disabled = false;
    } else {
      finishCard.classList.remove('complete');
      dom.finishTitle.textContent = 'Finish today’s plan';
      dom.finishMessage.textContent = progress >= 1
        ? 'Everything is checked. Mark the day as complete.'
        : 'Complete the required exercises, then mark the day as finished.';
      dom.completeDayButton.textContent = 'Mark day complete';
      dom.completeDayButton.disabled = progress < 1;
    }
  }

  function renderExerciseList(container, exercises, section, log) {
    container.innerHTML = '';
    const renderedDateKey = log.date;
    let previousGroup = null;
    exercises.forEach((exercise) => {
      if (exercise.group && exercise.group !== previousGroup) {
        const groupLabel = document.createElement('p');
        groupLabel.className = 'exercise-group-label';
        groupLabel.textContent = exercise.group;
        container.appendChild(groupLabel);
        previousGroup = exercise.group;
      }

      const fragment = dom.exerciseTemplate.content.cloneNode(true);
      const card = fragment.querySelector('.exercise-card');
      const checkbox = fragment.querySelector('.exercise-checkbox');
      const name = fragment.querySelector('.exercise-name');
      const target = fragment.querySelector('.exercise-target');
      const cue = fragment.querySelector('.exercise-cue');
      const toggle = fragment.querySelector('.exercise-details-toggle');
      const details = fragment.querySelector('.exercise-details');
      const actualInput = fragment.querySelector('.exercise-log-input');
      const timerButton = fragment.querySelector('.exercise-timer-button');

      const completed = Boolean(log[section]?.completed?.[exercise.id]);
      checkbox.checked = completed;
      card.classList.toggle('completed', completed);
      name.textContent = exercise.name;
      target.textContent = exercise.target;
      cue.textContent = exercise.cue;
      actualInput.value = log[section]?.actual?.[exercise.id] || '';
      checkbox.setAttribute('aria-label', `Mark ${exercise.name} complete`);

      checkbox.addEventListener('change', () => {
        setExerciseCompleted(renderedDateKey, section, exercise.id, checkbox.checked);
      });

      if (exercise.seconds) {
        const timerKey = `${section}:${exercise.id}`;
        timerButton.classList.remove('hidden');
        // renderToday() runs on every check, so reconnect a countdown that is still running.
        const running = exerciseTimers.get(timerKey);
        if (running) {
          running.button = timerButton;
          timerButton.classList.add('running');
          paintExerciseTimer(running);
        } else {
          timerButton.textContent = `▶ ${formatDuration(exercise.seconds)}`;
        }
        timerButton.setAttribute('aria-label', `Start a ${exercise.seconds} second timer for ${exercise.name}`);
        timerButton.addEventListener('click', () => {
          toggleExerciseTimer(timerKey, exercise, renderedDateKey, section, timerButton);
        });
      }

      toggle.addEventListener('click', () => {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
        toggle.textContent = expanded ? 'Details' : 'Hide';
        details.classList.toggle('hidden', expanded);
      });

      actualInput.addEventListener('input', debounce(() => {
        const mutableLog = ensureLog(renderedDateKey);
        const value = actualInput.value.trim();
        if (value) mutableLog[section].actual[exercise.id] = value;
        else delete mutableLog[section].actual[exercise.id];
        touchLog(mutableLog);
        persistState();
      }, 350));

      container.appendChild(fragment);
    });
  }

  function renderCalendar() {
    const year = calendarCursor.getFullYear();
    const month = calendarCursor.getMonth();
    dom.calendarHeading.textContent = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(calendarCursor);
    dom.calendarGrid.innerHTML = '';

    const first = new Date(year, month, 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = addDays(first, -mondayOffset);

    for (let index = 0; index < 42; index += 1) {
      const date = addDays(start, index);
      const dateKey = formatDateKey(date);
      const log = state.logs[dateKey];
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'calendar-day';
      button.dataset.date = dateKey;
      if (date.getMonth() !== month) button.classList.add('outside');
      if (sameDay(date, new Date())) button.classList.add('today');
      if (log?.completed) button.classList.add('complete');
      else if (log && hasActivity(log)) button.classList.add('partial');
      if (isScheduledStrengthDay(date)) button.classList.add('planned');

      const effectiveType = effectiveStrengthType(dateKey, log || getVirtualLog(dateKey));
      button.innerHTML = `<span class="calendar-day-number">${date.getDate()}</span><span class="calendar-day-label">${effectiveType === 'none' ? 'Mobility' : effectiveType}</span>`;
      button.setAttribute('aria-label', `${date.toDateString()}: ${log?.completed ? 'complete' : log && hasActivity(log) ? 'partial' : 'not completed'}`);
      button.addEventListener('click', () => {
        selectedDate = startOfDay(date);
        calendarCursor = new Date(date.getFullYear(), date.getMonth(), 1);
        switchView('today');
        renderToday();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      dom.calendarGrid.appendChild(button);
    }
  }

  function renderProgress() {
    const range = Number(dom.progressRange?.value || 30);
    const end = startOfDay(new Date());
    const dates = [];
    for (let offset = range - 1; offset >= 0; offset -= 1) dates.push(addDays(end, -offset));

    let completedDays = 0;
    let completedStrength = 0;
    let completedDailyExercises = 0;
    let totalDailyExercises = range * PLANS.daily.exercises.length;

    dates.forEach((date) => {
      const key = formatDateKey(date);
      const log = getVirtualLog(key);
      if (log.completed) completedDays += 1;
      completedDailyExercises += countCompleted(log.daily.completed, PLANS.daily.exercises);
      const type = effectiveStrengthType(key, log);
      if (type !== 'none' && allExercisesComplete(log.strength.completed, PLANS[type].exercises)) completedStrength += 1;
    });

    dom.completedDaysStat.textContent = String(completedDays);
    dom.strengthSessionsStat.textContent = String(completedStrength);
    dom.routineRateStat.textContent = `${Math.round((completedDailyExercises / Math.max(1, totalDailyExercises)) * 100)}%`;
    dom.bestStreakStat.textContent = pluralDays(calculateBestStreak());

    renderActivityChart(dates);
    renderHistory(range);
  }

  function renderActivityChart(dates) {
    dom.activityChart.innerHTML = '';
    dates.forEach((date, index) => {
      const key = formatDateKey(date);
      const log = getVirtualLog(key);
      const ratio = dayCompletionRatio(key, log);
      const column = document.createElement('div');
      column.className = `chart-column${log.completed ? ' complete' : ''}`;
      const shouldLabel = dates.length <= 14 || index % Math.ceil(dates.length / 10) === 0 || index === dates.length - 1;
      const label = shouldLabel ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(date) : '';
      column.title = `${date.toDateString()}: ${Math.round(ratio * 100)}%`;
      column.innerHTML = `<div class="chart-bar-wrap"><div class="chart-bar" style="height:${Math.max(2, Math.round(ratio * 100))}%"></div></div><span class="chart-label">${label}</span>`;
      dom.activityChart.appendChild(column);
    });
    dom.activityChart.setAttribute('aria-label', `Workout completion over the last ${dates.length} days`);
  }

  function renderHistory(range) {
    const cutoff = addDays(startOfDay(new Date()), -(range - 1));
    const entries = Object.entries(state.logs)
      .filter(([key, log]) => parseDateKey(key) >= cutoff && hasActivity(log))
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12);

    if (!entries.length) {
      dom.historyList.innerHTML = '<p class="empty-state">No workout entries yet.</p>';
      return;
    }

    dom.historyList.innerHTML = '';
    entries.forEach(([key, log]) => {
      const date = parseDateKey(key);
      const type = effectiveStrengthType(key, log);
      const dailyCount = countCompleted(log.daily.completed, PLANS.daily.exercises);
      const strengthCount = type === 'none' ? 0 : countCompleted(log.strength.completed, PLANS[type].exercises);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'history-item text-button history-button';
      item.innerHTML = `<span><span class="history-date">${new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)}</span><span class="history-meta">${type === 'none' ? 'Mobility only' : `Workout ${type}`} · ${dailyCount} daily${type === 'none' ? '' : ` · ${strengthCount} strength`}</span></span><span>${log.completed ? '✓ Complete' : 'Partial'}</span>`;
      item.addEventListener('click', () => {
        selectedDate = date;
        calendarCursor = new Date(date.getFullYear(), date.getMonth(), 1);
        switchView('today');
        renderToday();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      dom.historyList.appendChild(item);
    });
  }

  function switchView(viewName) {
    currentView = viewName;
    dom.tabButtons.forEach((button) => button.classList.toggle('active', button.dataset.view === viewName));
    dom.views.forEach((view) => view.classList.toggle('active', view.id === `${viewName}View`));
    if (viewName === 'calendar') renderCalendar();
    if (viewName === 'progress') renderProgress();
    if (viewName === 'settings') populateSettings();
  }

  function changeSelectedDay(delta) {
    selectedDate = addDays(selectedDate, delta);
    calendarCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    renderToday();
  }

  function changeMonth(delta) {
    calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + delta, 1);
    renderCalendar();
  }

  function handleStrengthTypeChange() {
    const key = formatDateKey(selectedDate);
    const log = ensureLog(key);
    const previousType = effectiveStrengthType(key, log);
    const newType = dom.strengthTypeSelect.value;
    log.strengthType = newType;
    if (previousType !== newType) log.completed = false;
    touchLog(log);
    persistState();
    renderToday();
    renderCalendar();
    renderProgress();
  }


  function toggleDayComplete() {
    const key = formatDateKey(selectedDate);
    const log = ensureLog(key);
    if (log.completed) {
      log.completed = false;
      touchLog(log);
      persistState();
      showToast('Day reopened.');
    } else if (dayCompletionRatio(key, log) >= 1) {
      log.completed = true;
      log.completedAt = new Date().toISOString();
      touchLog(log);
      persistState();
      showToast('Day marked complete.', 'success');
    }
    renderAll();
  }

  function saveScheduleSettings() {
    const selectedDays = dom.weekdayInputs.filter((input) => input.checked).map((input) => Number(input.value));
    if (!selectedDays.length) {
      showToast('Choose at least one strength day.', 'error');
      return;
    }
    state.settings.strengthDays = selectedDays;
    state.settings.anchorType = dom.anchorTypeSelect.value;
    state.settings.anchorDate = dom.anchorDateInput.value || formatDateKey(new Date());
    state.settings.breakInterval = Number(dom.breakIntervalSelect.value);
    state.settings.updatedAt = new Date().toISOString();
    timerRemainingSeconds = state.settings.breakInterval * 60;
    stopTimer();
    updateTimerDisplay();
    persistState();
    renderAll();
    showToast('Schedule saved.', 'success');
  }

  function populateSettings() {
    if (!dom.weekdayInputs) return;
    dom.weekdayInputs.forEach((input) => { input.checked = state.settings.strengthDays.includes(Number(input.value)); });
    dom.anchorTypeSelect.value = state.settings.anchorType;
    dom.anchorDateInput.value = state.settings.anchorDate;
    dom.breakIntervalSelect.value = String(state.settings.breakInterval);
    updateConnectionUi();
  }

  function toggleTheme() {
    const active = document.documentElement.dataset.theme;
    state.settings.theme = active === 'dark' ? 'light' : 'dark';
    state.settings.updatedAt = new Date().toISOString();
    applyTheme();
    persistState();
  }

  function applyTheme() {
    const preferred = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const theme = state.settings.theme === 'system' ? preferred : state.settings.theme;
    document.documentElement.dataset.theme = theme;
    if (dom.themeToggle) dom.themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function toggleTimer() {
    if (timerRunning) stopTimer();
    else startTimer();
  }

  function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    dom.timerToggle.textContent = 'Pause';
    // Count down against a wall-clock deadline. Background tabs and locked phones
    // throttle setInterval hard, so decrementing once per tick would stretch a
    // 45 minute break into something much longer.
    const deadline = Date.now() + timerRemainingSeconds * 1000;
    timerIntervalId = window.setInterval(() => {
      timerRemainingSeconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      if (timerRemainingSeconds <= 0) {
        stopTimer();
        timerRemainingSeconds = state.settings.breakInterval * 60;
        updateTimerDisplay();
        showToast('Movement break: stand up and move for 2–3 minutes.', 'success', 7000);
        playTimerTone();
        return;
      }
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    timerRunning = false;
    if (timerIntervalId) window.clearInterval(timerIntervalId);
    timerIntervalId = null;
    if (dom.timerToggle) dom.timerToggle.textContent = 'Start';
  }

  function resetTimer() {
    stopTimer();
    timerRemainingSeconds = state.settings.breakInterval * 60;
    updateTimerDisplay();
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timerRemainingSeconds / 60);
    const seconds = timerRemainingSeconds % 60;
    dom.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  function playTimerTone() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const context = new AudioContext();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.45);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.5);
    } catch (error) {
      console.debug('Timer tone unavailable', error);
    }
  }

  function formatDuration(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  function toggleExerciseTimer(timerKey, exercise, dateKey, section, button) {
    if (exerciseTimers.has(timerKey)) {
      stopExerciseTimer(timerKey);
      return;
    }
    const timer = {
      key: timerKey,
      exercise,
      dateKey,
      section,
      button,
      remaining: exercise.seconds,
      deadline: Date.now() + exercise.seconds * 1000,
      intervalId: null
    };
    exerciseTimers.set(timerKey, timer);
    button.classList.add('running');
    paintExerciseTimer(timer);
    timer.intervalId = window.setInterval(() => {
      timer.remaining = Math.max(0, Math.ceil((timer.deadline - Date.now()) / 1000));
      if (timer.remaining <= 0) {
        finishExerciseTimer(timer);
        return;
      }
      paintExerciseTimer(timer);
    }, 250);
  }

  function paintExerciseTimer(timer) {
    if (timer.button) timer.button.textContent = `■ ${formatDuration(timer.remaining)}`;
  }

  function stopExerciseTimer(timerKey) {
    const timer = exerciseTimers.get(timerKey);
    if (!timer) return;
    window.clearInterval(timer.intervalId);
    exerciseTimers.delete(timerKey);
    if (timer.button) {
      timer.button.classList.remove('running');
      timer.button.textContent = `▶ ${formatDuration(timer.exercise.seconds)}`;
    }
  }

  function finishExerciseTimer(timer) {
    stopExerciseTimer(timer.key);
    playTimerTone();
    setExerciseCompleted(timer.dateKey, timer.section, timer.exercise.id, true);
    showToast(`${timer.exercise.name}: time is up.`, 'success');
  }

  function setExerciseCompleted(dateKey, section, exerciseId, completed) {
    const log = ensureLog(dateKey);
    log[section].completed[exerciseId] = completed;
    if (!completed) log.completed = false;
    touchLog(log);
    persistState();
    renderToday();
    renderCalendar();
    renderProgress();
  }

  async function startWarmupRun() {
    if (warmupRun.active) return;
    warmupRun.active = true;
    warmupRun.index = 0;
    warmupRun.paused = false;
    dom.warmupRunPanel.classList.remove('hidden');
    dom.runWarmupButton.classList.add('hidden');
    dom.warmupRunPause.textContent = 'Pause';
    await requestWakeLock();
    beginWarmupStep();
  }

  function beginWarmupStep() {
    const exercise = PLANS.warmup.exercises[warmupRun.index];
    if (!exercise) {
      stopWarmupRun('Warm-up complete.');
      return;
    }
    warmupRun.remaining = exercise.seconds;
    warmupRun.deadline = Date.now() + exercise.seconds * 1000;
    paintWarmupRun();
    window.clearInterval(warmupRun.intervalId);
    warmupRun.intervalId = window.setInterval(() => {
      if (warmupRun.paused) return;
      warmupRun.remaining = Math.max(0, Math.ceil((warmupRun.deadline - Date.now()) / 1000));
      if (warmupRun.remaining <= 0) {
        advanceWarmupRun(true);
        return;
      }
      paintWarmupRun();
    }, 250);
  }

  function advanceWarmupRun(completed) {
    if (!warmupRun.active) return;
    const exercise = PLANS.warmup.exercises[warmupRun.index];
    window.clearInterval(warmupRun.intervalId);
    warmupRun.intervalId = null;
    if (completed && exercise) {
      playTimerTone();
      setExerciseCompleted(formatDateKey(selectedDate), 'warmup', exercise.id, true);
    }
    warmupRun.index += 1;
    if (warmupRun.index >= PLANS.warmup.exercises.length) {
      stopWarmupRun(completed ? 'Warm-up complete. Ready for the main workout.' : 'Warm-up finished.');
      return;
    }
    beginWarmupStep();
  }

  function toggleWarmupRunPause() {
    if (!warmupRun.active) return;
    if (warmupRun.paused) {
      warmupRun.paused = false;
      warmupRun.deadline = Date.now() + warmupRun.remaining * 1000;
      dom.warmupRunPause.textContent = 'Pause';
    } else {
      warmupRun.paused = true;
      dom.warmupRunPause.textContent = 'Resume';
    }
    paintWarmupRun();
  }

  function stopWarmupRun(message) {
    window.clearInterval(warmupRun.intervalId);
    warmupRun.intervalId = null;
    warmupRun.active = false;
    warmupRun.paused = false;
    dom.warmupRunPanel.classList.add('hidden');
    dom.runWarmupButton.classList.remove('hidden');
    dom.warmupRunPause.textContent = 'Pause';
    releaseWakeLock();
    if (message) showToast(message, 'success', 5000);
  }

  function paintWarmupRun() {
    const exercise = PLANS.warmup.exercises[warmupRun.index];
    if (!exercise) return;
    const position = `Exercise ${warmupRun.index + 1} of ${PLANS.warmup.exercises.length}`;
    dom.warmupRunStep.textContent = warmupRun.paused ? `${position} · paused` : position;
    dom.warmupRunName.textContent = exercise.name;
    dom.warmupRunCue.textContent = exercise.cue;
    dom.warmupRunRemaining.textContent = formatDuration(warmupRun.remaining);
  }

  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    } catch (error) {
      console.debug('Screen wake lock unavailable', error);
    }
  }

  function releaseWakeLock() {
    try {
      wakeLock?.release();
    } catch (error) {
      console.debug('Could not release the wake lock', error);
    }
    wakeLock = null;
  }

  function getVirtualLog(dateKey) {
    return normalizeLog(state.logs[dateKey] || {
      date: dateKey,
      strengthType: null,
      daily: { completed: {}, actual: {} },
      warmup: { completed: {}, actual: {} },
      strength: { completed: {}, actual: {} },
      notes: '',
      completed: false,
      updatedAt: null
    }, dateKey);
  }

  function ensureLog(dateKey) {
    if (!state.logs[dateKey]) state.logs[dateKey] = getVirtualLog(dateKey);
    return state.logs[dateKey];
  }

  function normalizeLog(log, dateKey) {
    return {
      date: dateKey,
      strengthType: ['A', 'B', 'none'].includes(log.strengthType) ? log.strengthType : null,
      daily: {
        completed: { ...(log.daily?.completed || {}) },
        actual: { ...(log.daily?.actual || {}) }
      },
      warmup: {
        completed: { ...(log.warmup?.completed || {}) },
        actual: { ...(log.warmup?.actual || {}) }
      },
      strength: {
        completed: { ...(log.strength?.completed || {}) },
        actual: { ...(log.strength?.actual || {}) }
      },
      notes: typeof log.notes === 'string' ? log.notes : '',
      completed: Boolean(log.completed),
      completedAt: log.completedAt || null,
      updatedAt: log.updatedAt || null
    };
  }

  function touchLog(log) {
    log.updatedAt = new Date().toISOString();
  }

  function effectiveStrengthType(dateKey, log) {
    if (['A', 'B', 'none'].includes(log?.strengthType)) return log.strengthType;
    return recommendedStrengthType(parseDateKey(dateKey));
  }

  function recommendedStrengthType(date) {
    if (!isScheduledStrengthDay(date)) return 'none';
    const index = scheduledSessionIndex(date);
    const anchorIsA = state.settings.anchorType === 'A';
    const even = Math.abs(index % 2) === 0;
    if (even) return anchorIsA ? 'A' : 'B';
    return anchorIsA ? 'B' : 'A';
  }

  function scheduledSessionIndex(date) {
    const target = startOfDay(date);
    const anchor = parseDateKey(state.settings.anchorDate);
    if (target >= anchor) {
      let index = 0;
      for (let cursor = startOfDay(anchor); cursor < target; cursor = addDays(cursor, 1)) {
        if (isScheduledStrengthDay(cursor)) index += 1;
      }
      return index;
    }
    let index = 0;
    for (let cursor = addDays(anchor, -1); cursor >= target; cursor = addDays(cursor, -1)) {
      if (isScheduledStrengthDay(cursor)) index -= 1;
    }
    return index;
  }

  function isScheduledStrengthDay(date) {
    return state.settings.strengthDays.includes(date.getDay());
  }

  // The warm-up only counts toward the day on strength days; on rest days it stays
  // visible but optional, so it can never block a 100% day.
  function dayCompletionRatio(dateKey, log = getVirtualLog(dateKey)) {
    const type = effectiveStrengthType(dateKey, log);
    let total = PLANS.daily.exercises.length;
    let done = countCompleted(log.daily.completed, PLANS.daily.exercises);
    if (type !== 'none') {
      total += PLANS.warmup.exercises.length + PLANS[type].exercises.length;
      done += countCompleted(log.warmup.completed, PLANS.warmup.exercises)
        + countCompleted(log.strength.completed, PLANS[type].exercises);
    }
    return total ? done / total : 0;
  }

  function countCompleted(completedMap, exercises) {
    return exercises.reduce((sum, exercise) => sum + (completedMap?.[exercise.id] ? 1 : 0), 0);
  }

  function allExercisesComplete(completedMap, exercises) {
    return exercises.every((exercise) => Boolean(completedMap?.[exercise.id]));
  }

  function hasActivity(log) {
    return Boolean(
      log.completed
      || log.notes
      || Object.values(log.daily?.completed || {}).some(Boolean)
      || Object.values(log.warmup?.completed || {}).some(Boolean)
      || Object.values(log.strength?.completed || {}).some(Boolean)
      || Object.keys(log.daily?.actual || {}).length
      || Object.keys(log.warmup?.actual || {}).length
      || Object.keys(log.strength?.actual || {}).length
    );
  }

  function calculateCurrentStreak() {
    let cursor = startOfDay(new Date());
    const todayKey = formatDateKey(cursor);
    if (!state.logs[todayKey]?.completed) cursor = addDays(cursor, -1);
    let streak = 0;
    while (state.logs[formatDateKey(cursor)]?.completed) {
      streak += 1;
      cursor = addDays(cursor, -1);
    }
    return streak;
  }

  function calculateBestStreak() {
    const completedKeys = Object.entries(state.logs)
      .filter(([, log]) => log.completed)
      .map(([key]) => key)
      .sort();
    if (!completedKeys.length) return 0;
    let best = 1;
    let current = 1;
    for (let index = 1; index < completedKeys.length; index += 1) {
      const previous = parseDateKey(completedKeys[index - 1]);
      const next = parseDateKey(completedKeys[index]);
      if (Math.round((next - previous) / DAY_MS) === 1) current += 1;
      else current = 1;
      best = Math.max(best, current);
    }
    return best;
  }

  function loadState() {
    const defaults = defaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      const logs = {};
      Object.entries(parsed.logs || {}).forEach(([key, log]) => { logs[key] = normalizeImportedLog(log, key); });
      return {
        version: APP_VERSION,
        logs,
        settings: {
          ...defaults.settings,
          ...(parsed.settings || {}),
          strengthDays: Array.isArray(parsed.settings?.strengthDays) ? parsed.settings.strengthDays.map(Number) : defaults.settings.strengthDays
        }
      };
    } catch (error) {
      console.error('Could not load local state', error);
      return defaults;
    }
  }

  // Moves version-1 warm-up check marks out of the strength section into their own.
  // Safe to run on any log: version-2 payloads simply have no legacy ids left to move,
  // which is why every import path (local, backup file, cloud row) can share it.
  function migrateWarmupSection(log) {
    Object.entries(LEGACY_WARMUP_IDS).forEach(([legacyId, warmupId]) => {
      if (log.strength.completed[legacyId]) log.warmup.completed[warmupId] = true;
      if (log.strength.actual[legacyId]) log.warmup.actual[warmupId] = log.strength.actual[legacyId];
      delete log.strength.completed[legacyId];
      delete log.strength.actual[legacyId];
    });
    return log;
  }

  function normalizeImportedLog(log, key) {
    return migrateWarmupSection({
      date: key,
      strengthType: ['A', 'B', 'none'].includes(log?.strengthType) ? log.strengthType : null,
      daily: { completed: { ...(log?.daily?.completed || {}) }, actual: { ...(log?.daily?.actual || {}) } },
      warmup: { completed: { ...(log?.warmup?.completed || {}) }, actual: { ...(log?.warmup?.actual || {}) } },
      strength: { completed: { ...(log?.strength?.completed || {}) }, actual: { ...(log?.strength?.actual || {}) } },
      notes: typeof log?.notes === 'string' ? log.notes : '',
      completed: Boolean(log?.completed),
      completedAt: log?.completedAt || null,
      updatedAt: log?.updatedAt || new Date(0).toISOString()
    });
  }

  function defaultState() {
    return {
      version: APP_VERSION,
      logs: {},
      settings: {
        strengthDays: [1, 3, 6],
        anchorType: 'A',
        anchorDate: '2026-07-27',
        breakInterval: 45,
        theme: 'system',
        updatedAt: new Date().toISOString()
      }
    };
  }

  function persistState(options = {}) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!options.skipCloud) scheduleCloudSave();
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `posture-strength-backup-${formatDateKey(new Date())}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast('Backup exported.', 'success');
  }

  async function importData(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!imported || typeof imported !== 'object' || !imported.logs || !imported.settings) throw new Error('Invalid tracker backup');
      const nextLogs = {};
      Object.entries(imported.logs).forEach(([key, log]) => { nextLogs[key] = normalizeImportedLog(log, key); });
      state = {
        version: APP_VERSION,
        logs: nextLogs,
        settings: { ...defaultState().settings, ...imported.settings, updatedAt: new Date().toISOString() }
      };
      persistState();
      timerRemainingSeconds = state.settings.breakInterval * 60;
      populateSettings();
      applyTheme();
      renderAll();
      showToast('Backup imported.', 'success');
    } catch (error) {
      showToast(`Import failed: ${error.message}`, 'error');
    }
  }

  async function resetAllData() {
    const confirmed = window.confirm('Delete all workout history and restore the default schedule? This cannot be undone unless you exported a backup.');
    if (!confirmed) return;

    if (supabaseClient && authUser) {
      try {
        const [logsDelete, settingsDelete] = await Promise.all([
          supabaseClient.from('workout_logs').delete().eq('user_id', authUser.id),
          supabaseClient.from('tracker_settings').delete().eq('user_id', authUser.id)
        ]);
        if (logsDelete.error) throw logsDelete.error;
        if (settingsDelete.error) throw settingsDelete.error;
      } catch (error) {
        showToast(`Cloud data could not be reset: ${error.message}`, 'error');
        return;
      }
    }

    state = defaultState();
    persistState({ skipCloud: true });
    selectedDate = startOfDay(new Date());
    calendarCursor = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    timerRemainingSeconds = state.settings.breakInterval * 60;
    resetTimer();
    populateSettings();
    applyTheme();
    renderAll();
    if (supabaseClient && authUser) scheduleCloudSave();
    showToast('All workout data was reset.', 'success');
  }

  function hasSupabaseConfig() {
    const config = window.APP_CONFIG || {};
    return typeof config.SUPABASE_URL === 'string'
      && config.SUPABASE_URL.startsWith('https://')
      && typeof config.SUPABASE_PUBLISHABLE_KEY === 'string'
      && config.SUPABASE_PUBLISHABLE_KEY.length > 20;
  }

  function isSupabaseConfigured() {
    return hasSupabaseConfig() && Boolean(window.supabase?.createClient);
  }

  function loadSupabaseLibrary() {
    if (window.supabase?.createClient) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const existing = document.getElementById('supabaseLibrary');
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error('Could not load the Supabase JavaScript library')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.id = 'supabaseLibrary';
      script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      script.async = true;
      const timeoutId = window.setTimeout(() => {
        script.remove();
        reject(new Error('Supabase library loading timed out'));
      }, 10000);
      script.addEventListener('load', () => { window.clearTimeout(timeoutId); resolve(); }, { once: true });
      script.addEventListener('error', () => { window.clearTimeout(timeoutId); reject(new Error('Could not load the Supabase JavaScript library')); }, { once: true });
      document.head.appendChild(script);
    });
  }

  async function initSupabase() {
    if (!hasSupabaseConfig()) {
      updateConnectionUi();
      return;
    }
    try {
      await loadSupabaseLibrary();
      const config = window.APP_CONFIG;
      supabaseClient = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      const { data, error } = await supabaseClient.auth.getSession();
      if (error) throw error;
      authUser = data.session?.user || null;
      updateConnectionUi();
      updateAuthGateVisibility();
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        authUser = session?.user || null;
        updateConnectionUi();
        updateAuthGateVisibility();
        if (authUser) window.setTimeout(() => syncWithCloud(false), 0);
      });
      if (authUser) await syncWithCloud(false);
    } catch (error) {
      console.error('Supabase initialization failed', error);
      showToast(`Cloud setup error: ${error.message}`, 'error');
      supabaseClient = null;
      authUser = null;
      updateConnectionUi();
    }
  }

  async function sendMagicLink(rawEmail) {
    if (!requireSupabase()) return;
    const email = String(rawEmail || '').trim();
    if (!email) {
      reportAuthProblem('Enter your email address first.');
      return;
    }
    dom.magicLinkButton.disabled = true;
    dom.gateMagicLink.disabled = true;
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}`;
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) throw error;
      showToast('Sign-in link sent. Check your email, then set a new PIN in Settings.', 'success', 8000);
    } catch (error) {
      reportAuthProblem(`Could not send the link: ${error.message}`);
    } finally {
      dom.magicLinkButton.disabled = false;
      dom.gateMagicLink.disabled = false;
    }
  }

  function requireSupabase() {
    if (supabaseClient) return true;
    reportAuthProblem('Cloud sync is not configured, so there is nothing to sign in to.');
    return false;
  }

  // Supabase treats the PIN as an ordinary password, and its default minimum is 6.
  function validatePin(rawPin) {
    const pin = String(rawPin || '').trim();
    if (!/^\d+$/.test(pin)) return { error: 'The PIN must contain digits only.' };
    if (pin.length < MIN_PIN_LENGTH) return { error: `Use at least ${MIN_PIN_LENGTH} digits.` };
    return { pin };
  }

  async function signInWithPin(rawEmail, rawPin) {
    if (!requireSupabase()) return;
    const email = String(rawEmail || '').trim();
    const { pin, error: pinError } = validatePin(rawPin);
    if (!email) return reportAuthProblem('Enter your email address.');
    if (pinError) return reportAuthProblem(pinError);

    setAuthBusy(true);
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password: pin });
      if (error) throw error;
      clearPinInputs();
      hideAuthGate();
      showToast('Signed in. Your history is syncing.', 'success');
    } catch (error) {
      reportAuthProblem(`Could not sign in: ${error.message}`);
    } finally {
      setAuthBusy(false);
    }
  }

  async function registerWithPin(rawEmail, rawPin) {
    if (!requireSupabase()) return;
    const email = String(rawEmail || '').trim();
    const { pin, error: pinError } = validatePin(rawPin);
    if (!email) return reportAuthProblem('Enter your email address.');
    if (pinError) return reportAuthProblem(pinError);

    setAuthBusy(true);
    try {
      const { data, error } = await supabaseClient.auth.signUp({ email, password: pin });
      if (error) throw error;
      if (data.session) {
        clearPinInputs();
        hideAuthGate();
        showToast('Account created. Remember this PIN — it is the only way back in.', 'success', 8000);
        return;
      }
      // No session means either email confirmation is still switched on, or the
      // address already exists — Supabase hides which, to prevent enumeration.
      reportAuthProblem('No session was returned. If you already have an account, use Sign in. Otherwise confirm the email Supabase just sent, or switch off "Confirm email" in the Supabase dashboard.');
    } catch (error) {
      reportAuthProblem(`Could not create the account: ${error.message}`);
    } finally {
      setAuthBusy(false);
    }
  }

  async function changePin() {
    if (!requireSupabase() || !authUser) return;
    const { pin, error: pinError } = validatePin(dom.newPinInput.value);
    if (pinError) return reportAuthProblem(pinError);

    dom.changePinButton.disabled = true;
    try {
      const { error } = await supabaseClient.auth.updateUser({ password: pin });
      if (error) throw error;
      dom.newPinInput.value = '';
      showToast('PIN changed.', 'success');
    } catch (error) {
      reportAuthProblem(`Could not change the PIN: ${error.message}`);
    } finally {
      dom.changePinButton.disabled = false;
    }
  }

  async function lockApp() {
    await signOut();
    gateDismissed = false;
    showAuthGate();
  }

  function setAuthBusy(busy) {
    [dom.gateSubmit, dom.pinSignInButton, dom.pinRegisterButton].forEach((button) => {
      button.disabled = busy;
    });
  }

  function clearPinInputs() {
    dom.gatePin.value = '';
    dom.gatePinConfirm.value = '';
    dom.authPin.value = '';
  }

  // Errors surface inside the gate when it is open, and as a toast otherwise.
  function reportAuthProblem(message) {
    if (!dom.authGate.classList.contains('hidden')) {
      dom.gateError.textContent = message;
      dom.gateError.classList.remove('hidden');
      return;
    }
    showToast(message, 'error', 7000);
  }

  function setGateMode(mode) {
    gateMode = mode;
    const registering = mode === 'register';
    dom.authModeSignIn.classList.toggle('active', !registering);
    dom.authModeRegister.classList.toggle('active', registering);
    dom.authModeSignIn.setAttribute('aria-selected', String(!registering));
    dom.authModeRegister.setAttribute('aria-selected', String(registering));
    dom.gatePinConfirmField.classList.toggle('hidden', !registering);
    dom.gateSubmit.textContent = registering ? 'Create account' : 'Unlock';
    dom.authGateTitle.textContent = registering ? 'Create your account' : 'Unlock your tracker';
    dom.authGateSubtitle.textContent = registering
      ? 'Pick an email and a PIN of at least six digits. The PIN is the only way back to your history, so store it somewhere safe.'
      : 'Enter your email and PIN to load your history on this device.';
    dom.gateError.classList.add('hidden');
  }

  function handleGateSubmit(event) {
    event.preventDefault();
    dom.gateError.classList.add('hidden');
    const email = dom.gateEmail.value;
    const pin = dom.gatePin.value;
    if (gateMode === 'register') {
      if (pin !== dom.gatePinConfirm.value) {
        reportAuthProblem('The two PINs do not match.');
        return;
      }
      registerWithPin(email, pin);
      return;
    }
    signInWithPin(email, pin);
  }

  function showAuthGate() {
    dom.authGate.classList.remove('hidden');
    dom.gateError.classList.add('hidden');
    setGateMode(gateMode);
    dom.gateEmail.focus();
  }

  function hideAuthGate() {
    dom.authGate.classList.add('hidden');
  }

  // The gate is a front door, not a vault: it guards the cloud history behind a
  // real Supabase session, while local-only data stays readable on this device.
  function updateAuthGateVisibility() {
    if (!hasSupabaseConfig() || authUser || gateDismissed) {
      hideAuthGate();
      return;
    }
    showAuthGate();
  }

  async function signOut() {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.auth.signOut();
    if (error) showToast(`Sign-out failed: ${error.message}`, 'error');
    else {
      authUser = null;
      // Signing out is deliberate, so do not immediately pop the gate back up;
      // lockApp() re-arms it when the user actually asked to lock.
      gateDismissed = true;
      updateConnectionUi();
      showToast('Signed out. Local data remains on this device.', 'success');
    }
  }

  function scheduleCloudSave() {
    if (!supabaseClient || !authUser || syncing) return;
    window.clearTimeout(cloudSaveTimer);
    cloudSaveTimer = window.setTimeout(() => syncWithCloud(false), 1000);
  }

  async function syncWithCloud(showSuccessMessage = false) {
    if (!supabaseClient || !authUser || syncing) return;
    syncing = true;
    updateConnectionUi('syncing');
    try {
      const [logsResult, settingsResult] = await Promise.all([
        supabaseClient.from('workout_logs').select('workout_date,payload,updated_at').order('workout_date'),
        supabaseClient.from('tracker_settings').select('payload,updated_at').maybeSingle()
      ]);
      if (logsResult.error) throw logsResult.error;
      if (settingsResult.error) throw settingsResult.error;

      (logsResult.data || []).forEach((row) => {
        const key = row.workout_date;
        const remote = normalizeImportedLog(row.payload, key);
        const remoteUpdated = new Date(remote.updatedAt || row.updated_at || 0).getTime();
        const localUpdated = new Date(state.logs[key]?.updatedAt || 0).getTime();
        if (!state.logs[key] || remoteUpdated > localUpdated) state.logs[key] = remote;
      });

      if (settingsResult.data?.payload) {
        const remoteSettings = settingsResult.data.payload;
        const remoteUpdated = new Date(remoteSettings.updatedAt || settingsResult.data.updated_at || 0).getTime();
        const localUpdated = new Date(state.settings.updatedAt || 0).getTime();
        if (remoteUpdated > localUpdated) state.settings = { ...defaultState().settings, ...remoteSettings };
      }

      persistState({ skipCloud: true });

      const activeLogRows = Object.entries(state.logs)
        .filter(([, log]) => hasActivity(log))
        .map(([workout_date, payload]) => ({ user_id: authUser.id, workout_date, payload }));

      if (activeLogRows.length) {
        const { error } = await supabaseClient.from('workout_logs').upsert(activeLogRows, { onConflict: 'user_id,workout_date' });
        if (error) throw error;
      }

      const { error: settingsError } = await supabaseClient.from('tracker_settings').upsert({
        user_id: authUser.id,
        payload: state.settings
      }, { onConflict: 'user_id' });
      if (settingsError) throw settingsError;

      populateSettings();
      applyTheme();
      renderAll();
      updateConnectionUi('synced');
      if (showSuccessMessage) showToast('Cloud sync complete.', 'success');
    } catch (error) {
      console.error('Cloud sync failed', error);
      updateConnectionUi('error');
      showToast(`Cloud sync failed: ${error.message}`, 'error');
    } finally {
      syncing = false;
    }
  }

  function updateConnectionUi(forcedStatus) {
    if (!dom.connectionBadge) return;
    const configured = hasSupabaseConfig();
    dom.signedOutControls.classList.toggle('hidden', !configured || Boolean(authUser));
    dom.signedInControls.classList.toggle('hidden', !configured || !authUser);

    if (!configured) {
      setBadge(dom.connectionBadge, 'Local', '');
      setBadge(dom.cloudStatusBadge, 'Not configured', '');
      dom.cloudDescription.textContent = 'The app currently stores all progress only in this browser. Add Supabase values to config.js to enable PIN sign-in and cross-device sync.';
      return;
    }

    if (forcedStatus === 'syncing') {
      setBadge(dom.connectionBadge, 'Syncing…', 'warning');
      setBadge(dom.cloudStatusBadge, 'Syncing…', 'warning');
      return;
    }
    if (forcedStatus === 'error') {
      setBadge(dom.connectionBadge, 'Sync error', 'warning');
      setBadge(dom.cloudStatusBadge, 'Sync error', 'warning');
      return;
    }

    if (authUser) {
      setBadge(dom.connectionBadge, 'Cloud', 'success');
      setBadge(dom.cloudStatusBadge, 'Connected', 'success');
      dom.cloudDescription.textContent = 'Progress is stored locally and synchronised with your private Supabase account.';
      dom.signedInEmail.textContent = authUser.email || 'Signed-in user';
    } else {
      setBadge(dom.connectionBadge, 'Local', '');
      setBadge(dom.cloudStatusBadge, 'Ready to sign in', 'warning');
      dom.cloudDescription.textContent = 'Sign in with your email and PIN to synchronise progress between devices. Local tracking works without an account.';
    }
  }

  function setBadge(element, text, modifier) {
    element.textContent = text;
    element.className = `status-badge${modifier ? ` ${modifier}` : ''}`;
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || window.location.protocol === 'file:') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' }).catch((error) => console.debug('Service worker unavailable', error));
    });
  }

  function showToast(message, type = '', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast${type ? ` ${type}` : ''}`;
    toast.textContent = message;
    dom.toastRegion.appendChild(toast);
    window.setTimeout(() => toast.remove(), duration);
  }

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseDateKey(key) {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
  }

  function addDays(date, amount) {
    const result = startOfDay(date);
    result.setDate(result.getDate() + amount);
    return result;
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function relativeDateLabel(date) {
    const difference = Math.round((startOfDay(date) - startOfDay(new Date())) / DAY_MS);
    if (difference === 0) return 'Today';
    if (difference === -1) return 'Yesterday';
    if (difference === 1) return 'Tomorrow';
    return difference < 0 ? `${Math.abs(difference)} days ago` : `In ${difference} days`;
  }

  function pluralDays(value) {
    return `${value} ${value === 1 ? 'day' : 'days'}`;
  }

  function debounce(fn, wait) {
    let timeoutId;
    return (...args) => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => fn(...args), wait);
    };
  }
})();
