const webhookCache = require('./webhookcache')
const guildWebhookCacher = require('./guildWebhookCacher')
const cacheGuild = require('../utils/cacheGuild')

module.exports = async pkg => {
  if (!pkg.guildID) return global.logger.error('No guildID was provided in an embed!')
  if (!pkg.embed.color) pkg.embed.color = 3553599
  const guild = global.bot.guilds.get(pkg.guildID)
  if (!guild) {
    console.error('Invalid guild ID sent in package!', pkg.guildID, pkg, pkg.embed)
    global.webhook.warn(`Invalid guild ID sent in package! ${pkg.guildID}`)
    return
  }
  if (!guild.members.get(global.bot.user.id).permission.json['manageWebhooks'] || !guild.members.get(global.bot.user.id).permission.json['viewAuditLogs']) return

  const guildSettings = global.bot.guildSettingsCache[pkg.guildID]
  if (!guildSettings) {
    await cacheGuild(pkg.guildID)
    return
  }
  const webhook = await webhookCache.getWebhook(guildSettings.getEventByName(pkg.eventName))
  let webhookID, webhookToken
  if (webhook) {
    const split = webhook.split('|')
    webhookID = split[0]
    webhookToken = split[1]
  }
  if (!webhook && guildSettings.getEventByName(pkg.eventName)) {
    await guildWebhookCacher(pkg.guildID)
    return await setTimeout(() => {
      module.exports(pkg)
    }, 2000)
  } else if (webhook && !guildSettings.eventIsDisabled(pkg.eventName)) {
    if (!pkg.embed.footer) {
      pkg.embed.footer = {
        text: `${global.bot.user.username}#${global.bot.user.discriminator}`,
        icon_url: global.bot.user.avatarURL
      }
    }
    if (!pkg.embed.timestamp) pkg.embed.timestamp = new Date()
    global.bot.executeWebhook(webhookID, webhookToken, {
      file: pkg.file ? pkg.file : '',
      username: global.bot.user.username,
      avatarURL: global.bot.user.avatarURL,
      embeds: [pkg.embed]
    }).catch(async e => {
      if (e.code === 10015) { // Webhook doesn't exist anymore.
        await global.redis.del(`webhook-${guildSettings.getEventByName(pkg.eventName)}`)
        return await guildWebhookCacher(pkg.guildID)
      } else {
        console.error('Error while sending a message over webhook!', e, pkg, pkg.embed.fields)
      }
    })
  }
}
