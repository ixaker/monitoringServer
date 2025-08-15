// require('dotenv').config();
// const { NodeSSH } = require('node-ssh');
import dotenv from 'dotenv';
dotenv.config();
const { NodeSSH } = await import('node-ssh');

const API_NODE_BASE = 'https://adm.tools/action/hosting/account/nodejs';
const API_VIRTUAL_LIST = 'https://adm.tools/action/hosting/virtual/list/';

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Не задана переменная окружения ${name}`);
  return v;
}

async function postForm(
  url,
  { headers = {}, body = {}, timeoutMs = 15000 } = {},
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers,
      },
      body: new URLSearchParams(
        Object.entries(body).map(([k, v]) => [k, String(v)]),
      ),
      signal: controller.signal,
    });

    const text = await res.text();
    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Ответ не JSON: ${text.slice(0, 500)}`);
    }

    if (!res.ok) {
      throw new Error(
        `${url} -> HTTP ${res.status}: ${JSON.stringify(json).slice(0, 500)}`,
      );
    }
    return json;
  } finally {
    clearTimeout(timer);
  }
}

let _cachedHostData = null;

async function resolveHostData() {
  if (_cachedHostData) return _cachedHostData;

  const token = requireEnv('DEPLOY_ADM_TOOLS_TOKEN');
  const accountId = requireEnv('DEPLOY_ACCOUNT_ID');
  const domain = requireEnv('DEPLOY_DOMAIN');
  const hostName = process.env.DEPLOY_HOST_NAME || 'www';

  const json = await postForm(API_VIRTUAL_LIST, {
    headers: { Authorization: `Bearer ${token}` },
    body: { account_id: accountId },
  });

  if (!json?.result) {
    throw new Error(
      `virtual/list вернул result=false: ${JSON.stringify(json).slice(0, 500)}`,
    );
  }

  const entry = json?.response?.list?.[domain];
  if (!entry) {
    const keys = Object.keys(json?.response?.list || {});
    throw new Error(
      `Домен "${domain}" не найден. Доступные: ${keys.join(', ')}`,
    );
  }

  let hostEntry =
    entry.hosts?.[hostName] ||
    Object.values(entry.hosts || {}).find(
      (h) => h.web_server_backend === 'nodejs' && h.archived === '0',
    ) ||
    Object.values(entry.hosts || {}).find((h) => h.archived === '0') ||
    Object.values(entry.hosts || {})[0];

  if (!hostEntry)
    throw new Error(`Для домена "${domain}" нет подходящих hosts`);

  const hostData = {
    hostId: Number(hostEntry.host_id),
    homedir: hostEntry.homedir,
    fqdn: hostEntry.fqdn,
    domain: hostEntry.domain,
    backend: hostEntry.web_server_backend,
  };

  _cachedHostData = hostData;

  console.log(hostData);

  return hostData;
}

async function apiRequest(action, { token, hostId }) {
  if (!['stop', 'reload'].includes(action)) {
    throw new Error(
      `Недопустимое действие "${action}". Разрешено: stop | reload`,
    );
  }
  const url = `${API_NODE_BASE}/${action}/`;
  return postForm(url, {
    headers: { Authorization: `Bearer ${token}` },
    body: { host_id: hostId },
  });
}

export async function stopApp() {
  const token = requireEnv('DEPLOY_ADM_TOOLS_TOKEN');
  const { hostId, homedir, fqdn, domain } = await resolveHostData();
  console.log(`⏹  Остановка приложения`);
  const r = await apiRequest('stop', { token, hostId });
  console.log('✅ stop:', r);
  return { ...r, hostId, homedir, fqdn, domain };
}

export async function reloadApp() {
  const token = requireEnv('DEPLOY_ADM_TOOLS_TOKEN');
  const { hostId, homedir, fqdn, domain } = await resolveHostData();
  console.log(`🔁 Перезапуск приложения`);
  const r = await apiRequest('reload', { token, hostId });
  console.log('✅ reload:', r);
  return { ...r, hostId, homedir, fqdn, domain };
}

// ===== SSH-часть на node-ssh =====
function requireSshEnv() {
  const host = requireEnv('DEPLOY_SSH_HOST');
  const user = requireEnv('DEPLOY_SSH_USER');
  const pass = requireEnv('DEPLOY_SSH_PASS');
  const port = process.env.DEPLOY_SSH_PORT || '22';
  return { host, user, pass, port };
}

// Безопасное включение строки в bash-скрипт (single-quote escaping)
function shq(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

function buildDeployScript(homedir) {
  const repoUrl = process.env.DEPLOY_GIT_REPO || '';
  return `
set -e
cd ${shq(homedir)}
echo "📂 Текущая директория: $(pwd)"

if [ ! -d ".git" ]; then
  echo "🔍 .git не найден"
  git clone ${shq(repoUrl)} .
else
  echo "✅ Репозиторий уже инициализирован"
  git pull origin main
fi

echo "Установка зависимостей..."
npm install

echo "Сборка проекта..."
npm run build

echo "📦 Обновление проекта из Git..."
`;
}

export async function deployViaSSH() {
  const { homedir } = await resolveHostData();
  const { host, user, pass, port } = requireSshEnv();
  const ssh = new NodeSSH();

  console.log(`🖧 Подключение к ${user}@${host}:${port}`);

  await ssh.connect({
    host,
    username: user,
    port: Number(port),
    password: pass,
  });

  console.log(`📜 Запуск деплоя в ${homedir}`);
  const script = buildDeployScript(homedir);

  const result = await ssh.execCommand(script, { cwd: '/' });

  if (result.stdout) process.stdout.write(result.stdout + '\n');
  if (result.stderr) process.stderr.write(result.stderr + '\n');

  ssh.dispose();
}

// module.exports = {
//   stopApp,
//   reloadApp,
//   deployViaSSH,
// };
