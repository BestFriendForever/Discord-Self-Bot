/*
 *   This file is part of discord-self-bot
 *   Copyright (C) 2017-2018 Favna
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, version 3 of the License
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *   Additional Terms 7.b and 7.c of GPLv3 apply to this file:
 *       * Requiring preservation of specified reasonable legal notices or
 *         author attributions in that material or in the Appropriate Legal
 *         Notices displayed by works containing it.
 *       * Prohibiting misrepresentation of the origin of that material,
 *         or requiring that modified versions of such material be marked in
 *         reasonable ways as different from the original version.
 */

const Discord = require('discord.js'),
	commando = require('discord.js-commando'),
	xdicey = require('xdicey');

module.exports = class diceCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'dice',
			'memberName': 'dice',
			'group': 'fun',
			'aliases': ['xdicey', 'roll', 'dicey', 'die'],
			'description': 'Sends contents of a copypasta file to the chat',
			'format': 'SidesOfTheDice AmountOfRolls',
			'examples': ['dice 6 5'],
			'guildOnly': false,
			'args': [
				{
					'key': 'sides',
					'prompt': 'How many sides does your die have?',
					'type': 'integer'
				}, {
					'key': 'rolls',
					'prompt': 'How many times should the die be rolled?',
					'type': 'integer'
				}
			]
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get('global', 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg, args) {
		const diceEmbed = new Discord.MessageEmbed(),
			res = [],
			throwDice = xdicey(args.rolls, args.sides);

		for (const index in throwDice.individual) { // eslint-disable-line guard-for-in
			res.push(`🎲: ${throwDice.individual[index]}`);
		}

		diceEmbed
			.setColor(msg.member !== null ? msg.member.displayHexColor : '#FF0000')
			.addField('Dice result', res, false)
			.addField('Total', throwDice.total, false);

		this.deleteCommandMessages(msg);

		return msg.embed(diceEmbed);
	}
};