require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const cron = require("node-cron");
const mysqldump = require('mysqldump');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
let cronJob = null;

const backupDir = "./backups/";
const configPath = "./schedule.json";

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
                content: `📦 Backup selesai pada ${timestamp}`,
                files: [backupPath]
            });
        }

        console.log(`✅ Backup sukses: ${backupFile}`);
    } catch (err) {
        console.error("❌ Gagal backup MySQL:", err);
        const channel = await client.channels.fetch(process.env.CHANNEL_ID);
        if (channel && channel.isTextBased()) {
            await channel.send(`❌ Gagal melakukan backup MySQL. Error: \`\`\`${err.message}\`\`\``);
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

    console.log(`📅 Jadwal backup aktif: ${cronString}`);
}

client.once("ready", async () => {
    console.log(`Bot aktif sebagai ${client.user.tag}`);
    loadSchedule();

    const commands = [
        new SlashCommandBuilder()
            .setName("setbackup")
            .setDescription("Atur interval backup")
            .addStringOption(opt =>
                opt.setName("interval")
                    .setDescription("Misal: 30m, 6h, 1d")
                    .setRequired(true)
            ),

        new SlashCommandBuilder()
            .setName("backupnow")
            .setDescription("Lakukan backup manual sekarang"),

        new SlashCommandBuilder()
            .setName("schedule")
            .setDescription("Lihat jadwal backup saat ini")
    ];

    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands.map(cmd => cmd.toJSON()) }
        );
        console.log("✅ Slash commands terdaftar.");
    } catch (err) {
        console.error("Gagal register command:", err);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === "setbackup") {
        const input = interaction.options.getString("interval");
        const cronString = timeToCron(input);

        if (!cronString) {
            await interaction.reply({ content: "❌ Format salah! Contoh: `30m`, `6h`, `1d`", ephemeral: true });
            return;
        }

        try {
            fs.writeFileSync(configPath, JSON.stringify({ cron: cronString }, null, 2));
            loadSchedule();
            await interaction.reply(`✅ Jadwal backup diatur ke setiap ${input}`);
        } catch (error) {
            console.error("Error writing schedule to file:", error);
            await interaction.reply({ content: "❌ Gagal menyimpan jadwal. Silakan coba lagi.", ephemeral: true });
        }

    } else if (commandName === "backupnow") {
        await interaction.reply("🔄 Proses backup dimulai...");
        await doBackup();
    } else if (commandName === "schedule") {
        try {
            const raw = fs.readFileSync(configPath, "utf-8");
            const { cron } = JSON.parse(raw);
            await interaction.reply(`📅 Jadwal backup saat ini: \`${cron}\``);
        } catch (error) {
            console.error("Error reading schedule.json:", error);
            await interaction.reply({ content: "❌ Gagal membaca jadwal. Mungkin belum diatur.", ephemeral: true });
        }
    }
});

client.login(process.env.DISCORD_TOKEN);