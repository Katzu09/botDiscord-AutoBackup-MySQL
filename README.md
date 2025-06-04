# Discord MySQL Auto Backup Bot

A Discord bot that automatically backs up your MySQL database and sends the backup file to a specified Discord channel. Built with [discord.js](https://discord.js.org/), [mysqldump](https://www.npmjs.com/package/mysqldump), [node-cron](https://www.npmjs.com/package/node-cron), and [cron-parser](https://www.npmjs.com/package/cron-parser).

## Features
- Scheduled automatic MySQL database backups
- Manual backup via Discord slash command
- Customizable backup interval (minutes, hours, days)
- Sends backup `.sql` file directly to a Discord channel
- All bot messages are in English and do not use emojis
- `/schedule` command shows both the cron string, a human-readable interval, and the next backup time
- Simple setup with environment variables

## Requirements
- Node.js v16 or higher
- A MySQL database
- A Discord bot token and a channel ID
- `cron-parser` npm package (install with `npm install cron-parser`)

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/Katzu09/botDiscord-AutoBackup-MySQL.git
   cd botDiscord-AutoBackup-MySQL
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and fill in your credentials:
   ```env
   DISCORD_TOKEN=your_discord_bot_token
   CHANNEL_ID=your_channel_id
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=your_mysql_user
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=your_database_name
   ```

## Usage
1. Start the bot:
   ```bash
   node index.js
   ```
2. Invite your bot to your Discord server and ensure it has permission to send messages and upload files in the target channel.
3. Use the following slash commands in Discord:
   - `/setbackup <interval>` — Set backup interval (e.g., `30m`, `6h`, `1d`)
   - `/backupnow` — Run a manual backup immediately
   - `/schedule` — Show the current backup schedule (shows cron, human readable, and next backup time)

## Example Output
When you run `/schedule`, the bot will reply like this:
```
Current backup schedule: `0 0 */3 * *`
Every 3 day(s)
Next backup at 00:00 on 7 June 2025
```
Or for every 30 minutes:
```
Current backup schedule: `*/30 * * * *`
Every 30 minute(s)
Next backup at 12:30 on 5 June 2025
```

## Backup Output
Backup files are saved in the `backups/` directory and sent to your Discord channel. Example file: `mysql-backup-2025-06-04T12-25-00-017Z.sql`.

Example content:
```sql
# SCHEMA DUMP FOR TABLE: products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (...);
# DATA DUMP FOR TABLE: products
INSERT INTO `products` (...);
```

## Configuration
- The backup schedule is stored in `schedule.json` using cron format. You can edit this file manually or use the `/setbackup` command.
- Default schedule: every day at midnight (`0 0 * * *`).

## Notes
- Make sure your bot has permission to send messages and upload files in the specified channel.
- Do **not** commit your `.env` file or backup files to version control.
- The bot requires the `cron-parser` package for next backup prediction.

## License
MIT
