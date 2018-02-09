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
	maljs = require('maljs'),
	{deleteCommandMessages, fetchColor} = require('../../util.js');

module.exports = class mangaCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'manga',
			'memberName': 'manga',
			'group': 'search',
			'aliases': ['cartoon', 'man'],
			'description': 'Finds manga on MyAnimeList',
			'format': 'MangaName',
			'examples': ['manga Pokemon'],
			'guildOnly': false,
			'args': [
				{
					'key': 'query',
					'prompt': 'What manga do you want to find?',
					'type': 'string'
				}
			]
		});
		this.embedColor = '#FF0000';
	}

	async run (msg, args) {
		const manEmbed = new Discord.MessageEmbed(),
			res = await maljs.quickSearch(args.query, 'manga');

		if (res) {
			const manga = await res.manga[0].fetch();

			if (manga) {

				manEmbed
					.setColor(await fetchColor(manga.cover, this.embedColor))
					.setTitle(manga.title)
					.setImage(manga.cover)
					.setDescription(manga.description)
					.setURL(`${manga.mal.url}${manga.path}`)
					.addField('Score', manga.score, true)
					.addField('Popularity', manga.popularity, true)
					.addField('Rank', manga.ranked, true);

				deleteCommandMessages(msg, this.client);
					
				return msg.embed(manEmbed, `${manga.mal.url}${manga.path}`);
			}
		}
		
		return msg.reply('⚠️ ***nothing found***');
	}
};