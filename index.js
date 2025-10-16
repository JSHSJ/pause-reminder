// @ts-check
"use strict";

import notifier from 'node-notifier';
import cron from 'node-cron';
import config from 'config';
import cronstrue from 'cronstrue';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const icon = path.join(__dirname, 'break.png');

const reminders = config.get('reminders');
const useSound = config.get('useSound');

function sendNotification(title, message) {
  notifier.notify({
      title,
      message,
      icon,
      timeout: 10,
      sound: useSound ?? false
  });
}

if (!Array.isArray(reminders) || reminders.length === 0) {
  console.error('No reminders configured. Please check your configuration.');
  process.exit(1);
}

reminders.forEach(({ cron: cronTime, title, message }) => {
  const isValid = cron.validate(cronTime);
  const description = isValid
    ? cronstrue.toString(cronTime)
    : 'Invalid cron expression!';

  if (isValid) {
    console.log(
      `Reminder configured for "${title}": ${description}`
    );
    cron.schedule(cronTime, () => {
      notifier.notify({ title, message });
    });
  } else {
    console.warn(
      `Invalid cron for reminder "${title}": "${cronTime}"`
    );
  }
});

console.log('Pause reminder running...');
