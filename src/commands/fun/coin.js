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
	coin = require('flipacoin'),
	commando = require('discord.js-commando');

module.exports = class coinCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'coin',
			'memberName': 'coin',
			'group': 'fun',
			'aliases': ['flip', 'coinflip'],
			'description': 'Flips a coin',
			'examples': ['coin'],
			'guildOnly': false
		});
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get('global', 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	run (msg) {
		const coinEmbed = new Discord.MessageEmbed(),
			res = coin();

		coinEmbed
			.setColor(msg.member !== null ? msg.member.displayHexColor : '#FF0000')
			.setImage(res === 'head' ? 'https://favna.s-ul.eu/8ZKmpiKO.png' : 'https://favna.s-ul.eu/NTsDbSUo.png')
			.setTitle(`Flipped ${res}s`);

		this.deleteCommandMessages(msg);

		return msg.embed(coinEmbed);
	}
};