const mineflayer = require('mineflayer');

const accounts = [
  { username: 'talhapro1098', password: 'likese11' },
  { username: 'talha1099', password: 'likese11' },
  { username: 'talha2099', password: 'likese11' },
  { username: 'talha3099', password: 'likese11' },
  { username: 'talha4099', password: 'likese11' },
];

const messageCounts = {};
let botIndex = 0;

function createBot(account) {
  const bot = mineflayer.createBot({
    host: 'play.applemc.fun',
    port: 25565,
    username: account.username,
    version: '1.21.3',
  });

  messageCounts[account.username] = 0;

  bot.on('login', () => {
    console.log(`✅ ${account.username} logged in!`);
    setTimeout(() => {
      bot.chat(`/login ${account.password}`);
      console.log(`🔑 ${account.username} sent /login`);
    }, 3000);
  });

  bot.on('spawn', () => {
    console.log(`🎮 ${account.username} spawned. Moving...`);
    setTimeout(() => openRealm(bot, account.username, 1), 5000);
  });

  bot.on('chat', (username, message) => {
    if (username !== account.username) {
      messageCounts[account.username]++;
      printMessageCounts();
    }
  });

  bot.on('end', () => {
    console.log(`🔄 ${account.username} disconnected. Reconnecting...`);
    setTimeout(() => createBot(account), 10000);
  });

  bot.on('error', (err) => {
    console.log(`❌ ${account.username} Error: ${err.message}`);
  });
}

async function openRealm(bot, username, attempt) {
  if (attempt > 20) {
    console.log(`❌ ${username} Failed to open realm. Restarting...`);
    bot.quit();
    return;
  }

  try {
    const compass = bot.inventory.items().find(item => item.name.includes('compass'));
    if (!compass) throw new Error('Compass not found');

    bot.activateItem();
    console.log(`🖐 ${username} holding compass.`);
    await bot.waitFor('windowOpen', 10000);

    const realmMenu = bot.currentWindow;
    if (!realmMenu) throw new Error('Menu not open');

    console.log(`📜 ${username} Realm selector opened.`);

    const yellowDye = realmMenu.slots.find(item => item && item.name === 'yellow_dye');
    if (!yellowDye) throw new Error('Yellow dye not found');

    for (let i = 0; i < 3; i++) {
      bot.clickWindow(yellowDye.slot, 0, 0);
      console.log(`🖱 ${username} Clicking yellow dye... (${i + 1}/3)`);
      await new Promise(res => setTimeout(res, 1000));
    }

    setTimeout(() => {
      bot.chat('/warp afk');
      console.log(`🚀 ${username} warped to afk.`);
    }, 5000);

  } catch (err) {
    console.log(`⚠️ ${username} ${err.message}. Retrying... (${attempt}/20)`);
    setTimeout(() => openRealm(bot, username, attempt + 1), 5000);
  }
}

function printMessageCounts() {
  console.log('📩 Active Bots & Message Counts:');
  for (const [username, count] of Object.entries(messageCounts)) {
    console.log(`➡️ ${username}: Messages [${count}]`);
  }
}

function startBotsSequentially() {
  if (botIndex >= accounts.length) return;
  createBot(accounts[botIndex]);
  botIndex++;
  setTimeout(startBotsSequentially, 15000);
}

startBotsSequentially();
