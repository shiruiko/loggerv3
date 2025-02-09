const send = require('../modules/webhooksender')

module.exports = {
  name: 'voiceChannelSwitch',
  type: 'on',
  handle: async (member, channel, oldChannel) => {
    await send({
      guildID: channel.guild.id,
      eventName: 'voiceChannelSwitch',
      embed: {
        author: {
          name: `${member.username}#${member.discriminator} ${member.nick ? `(${member.nick})` : ''}`,
          icon_url: member.avatarURL
        },
        description: `**${member.username}#${member.discriminator}** ${member.nick ? `(${member.nick})` : ''} moved from <#${oldChannel.id}> (${oldChannel.name}) to <#${channel.id}> (${channel.name}).`,
        fields: [{
          name: 'New Channel',
          value: `<#${channel.id}> (${channel.name})`
        }, {
          name: 'Old Channel',
          value: `<#${oldChannel.id}> (${oldChannel.name})`
        }, {
          name: 'ID',
          value: `\`\`\`ini\nUser = ${member.id}\nNew = ${channel.id}\nOld = ${oldChannel.id}\`\`\``
        }],
        color: 3553599
      }
    })
  }
}
