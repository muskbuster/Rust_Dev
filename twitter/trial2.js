import fetch from 'node-fetch';

// Replace 'YOUR_API_KEY_HERE' with your Discord API token
const token = 'ODI5MzYzODU3MDgzNzI3OTYy.GWOUFB.qMACnPNPxEtTAyu1fSi9X6zC-qcQ0sifGbJ6jg';

// Replace 'YOUR_SERVER_ID_HERE' with your server's ID
const serverId = '935678348330434570';

// Replace 'YOUR_CHANNEL_ID_HERE' with your channel's ID
const channelId = '935678348330434570';

// approximate_member_count (count of server members)
async function getApproximateMemberCount(serverId) {
    const response = await fetch(`https://discord.com/api/guilds/${serverId}/preview`, {
        headers: {
            Authorization: `${token}`
        }
    });
    const data = await response.json();
    return data.approximate_member_count;
}

// approximate_presence_count (count of currently online server members)
async function getApproximatePresenceCount(serverId) {
    const response = await fetch(`https://discord.com/api/guilds/${serverId}/preview`, {
        headers: {
            Authorization: `${token}`
        }
    });
    const data = await response.json();
    return data.approximate_presence_count;
}


async function main() {
    const memberCount = await getApproximateMemberCount(serverId);
    console.log(`Approximate Member Count: ${memberCount}`);

    const presenceCount = await getApproximatePresenceCount(serverId);
    console.log(`Approximate Presence Count: ${presenceCount}`);
}

main();
