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
	Matcher = require('did-you-mean'),
	commando = require('discord.js-commando'),
	fs = require('fs'),
	path = require('path'),
	{oneLine} = require('common-tags'),
	{deleteCommandMessages} = require('../../util.js');

module.exports = class copypastaCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'copypasta',
			'memberName': 'copypasta',
			'group': 'fun',
			'aliases': ['cp', 'pasta'],
			'description': 'Sends contents of a copypasta file to the chat',
			'format': 'CopypastaName',
			'examples': ['copypasta navy'],
			'guildOnly': false,
			'args': [
				{
					'key': 'name',
					'prompt': 'Send which copypasta?',
					'type': 'string',
					'parse': p => p.toLowerCase()
				}
			]
		});
	}

	run (msg, args) {
		const match = new Matcher();

		match.values = fs.readdirSync(path.join(__dirname, 'pastas'));

		const dym = match.get(`${args.name}.txt`), // eslint-disable-line one-var
			dymString = dym !== null
				? oneLine `Did you mean \`${dym}\`?`
				: oneLine `You can save it with \`${msg.guild ? msg.guild.commandPrefix : this.client.commandPrefix}copypastaadd <filename> <content>\` or verify the file name manually`;

		try {
			let pastaContent = fs.readFileSync(path.join(__dirname, `pastas/${args.name}.txt`), 'utf8');

			if (pastaContent) {
				if (pastaContent.length <= 1024) {
					/* eslint-disable no-nested-ternary */
					const cpEmbed = new Discord.MessageEmbed(),
						ext = pastaContent.includes('.png') ? '.png'
							: pastaContent.includes('.jpg') ? '.jpg'
								: pastaContent.includes('.gif') ? '.gif'
									: pastaContent.includes('.webp') ? '.webp' : 'none',
						header = ext !== 'none' ? pastaContent.includes('https') ? 'https' : 'http' : 'none';
					/* eslint-enable no-nested-ternary */

					if (ext !== 'none' && header !== 'none') {
						cpEmbed.setImage(`${pastaContent.substring(pastaContent.indexOf(header), pastaContent.indexOf(ext))}${ext}`);
						pastaContent = pastaContent.substring(0, pastaContent.indexOf(header) - 1) + pastaContent.substring(pastaContent.indexOf(ext) + ext.length);
					}

					cpEmbed.setDescription(pastaContent);
					msg.delete();

					return msg.embed(cpEmbed);
				}
				msg.delete();

				return msg.say(pastaContent, {'split': true});
			}
		} catch (err) {
			deleteCommandMessages(msg, this.client);

			return msg.reply(`⚠️ that copypata does not exist! ${dymString}`);
		}

		deleteCommandMessages(msg, this.client);

		return msg.reply(`⚠️ that copypata does not exist! ${dymString}`);
	}
};