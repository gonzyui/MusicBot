const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require('./config.json');
const fs = require('fs');
let dispatcher;
let audio;
let voiceChannel;

bot.login(config.token);

function playAudio() {
  voiceChannel = bot.channels.cache.get(config.voiceChannel);
  
  
  voiceChannel.join().then(connection => {
    let files = fs.readdirSync('./music');

    while (true) {
      audio = files[Math.floor(Math.random() * files.length)];
      if (audio.endsWith('.mp3')) {
        break;
      }
    }

    dispatcher = connection.play('./music/' + audio);
    
    dispatcher.on('start', () => {
      console.log('Entrain de jouer ' + audio);

      const statusEmbed = new Discord.MessageEmbed()
      .addField('Entrain de jouer ', `${audio}`)
      .setColor('#0066ff')

      let statusChannel = bot.channels.cache.get(config.statusChannel);
      if (!statusChannel) return console.error('Le channel textuel est introuvable.');
      statusChannel.send(statusEmbed);
    });
    
    dispatcher.on('error', console.error);

    dispatcher.on('finish', () => {
      console.log('Le bot a terminé.');
      playAudio();
    });
    
  }).catch(e => {
    console.error(e);
  });
  
}

bot.on('ready', () => {

  console.log('Le bot est prêt!');
  console.log(`Connecté en tant que ${bot.user.tag}!`);
  console.log(`Prefix : ${config.prefix}`);
  console.log(`Serveurs : ${bot.guilds.cache.size}`);
  console.log(`Utilisateurs : ${bot.users.cache.size}`)

  const readyEmbed = new Discord.MessageEmbed()
  .setAuthor(bot.user.username, bot.user.avatarURL())
  .setDescription('Démarrage du bot réussi !')
  .addField("*Serveurs*", bot.guilds.cache.size)
  .addField("*Utilisateurs*", bot.users.cache.size)
  .addField("*Salons*", bot.channels.cache.size)
  .setColor('#0066ff')
  .setFooter('Emilia Radio Anime')
  
  
  bot.channels.cache.get('804065774636499006').send(readyEmbed);
  playAudio();
});

bot.on('message', async msg => {
  if (msg.author.bot) return;
  if (!msg.guild) return;
  if (!msg.content.startsWith(config.prefix)) return;
  let command = msg.content.split(' ')[0];
  command = command.slice(config.prefix.length);

  // Public allowed commands

  if (command == 'help') {
    if (!msg.guild.member(bot.user).hasPermission('EMBED_LINKS')) return msg.reply('**Erreur, le bot n\'a pas les permissions requises.**');
    const helpEmbed = new Discord.MessageEmbed()
    .setAuthor(`Page d'aide ${bot.user.username}`, bot.user.avatarURL())
    .setDescription(`Entrain de jouer \`${audio}\`.`)
    .addField('Commandes publique', `${config.prefix}help\n${config.prefix}ping\n${config.prefix}git\n${config.prefix}nowplaying\n${config.prefix}about\n`, true)
    .addField('Commandes admin', `${config.prefix}join\n${config.prefix}resume\n${config.prefix}pause\n${config.prefix}skip\n${config.prefix}leave\n${config.prefix}stop\n`, true)
    .setFooter('Developpeur: Gonz#0001')
    .setColor('#0066ff')

    msg.channel.send(helpEmbed);
  }

  if (command == 'ping') {
    msg.reply(`📈 Voici ma latence: ${Math.round(msg.client.ws.ping)} ms`).catch(console.error);
  }

  if (command == 'git') {
    msg.channel.send("> Voici mon code source offert par mon maître Gonz !\n> https://github.com/gonzyui/Ryuuji-discord-bot");
  }

  if (command == 'nowplaying') {
    const np = new Discord.MessageEmbed()
    .setColor('#0066ff')
    .setDescription(`Entrain de jouer` + audio)
    .setFooter('Emilia Radio Anime')
    msg.channel.send(np);
  }
    
  if (![config.botOwner].includes(msg.author.id)) return;

  // Bot owner exclusive

  if (command == 'join') {
    const join = new Discord.MessageEmbed()
    .setColor('#0066ff')
    .setDescription("J'arrive dans le salon vocal..")
    .setFooter('Emilia Radio Anime')
    msg.channel.send(join);
    playAudio();
  }

  if (command == 'resume') {
    const resume = new Discord.MessageEmbed()
    .setColor('#0066ff')
    .setDescription("La musique est relancée..")
    .setFooter('Emilia Radio Anime')
    msg.channel.send(resume);
    dispatcher.resume();
  }

  if (command == 'pause') {
    const pause = new Discord.MessageEmbed()
    .setColor('#0066ff')
    .setDescription("La musique est maintenant en pause..")
    .setFooter('Emilia Radio Anime')
    msg.channel.send(pause);
    dispatcher.pause();
  }

  if (command == 'skip') {
    const skip = new Discord.MessageEmbed()
    .setColor('#0066ff')
    .setDescription('Je viens de passé la musique `' + audio + '` ')
    .setFooter('Emilia Radio Anime')
    msg.channel.send(skip);
    dispatcher.pause();
    dispatcher = null;
    playAudio();
  }

  if (command == 'leave') {
    voiceChannel = bot.channels.cache.get(config.voiceChannel);
    if (!voiceChannel) return console.error('Le salon vocal n\'existe pas');
    const leave = new Discord.MessageEmbed()
    .setColor('#0066ff')
    .setDescription("Je me déconnecte du salon vocal..")
    .setFooter('Emilia Radio Anime')
    msg.channel.send(leave);
    dispatcher.destroy();
    voiceChannel.leave();
  }

  if (command == 'stop') {
    await msg.reply('Re-démarrage du bot...');
    const statusEmbed = new Discord.MessageEmbed()
    .setAuthor(`${bot.user.username}`, bot.user.avatarURL())
    .setDescription(`Tout a fonctionné ! Re-démarrage de ${bot.user.username}...`)
    .setColor('#0066ff')
    let statusChannel = bot.channels.cache.get(config.statusChannel);
    if (!statusChannel) return console.error('Erreur dans le redémarrage !');
    await statusChannel.send(statusEmbed);
    dispatcher.destroy();
    bot.destroy();
    process.exit(0);
  }

});
