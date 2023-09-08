import { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';
import fetch from 'node-fetch';
import Discord from 'discord.js';

import setupFreeAgentInteraction from './free.js'; //Funcoes FreeAgent
import { fetchJsonData, vertime, fetchJsonDataPeriodically } from './sincronizacao.js'; //Sincronização com banco de dados dos times cadastrados
import adminfuncoes from './admin/admin.js'; //Funcoes ADMIN
import cadastro from './cadastro/cadastro.js'; //CADASTRO DE USER (USA BANCO DE DADOS DO SITE PARA SABER SE ELE ESTÁ CADASTRADO NO CAMPEONATO)




const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES], });
const token = '#';


client.on('ready', () => {
  console.log(`Bot está logado como ${client.user.tag}`);
  const guild = client.guilds.cache.get('1102194865544102042'); // ID do servidor
  fetchJsonDataPeriodically(guild, client); // BUSCA PERIODICA DE TIMES NO JSON
  adminfuncoes(client); //CHAMA FUNCOES DE ADMIN
  setupFreeAgentInteraction(client); //CHAMA A FUNCAO DE freeAgent
  cadastro(client); //CHAMA A FUNCAO DE cadastro do usuario cadastrado no site no discord e verifica se ele está cadastrado no campeonato
});





// Função para enviar a mensagem embed com o botão "Ficar Free Agent"
async function sendFreeAgentEmbed(client) {
  const channelId = '1149524165766942740'; // Substitua pelo ID do canal desejado

  const embed = new MessageEmbed()
    .setTitle('VOCÊ ESTÁ FREE AGENT PROCURANDO UM TIME ?')
    .setColor('#3498db') // Cor azul
    .setDescription('Você pode se inscrever aqui para ficar free agent na U4nted Cup e ser chamado por algum time ANTES ou até DURANTE o campeonato!')
    .setImage('https://i.imgur.com/9xtLCK7.png')

  const button = new MessageButton()
    .setStyle('SUCCESS') // Estilo verde
    .setLabel('Ficar Free Agent')
    .setCustomId('free_agent_button');

  const row = new MessageActionRow().addComponents(button);

  const channel = await client.channels.fetch(channelId);

  if (channel && channel.isText()) {
    channel.send({ embeds: [embed], components: [row] });
  } else {
    console.error('Canal não encontrado ou não é um canal de texto.');
  }
}

// Chame a função no evento 'messageCreate' quando o comando !botaofreeagent for enviado
client.on('messageCreate', (message) => {
  if (message.content === 'a') {
    sendFreeAgentEmbed(client);
  }
});




client.on('error', (error) => {
  console.error('Ocorreu um erro:', error);
});

client.on('debug', (info) => {
  console.log('Informações de depuração:', info);
});

client.login(token);
