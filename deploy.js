import { stopApp, reloadApp, deployViaSSH } from './api.deploy.js';

(async () => {
  try {
    console.log('Начало деплоя');
    await stopApp();
    await deployViaSSH();
    await reloadApp();
    console.log('🎉 Деплой завершён!');
  } catch (err) {
    console.error('💥 Ошибка деплоя:', err);
    process.exit(1);
  }
})();
