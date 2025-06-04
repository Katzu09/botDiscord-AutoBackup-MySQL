require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const cron = require("node-cron");
const mysqldump = require('mysqldump');
const cronParser = require('cron-parser');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let cronJob = null;

const backupDir = "./backups/";
const configPath = "./schedule.json";

const WHITELIST_ROLES = ["1345695413113454655", "1340574470712066227"];

if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
}

function timeToCron(input) {
    const match = input.match(/^(\d+)(m|h|d)$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    if (unit === "m") return `*/${value} * * * *`;
    if (unit === "h") return `0 */${value} * * *`;
    if (unit === "d") return `0 0 */${value} * *`;
    return null;
}

async function doBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = `mysql-backup-${timestamp}.sql`;
    const backupPath = path.join(backupDir, backupFile);

    try {
        await mysqldump({
            connection: {
                host: process.env.MYSQL_HOST,
                user: process.env.MYSQL_USER,
                password: process.env.MYSQL_PASSWORD,
                database: process.env.MYSQL_DATABASE,
                port: process.env.MYSQL_PORT || 3306,
            },
            dump: {
                schema: {
                    table: {
                        dropIfExist: true,
                    },
                },
                data: {
                },
            },
            dumpToFile: backupPath,
        });

        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            await channel.send({
                content: `📦 Backup completed at ${timestamp}`,
                files: [backupPath]
            });
        }

        console.log(`✅ Backup successful: ${backupFile}`);
    } catch (err) {
        console.error("❌ Backup MySQL failed:", err);
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            await channel.send(`❌ Backup MySQL failed. Error: \`\`\`${err.message}\`\`\``);
        }
    }
}

function loadSchedule() {
    let cronString = "0 0 * * *";
    try {
        if (fs.existsSync(configPath)) {
            const raw = fs.readFileSync(configPath, "utf-8");
            const config = JSON.parse(raw);
            if (config && config.cron) {
                cronString = config.cron;
            }
        } else {
            fs.writeFileSync(configPath, JSON.stringify({ cron: cronString }, null, 2));
        }
    } catch (error) {
        console.error("Error loading schedule.json, using default:", error);
    }

    if (cronJob) cronJob.stop();

    cronJob = cron.schedule(cronString, () => {
        doBackup();
    });

    console.log(`📅 Backup schedule active: ${cronString}`);
}

function cronToHuman(cron) {
    let human = cron;
    if (/^\*\/(\d+) \* \* \* \*$/.test(cron)) {
        const m = cron.match(/^\*\/(\d+) \* \* \* \*$/);
        human = `Every ${m[1]} minute(s)`;
    } else if (/^0 \*\/(\d+) \* \* \*$/.test(cron)) {
        const m = cron.match(/^0 \*\/(\d+) \* \* \*$/);
        human = `Every ${m[1]} hour(s)`;
    } else if (/^0 0 \*\/(\d+) \* \*$/.test(cron)) {
        const m = cron.match(/^0 0 \*\/(\d+) \* \*$/);
        human = `Every ${m[1]} day(s)`;
    } else if (cron === "0 0 * * *") {
        human = "Every day at 00:00";
    } else if (cron === "0 0 1 * *") {
        human = "Every 1st day of the month at 00:00";
    }

    let next = null;
    let nextStr = '';
    try {
        const now = new Date();
        const expr = require('cron-parser').CronExpressionParser.parse(cron, { currentDate: now });
        next = expr.next().toDate();
    } catch (e) {
        console.error('[cronToHuman] Failed to parse cron:', cron, e.message);
        nextStr = 'Next backup prediction unavailable';
    }
    if (next) {
        const pad = n => n.toString().padStart(2, '0');
        nextStr = `Next backup at ${pad(next.getHours())}:${pad(next.getMinutes())} on ${next.getDate()} ${next.toLocaleString('en-US', { month: 'long' })} ${next.getFullYear()}`;
    }
    return nextStr ? `${human}\n${nextStr}` : human;
}

client.once("ready", async () => {
    console.log(`Bot active as ${client.user.tag}`);
    loadSchedule();

    const commands = [
        new SlashCommandBuilder()
            .setName("setbackup")
            .setDescription("Set backup interval")
            .addStringOption(opt =>
                opt.setName("interval")
                    .setDescription("Example: 30m, 6h, 1d")
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName("backupnow")
            .setDescription("Perform manual backup now"),

        new SlashCommandBuilder()
            .setName("schedule")
            .setDescription("View current backup schedule")
    ];

    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands.map(cmd => cmd.toJSON()) }
        );
        console.log("✅ Slash commands registered.");
    } catch (err) {
        console.error("Failed to register command:", err);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (["setbackup", "backupnow"].includes(commandName)) {
        if (
            interaction.guild &&
            interaction.member &&
            interaction.member.roles &&
            interaction.member.roles.cache
        ) {
            const allowed = interaction.member.roles.cache.some(role =>
                WHITELIST_ROLES.includes(role.id)
            );
            if (!allowed) {
                await interaction.reply({ content: "You do not have permission to use this command.", ephemeral: true });
                return;
            }
        } else {
            await interaction.reply({ content: "This command can only be used in a server.", ephemeral: true });
            return;
        }
    }

    if (commandName === "setbackup") {
        const input = interaction.options.getString("interval");
        const cronString = timeToCron(input);

        if (!cronString) {
            await interaction.reply({ content: "❌ Wrong format! Example: 30m, 6h, 1d", ephemeral: true });
            return;
        }

        try {
            await interaction.deferReply({ ephemeral: true });
            fs.writeFileSync(configPath, JSON.stringify({ cron: cronString }, null, 2));
            loadSchedule();
            await interaction.editReply(`Backup schedule set to every ${input}`);
        } catch (error) {
            console.error("Error writing schedule to file:", error);
            await interaction.editReply({ content: "Failed to save schedule. Please try again.", ephemeral: true });
        }

    } else if (commandName === "backupnow") {
        await interaction.reply("Backup process started...");
        await doBackup();
    } else if (commandName === "schedule") {
        try {
            const raw = fs.readFileSync(configPath, "utf-8");
            const { cron } = JSON.parse(raw);
            const human = cronToHuman(cron);
            await interaction.reply(`Current backup schedule: \`${cron}\`\n${human}`);
        } catch (error) {
            console.error("Error reading schedule.json:", error);
            await interaction.reply({ content: "Failed to read schedule. It may not be set yet.", ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);