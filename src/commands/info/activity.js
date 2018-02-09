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
	duration = require('moment-duration-format'), // eslint-disable-line no-unused-vars
	moment = require('moment'),
	request = require('snekfetch'),
	{fetchColor, deleteCommandMessages} = require('../../util.js');

module.exports = class activityCommand extends commando.Command {
	constructor (client) {
		super(client, {
			'name': 'activity',
			'memberName': 'activity',
			'group': 'info',
			'aliases': ['act', 'presence', 'richpresence'],
			'description': 'Gets the activity (presence) data from a member',
			'format': 'MemberID|MemberName(partial or full)',
			'examples': ['activity Favna'],
			'guildOnly': true,

			'args': [
				{
					'key': 'member',
					'prompt': 'What user would you like to get the activity from?',
					'type': 'member'
				}
			]
		});
		this.embedColor = '#FF0000';
	}

	convertType (type) {
		return type !== 'listening' ? type.charAt(0).toUpperCase() + type.slice(1) : 'Listening to';
	}

	fetchExt (str) {
		return str.slice(-4);
	}

	/* eslint complexity: ["error", 35], max-statements: ["error", 50]*/
	async run (msg, args) {

		args.member = this.client.guilds.get('246821351585742851').members.get('311193975635705858');

		const activity = args.member.user.presence.activity,
			ava = args.member.user.displayAvatarURL(),
			embed = new Discord.MessageEmbed(),
			ext = this.fetchExt(ava),
			avaColor = ext.includes('gif') ? await fetchColor(ava, this.embedColor) : this.embedColor, // eslint-disable-line sort-vars
			gameList = await request.get('https://canary.discordapp.com/api/v6/games');

		embed
			.setColor(avaColor)
			.setAuthor(args.member.user.tag, ava, `${ava}?size2048`)
			.setThumbnail(ext.includes('gif') ? `${ava}&f=.gif` : ava);

		if (activity) {
			const gameIcon = gameList.body.find(g => g.name === activity.name);

			if (activity.type === 'STREAMING' && activity.url.includes('twitch')) {
				embed.setThumbnail(`https://static-cdn.jtvnw.net/previews-ttv/live_user_${activity.url.split('/')[3]}-432x240.jpg`);
			}

			largeImageAssetCheck: if (activity.assets) {
				if (activity.assets.largeImage && !activity.assets.largeImage.includes('spotify')) {
					embed.setThumbnail(`https://cdn.discordapp.com/app-assets/${activity.applicationID}/${activity.assets.largeImage}.png`);
					break largeImageAssetCheck;
				}
				if (activity.assets.largeImage && activity.assets.largeImage.includes('spotify')) {
					embed.setThumbnail(`https://i.scdn.co/image/${activity.assets.largeImage.split(':')[1]}`);
					break largeImageAssetCheck;
				}
				gameIcon ? embed.setThumbnail(`https://cdn.discordapp.com/game-assets/${gameIcon.id}/${gameIcon.icon}.png`) : null;
			}

			smallImageAssetCheck: if (activity.assets) {
				if (activity.timestamps && activity.timestamps.start) {
					if (activity.assets.smallImage && activity.assets.smallImage.includes('spotify')) {
						embed.setFooter(`Start Time ${moment(activity.timestamps.start).format(`DD-MM-YY [at] ${this.client.provider.get('global', 'timeformat', '24') === '24' ? 'HH:mm' : 'hh:mm A'}`)}`, `https://i.scdn.co/image/${activity.assets.smallImage.split(':')[1]}`); // eslint-disable-line max-len
						break smallImageAssetCheck;
					} else {
						embed.setFooter(`Start Time ${moment(activity.timestamps.start).format(`DD-MM-YY [at] ${this.client.provider.get('global', 'timeformat', '24') === '24' ? 'HH:mm' : 'hh:mm A'}`)}`, // eslint-disable-line max-len
							`https://cdn.discordapp.com/app-assets/${activity.applicationID}/${activity.assets.smallImage}.png`);
						break smallImageAssetCheck;
					}
				} else if (activity.assets.smallImage && activity.assets.smallImage.includes('spotify')) {
					embed.setFooter('​', `https://i.scdn.co/image/${activity.assets.smallImage.split(':')[1]}`);
					break smallImageAssetCheck;
				} else {
					embed.setFooter('​', `https://cdn.discordapp.com/app-assets/${activity.applicationID}/${activity.assets.smallImage}.png`);
					break smallImageAssetCheck;
				}
			} else
			if (activity.timestamps && activity.timestamps.start) {
				embed.setFooter(`Start Time ${moment(activity.timestamps.start).format(`DD-MM-YY [at] ${this.client.provider.get('global', 'timeformat', '24') === '24' ? 'HH:mm' : 'hh:mm A'}`)}`);
			}

			activity.timestamps && activity.timestamps.end
				? embed.setFooter(`${embed.footer ? `${embed.footer.text} | ` : ''}End Time: ${moment.duration(activity.timestamps.end - Date.now()).format('HH [hours and] mm [minutes]')}`)
				: null;
			embed.addField(this.convertType(activity.type), activity.name, true);
			activity.url ? embed.addField('URL', `[${activity.url.slice(8)}](${activity.url})`, true) : null;
			activity.details ? embed.addField('Details', activity.details, true) : null;
			activity.state ? embed.addField('State', activity.state, true) : null;
			activity.party && activity.party.size ? embed.addField('Party Size', `${activity.party.size[0]} of ${activity.party.size[1]}`, true) : null;
			activity.party && activity.party.id ? embed.addField('Party ID', activity.party.id, true) : null;
			activity.applicationID ? embed.addField('Application ID', activity.applicationID, false) : null;
			deleteCommandMessages(msg, this.client);

			return msg.embed(embed);
		}
		embed.addField('Activity', 'Nothing', true);
		deleteCommandMessages(msg, this.client);

		return msg.embed(embed);
	}
};