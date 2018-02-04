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
	vibrant = require('node-vibrant');

module.exports = class avatarCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'avatar',
			'memberName': 'avatar',
			'group': 'info',
			'aliases': ['ava'],
			'description': 'Gets the avatar from a user',
			'format': 'MemberID|MemberName(partial or full) [ImageSize]',
			'examples': ['avatar Favna 2048'],
			'guildOnly': true,
			'args': [
				{
					'key': 'member',
					'prompt': 'What user would you like to get the avatar from?',
					'type': 'member'
				},
				{
					'key': 'size',
					'prompt': 'What size do you want the avatar to be? (Valid sizes: 128, 256, 512, 1024, 2048)',
					'type': 'integer',
					'default': 128,
					'validate': (size) => {
						const validSizes = ['128', '256', '512', '1024', '2048'];

						if (validSizes.includes(size)) {
							return true;
						}

						return `Has to be one of ${validSizes.join(', ')}`;
					}
				}
			]
		});
		this.embedColor = '#FF0000';
	}

	deleteCommandMessages (msg) {
		if (msg.deletable && this.client.provider.get('global', 'deletecommandmessages', false)) {
			msg.delete();
		}
	}

	async fetchColor (img) {

		let palette = '';
		
		try {
			palette = await vibrant.from(img).getPalette();
		} catch (err) {
			return this.embedColor;
		}

		if (palette) {
			const pops = [],
				swatches = Object.values(palette);

			let prominentSwatch = {};

			for (const swatch in swatches) {
				if (swatches[swatch]) {
					pops.push(swatches[swatch]._population); // eslint-disable-line no-underscore-dangle
				}
			}

			const highestPop = pops.reduce((a, b) => Math.max(a, b)); // eslint-disable-line one-var

			for (const swatch in swatches) {
				if (swatches[swatch]) {
					if (swatches[swatch]._population === highestPop) { // eslint-disable-line no-underscore-dangle
						prominentSwatch = swatches[swatch];
						break;
					}
				}
			}
			this.embedColor = prominentSwatch.getHex();
		}

		return this.embedColor;
	}

	fetchExt (str) {
		return str.substring(str.length - 14, str.length - 8);
	}

	async run (msg, args) {
		const ava = args.member.user.displayAvatarURL({'size': args.size}),
			embed = new Discord.MessageEmbed(),
			ext = this.fetchExt(ava),
			avaColor = ext.includes('gif') ? await this.fetchColor(ava) : this.embedColor; // eslint-disable-line sort-vars

		embed
			.setColor(avaColor)
			.setImage(ext.includes('gif') ? `${ava}&f=.gif` : ava)
			.setTitle(args.member.displayName)
			.setURL(ava)
			.setDescription(`[Direct Link](${ava})`);

		this.deleteCommandMessages(msg);
		
		return msg.embed(embed);
	}
};