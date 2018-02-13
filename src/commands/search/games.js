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
	igdbapi = require('igdb-api-node').default,
	moment = require('moment'),
	{deleteCommandMessages} = require('../../util.js'),
	{igdbAPIKey} = require('../../auth.json');

module.exports = class gameCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'games',
			'memberName': 'games',
			'group': 'search',
			'aliases': ['game', 'moby', 'igdb'],
			'description': 'Finds info on a game on IGDB (IndieGamesDoneBad)',
			'format': 'GameName',
			'examples': ['games {gameName}', 'games Tales of Berseria'],
			'guildOnly': false,
			'args': [
				{
					'key': 'game',
					'prompt': 'Please supply game title',
					'type': 'string'
				}
			]

		});
	}

	extractNames (arr) {
		let res = '';

		for (let i = 0; i < arr.length; i += 1) {
			if (i !== arr.length - 1) {
				res += `${arr[i].name}, `;
			} else {
				res += `${arr[i].name}`;
			}
		}

		return res;
	}

	async run (msg, args) {
		/* eslint-disable sort-vars*/
		const gameEmbed = new Discord.MessageEmbed(),
			igdb = igdbapi(igdbAPIKey),
			gameInfo = await igdb.games({
				'search': args.game,
				'fields': ['name', 'summary', 'rating', 'developers', 'publishers', 'genres', 'release_dates', 'platforms', 'cover', 'esrb', 'pegi'],
				'limit': 1,
				'offset': 0
			}),
			companies = await gameInfo.body[0].publishers ? gameInfo.body[0].developers.concat(gameInfo.body[0].publishers) : gameInfo.body[0].developers,
			coverImg = await gameInfo.body[0].cover.url.includes('http') ? gameInfo.body[0].cover.url : `https:${gameInfo.body[0].cover.url}`,
			developerInfo = await igdb.companies({
				'ids': companies,
				'fields': ['name']
			}),
			genreInfo = await igdb.genres({
				'ids': gameInfo.body[0].genres,
				'fields': ['name']
			}),
			platformInfo = await igdb.platforms({
				'ids': gameInfo.body[0].platforms,
				'fields': ['name']
			}),
			releaseDate = moment(gameInfo.body[0].release_dates[0].date).format('MMMM Do YYYY');
		/* eslint-enable sort-vars*/

		gameEmbed
			.setColor(msg.guild ? msg.member.displayHexColor : '#FF0000')
			.setAuthor(gameInfo.body[0].name, 'https://favna.s-ul.eu/O704Q7py.png')
			.setThumbnail(coverImg)
			.setFooter('Info pulled from IGDB')
			.addField('Rating', Math.round(gameInfo.body[0].rating * 10) / 10, true)
			.addField('Release Date', releaseDate, true)
			.addField('Genres', this.extractNames(genreInfo.body), true)
			.addField('Platforms', this.extractNames(platformInfo.body), true)
			.addField(`${gameInfo.body[0].pegi ? 'PEGI' : 'ESRB'} rating`, gameInfo.body[0].pegi ? gameInfo.body[0].pegi.rating : gameInfo.body[0].esrb.rating, true)
			.addField('Companies', this.extractNames(developerInfo.body), true)
			.addField('Summary', gameInfo.body[0].summary, false);

		deleteCommandMessages(msg, this.client);

		return msg.embed(gameEmbed);
	}
};