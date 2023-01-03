const { Client, EmbedBuilder } = require("discord.js")
const DB = require("../Structures/Schemas/McServerStatsDB")
const mc_util = require("minecraft-server-util")

/**
 * 
 * @param {Client} client 
 */
module.exports = async (client) => {
    client.on("ready", () => {
        getInfo();
        setInterval(getInfo, 20 * 1000)
    })

    function getInfo() {
        DB.find().then(async (documentsArray) => {
            documentsArray.forEach(async (doc) => {
                if (!doc) return
                if (!doc.Platform) return

                const channel = await client.channels.fetch(doc.ChannelID);
                const ip = doc.IP
                const port = doc.Port
                const server_name = doc.ServerName
                const message_id = doc.MessageID

                let message = null;
                message = await channel.messages.fetch(message_id).catch((error) => {
                    if (error.code === 10008) {
                        doc.delete()
                    }
                })

                if (!message) return

                let Options = {
                    timeout: 10000
                }

                const Embed = new EmbedBuilder()

                switch (doc.Platform) {
                    case "java": {
                        await mc_util.statusLegacy(ip, port, Options).then(async (data) => {
                            Embed.setColor("Green")
                            Embed.setTitle(`Status of ${server_name}`)
                            Embed.setDescription(`IP: \`${ip}\` \nPort: \`${port}\` \nStatus: ${client.emotes.online} Online \nVersion: \`${data.version.name}\``)
                            Embed.addFields(
                                { name: "Players Count", value: `${data.players.online.toLocaleString('en-us')}/${data.players.max.toLocaleString('en-us')}`, inline: false },
                                { name: "Message Of The Day (MOTD)", value: `${data.motd.clean}\n\n` }
                            )
                            Embed.setFooter({ text: "Updated" })
                            Embed.setTimestamp()

                            if (data.favicon) {
                                Embed.setThumbnail('attachment://favicon.png');
                                await channel.messages.fetch(message_id).then(msg => msg.edit({ embeds: [Embed], files: [{ attachment: Buffer.from(data.favicon.split(',')[1], 'base64'), name: 'favicon.png' }] }))
                            } else {
                                await channel.messages.fetch(message_id).then(msg => {
                                    if (!msg) return
                                    msg.edit({ embeds: [Embed] })
                                })
                            }
                        }).catch(async (error) => {
                            Embed.setColor("Red")
                            Embed.setTitle(`Status of ${server_name}`)
                            Embed.setDescription(`IP: \`${ip}\` \nPort: \`${port}\` \nStatus: ${client.emotes.offline} Offline`)
                            Embed.setFooter({ text: "Updated" })
                            Embed.setTimestamp()

                            await channel.messages.fetch(message_id).then(msg => msg.edit({ embeds: [Embed] }))
                        })
                    } break;
                    case "bedrock": {
                        await mc_util.statusBedrock(ip, port, Options).then(async (data) => {
                            Embed.setColor("Green")
                            Embed.setTitle(`Status of ${server_name}`)
                            Embed.setDescription(`IP: \`${ip}\` \nPort: \`${port}\` \nStatus: ${client.emotes.online} Online \nVersion: \`${data.version.name}\``)
                            Embed.addFields(
                                { name: "Players Count", value: `${data.players.online.toLocaleString('en-us')}/${data.players.max.toLocaleString('en-us')}`, inline: false },
                                { name: "Message Of The Day (MOTD)", value: `${data.motd.clean}\n\n` }
                            )
                            Embed.setFooter({ text: "Updated" })
                            Embed.setTimestamp()

                            await channel.messages.fetch(message_id).then(msg => msg.edit({ embeds: [Embed] }))
                        }).catch(async (error) => {
                            Embed.setColor("Red")
                            Embed.setTitle(`Status of ${server_name}`)
                            Embed.setDescription(`IP: \`${ip}\` \nPort: \`${port}\` \nStatus: ${client.emotes.offline} Offline`)
                            Embed.setFooter({ text: "Updated" })
                            Embed.setTimestamp()

                            await channel.messages.fetch(message_id).then(msg => msg.edit({ embeds: [Embed] }))
                        })
                    } break;
                }
            })
        })
    }
}