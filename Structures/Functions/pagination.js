const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");

module.exports = async (interaction, pages, ephemeral, time = 60000) => {
    if (!interaction || !pages || !(pages?.length > 0) || !(time > 10000))
        throw new Error("Invalid Parameter");

    let backBtn = new ButtonBuilder()
        .setCustomId("1")
        .setEmoji("<:backward:987667995549638687>")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    let frontBtn = new ButtonBuilder()
        .setCustomId("2")
        .setEmoji("<:forward:987667992781402192>")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(pages.length < 2);

    let closeBtn = new ButtonBuilder()
        .setCustomId("3")
        .setEmoji("<:declined:982524683117281280>")
        .setStyle(ButtonStyle.Danger);

    let row = new ActionRowBuilder().addComponents(
        backBtn,
        frontBtn,
        closeBtn
    );

    let index = 0;

    const data = {
        embeds: [pages[index]],
        components: [row],
        fetchReply: true,
        ephemeral: ephemeral ? true : false,
    };

    const msg = interaction.replied
        ? await interaction.followUp(data)
        : await interaction.reply(data);

    const col = msg.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time,
    });

    col.on("collect", (i) => {
        if (i.customId === "1") index--;
        else if (i.customId === "2") index++;
        else {
            i.update({
                components: [],
            });
            return col.stop();
        }

        backBtn = new ButtonBuilder()
            .setCustomId("1")
            .setEmoji("<:backward:987667995549638687>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(index === 0 ? true : false);

        frontBtn = new ButtonBuilder()
            .setCustomId("2")
            .setEmoji("<:forward:987667992781402192>")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(index === pages.length - 1 ? true : false);

        closeBtn = new ButtonBuilder()
            .setCustomId("3")
            .setEmoji("<:declined:982524683117281280>")
            .setStyle(ButtonStyle.Danger);

        row = new ActionRowBuilder().addComponents(
            backBtn,
            frontBtn,
            closeBtn
        );

        i.update({
            components: [row],
            embeds: [pages[index]],
        });
    });
};
