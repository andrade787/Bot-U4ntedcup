import fetch from 'node-fetch';
import { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';

// array pra usar de filtro
const teamColors = [
  { color: '#FF5733', emoji: '🟥' },
  { color: '#33FF57', emoji: '🟩' },
  { color: '#5733FF', emoji: '🟦' },
  { color: '#FF33FF', emoji: '🟪' },
  { color: '#33FFFF', emoji: '🔵' },
  { color: '#FFFF33', emoji: '🟨' },
  { color: '#FF9933', emoji: '🟧' },
  { color: '#3399FF', emoji: '🟫' },
  { color: '#FF6633', emoji: '🟣' },
  { color: '#FF3366', emoji: '🔴' },
  { color: '#33FF99', emoji: '🟢' },
  { color: '#9966FF', emoji: '🟣' },
  { color: '#FF9966', emoji: '🟧' },
  { color: '#66FF99', emoji: '🟩' },
  { color: '#9966CC', emoji: '🟪' },
  { color: '#33CC99', emoji: '🟦' },
];

// funcao para criar a categoria, cargo e canais
async function createTeamCategory(guild, teamName, teamIndex, client) {
  const existingRole = guild.roles && guild.roles.cache.find((role) => {
    return role.name === teamName;
  });

  const existingCategory = guild.channels && guild.channels.cache.find((channel) => {
    return channel.type === 'GUILD_CATEGORY' && channel.name === teamName;
  });

  if (existingRole || existingCategory) {
    if (existingCategory) {
      const textChannel = existingCategory.children.find((channel) => channel.type === 'GUILD_TEXT');
      if (textChannel) {
        return { category: existingCategory, textChannel, teamName, teamIndex };
      }
    }
    return existingRole || existingCategory;
  }

  const teamColor = teamColors[teamIndex % teamColors.length];

  // referencia pros cargos e categorias
  const teamRole = await guild.roles.create({
    name: teamName,
    color: teamColor.color,
    hoist: true,
  });

  const category = await guild.channels.create(`${teamColors[teamIndex % teamColors.length].emoji} ${teamName}`, {
    type: 'GUILD_CATEGORY',
    permissionOverwrites: [
      {
        id: guild.roles.everyone.id,
        deny: ['VIEW_CHANNEL'],
      },
      {
        id: client.user.id,
        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
      },
      {
        id: teamRole.id,
        allow: ['VIEW_CHANNEL'],
      },
    ],
  });




  // categoria que o usuario nao deve mais ver dps do cadastro
  const specificCategory = guild.channels.cache.get('1148001850889609276');

  if (specificCategory) {
    // muda as permissões da categoria para o novo cargo nao ver mais a sala de cadastro
    await specificCategory.permissionOverwrites.edit(teamRole, {
      VIEW_CHANNEL: false,
    });
  }

  // canal de texto que o usuario nao deve mais ver dps do cadastro
  const specificTextChannel = guild.channels.cache.get('1148002398447607888');

  if (specificTextChannel) {
    // muda as permissoes pra ele nao ver mais o canal de texto de cadastro
    await specificTextChannel.permissionOverwrites.edit(teamRole, {
      VIEW_CHANNEL: false,
    });
  }





  const textChannel = await guild.channels.create('💬┃𝗖𝗵𝗮𝘁', {
    type: 'GUILD_TEXT',
    parent: category.id,
  });

  const voiceChannel = await guild.channels.create('🔊┃VOICE', {
    type: 'GUILD_VOICE',
    parent: category.id,
  });

  return { category, textChannel, teamName, teamIndex };
}


async function sendEmbedMessage(textChannel, teamName, emoji, teamIndex) {
  const embed = new MessageEmbed()
    .setTitle(`:white_check_mark: A SALA DO SEU TIME FOI GERADA :white_check_mark:`)
    .setColor('#00b159')
    .setDescription(
      `:yellow_square: Nesse canal de texto, será enviado o link para o capitão do time vetar o mapa ao vivo durante a transmissão.\n *Somente o capitão do time terá acesso ao link, caso os outros jogadores queiram ver o veto do mapa transmita para eles a sua tela.*\n\n:blue_square: Aqui também será enviado o link para vocês acessarem a partida de vocês assim que o veto de mapas acabar.\n Vocês terão 5 minutos para entrar na partida, caso contrário perderão a partida por W.O.\n\n *Seu login e senha do pickban dos mapas:\n🔑Login: ${teamName}\n🔒Senha: senha${teamIndex}`
    );

  textChannel.send({ embeds: [embed] });
}

// PEGA O JSON PELA URL
async function fetchJsonData(guild, client) {
  try {
    const response = await fetch('https://u4ntedcup.com/inscricao/times.json');
    const data = await response.json();
    console.log('Dados JSON obtidos:', data);

    let teamIndex = 0;

    for (const team of data.times) {
      const categoryName = team.nome;
      const categoryInfo = await createTeamCategory(guild, categoryName, teamIndex, client);

      if (categoryInfo.textChannel) {
        await sendEmbedMessage(categoryInfo.textChannel, categoryName, team.nick, team.senha);
      }

      teamIndex++;
    }
  } catch (error) {
    console.error('Erro ao obter JSON:', error);
  }
}

// busca o json a cada 1 minuto
function fetchJsonDataPeriodically(guild, client) {
  fetchJsonData(guild, client);

  setInterval(() => fetchJsonData(guild, client), 60000);
}

// funcao para buscar o json ignorando o timer de 1 minuto
function vertime(guild, client) {
  fetchJsonData(guild, client);

}


export { fetchJsonData, vertime, fetchJsonDataPeriodically };
