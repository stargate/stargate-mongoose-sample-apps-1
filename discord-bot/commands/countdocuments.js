'use strict';

const { SlashCommandBuilder } = require('discord.js');
const Bot = require('../models/bot')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('count')
		.setDescription('counts documents in the database'),
	async execute(interaction) {
    // `countDocuments()` currently not implemented, see:
    // https://github.com/stargate/stargate-mongoose/pull/48
    const num = await Bot.find().then(res => res.length);
    console.log(num);
		await interaction.reply(num.toString());
	}
};