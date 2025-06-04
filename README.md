# Discord MySQL Auto Backup Bot

A Discord bot that automatically backs up your MySQL database and sends the backup file to a specified Discord channel. Built with [discord.js](https://discord.js.org/), [mysqldump](https://www.npmjs.com/package/mysqldump), and [node-cron](https://www.npmjs.com/package/node-cron).

## Features
- Scheduled automatic MySQL database backups
- Manual backup via Discord slash command
- Customizable backup interval (minutes, hours, days)
- Sends backup `.sql` file directly to a Discord channel
- Simple setup with environment variables

## Requirements
- Node.js v16 or higher
- A MySQL database
- A Discord bot token and a channel ID

## Installation
1. Clone this repository:
   ```bash
   git clone <repo-url>
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
   - `/schedule` — Show the current backup schedule (in cron format)

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

## License
MIT
