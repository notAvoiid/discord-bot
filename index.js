import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { GoogleApis, google } from 'googleapis';
import { schedule } from 'node-cron';

config();

const discordClient = new Client({
    intents: [
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds,
    ]
})

const youtubeClient = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
})

let latestVideoId = ''

discordClient.login(process.env.DISCORD_TOKEN);
discordClient.on('ready', () => {
    console.log(`Bot online, logado como: ${discordClient.user.tag}`)
    checkNewVideos();
    schedule('* * 0 * * *', checkNewVideos);
});

async function checkNewVideos() {
    try {
        const response = await youtubeClient.search.list({
            channelId: 'UCgSAH94ZjV6-w46hPJ0-ffQ',
            order: 'date',
            part: 'snippet',
            type: 'video',
            maxResults: 1,
        }).then(res => res)
        const latestVideo = response.data.items[0]
        console.log(latestVideo);

        if(latestVideo?.id?.videoId != latestVideoId) {
            latestVideoId = latestVideo?.id?.videoId
            const videoUrl = `https://www.youtube.com/watch?v=${latestVideoId}`;
            const message = 'Confira o último vídeo do canal!';
            const channel = discordClient.channels.cache.get('1217140183116550319');
            channel.send(message + ' ' + videoUrl);
        }
    } catch (error) {
        console.log("Erro ao buscar último vídeo do canal!")
        console.log(error);
    }
}