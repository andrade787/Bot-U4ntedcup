import fetch from 'node-fetch';
import { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';

export default function cadastro(client) {

  const cooldowns = new Set(); // Rastrear usuários em cooldown
  client.on('messageCreate', async (message) => {
    if (message.channel.id === '1148002398447607888') {
      const userId = message.author.id;
      const channel = message.channel;
      const userMessage = message.content;
      let nomeTime = '';
      let key = '';
      let data;

      try {
        const response = await fetch('https://u4ntedcup.com/inscricao/times.json');
        data = await response.json();

        if (data && data.times) {
          const existingRole = message.member.roles.cache.find((role) =>
            data.times.some((time) => role.name === time.nome)
          );

          if (existingRole) {
            const user = await message.author.fetch();
            await user.send({
              embeds: [
                {
                  type: 'rich',
                  title: 'USUÁRIO JÁ CADASTRADO',
                  description:
                    '❗ VOCÊ JÁ ESTÁ CADASTRADO ❗\n\n❌ ❌ SE VOCÊ CONTINUAR SOLICITANDO CADASTRO SERÁ BANIDO DO DISCORD DA U4NTED CUP! \n❌❌',
                  color: 0xfd0505,
                  thumbnail: {
                    url: 'https://i.imgur.com/hcXZFzh.png',
                    height: 0,
                    width: 0,
                  },
                  footer: {
                    text:
                      '❗ NÃO CONTINUE SOLICITANDO CADASTRO PARA NÃO LEVAR BAN DO DISCORD DO CAMPEONATO. SUJEITO A SER ELIMINADO DA COMPETIÇÃO.',
                  },
                },
              ],
            });
            message.delete();
          } else {
            let codeFound = false;

            // VERIFICA os códigos e coloca cargos e nicknames
            for (const time of data.times) {
              for (const jogador of time.jogadores) {
                for (const jogadorKey in jogador) {
                  if (jogador[jogadorKey] === userMessage) {
                    message.member.setNickname(jogadorKey);
                    nomeTime = time.nome;
                    key = jogadorKey;

                    const cargo = message.guild.roles.cache.find((role) => role.name === nomeTime);

                    if (cargo) {
                      message.member.roles.add(cargo);
                    }

                    // Remove a sobrescrita de permissão dps de adicionar o cargo
                    await channel.permissionOverwrites.edit(userId, {
                      SEND_MESSAGES: false,
                    });

                    message.delete();

                    codeFound = true;
                    break;
                  }
                }
                if (codeFound) break;
              }
              if (codeFound) break;
            }

            if (!codeFound) {
              const user = await message.author.fetch();
              await user.send({
                embeds: [
                  {
                    type: 'rich',
                    title: 'REGISTRO DE JOGADOR FALHOU',
                    description:
                      'O CÓDIGO QUE VOCÊ COLOCOU NÃO BATE COM NENHUM TIME CADASTRADO NA U4NTED CUP.',
                    color: 0xfd0505,
                    fields: [
                      {
                        name: 'O QUE FAÇO ?',
                        value: 'Fale com o líder do seu time para lhe enviar o código de verificação certo!',
                      },
                    ],
                    thumbnail: {
                      url: 'https://i.imgur.com/8dfdUAx.png',
                      height: 0,
                      width: 0,
                    },
                    footer: {
                      text:
                        'CÓDIGO DO ERRO: AX300 - ENVIE O CÓDIGO DESSE ERRO PARA A ADM DO CAMPEONATO SE ACHA QUE TEM ALGO DE ERRADO',
                      proxy_icon_url: 'https://i.imgur.com/8dfdUAx.png',
                    },
                  },
                ],
              });

              // cria uma sobrescrita de permissão para bloquear o usuário no canal
              await channel.permissionOverwrites.edit(userId, {
                SEND_MESSAGES: false,
              });


              // tira a sobrescrita de permissão após 1 minuto
              setTimeout(async () => {
                try {
                  await channel.permissionOverwrites.edit(userId, {
                    SEND_MESSAGES: null, // remove a sobrescrita
                  });
                } catch (error) {
                  console.error('Erro ao remover sobrescrita de permissão:', error);
                }
              }, 5000);


              message.delete();
            } else {
              const user = await message.author.fetch();
              await user.send({
                "embeds": [
                  {
                    "type": "rich",
                    "title": "VOCÊ FOI REGISTRADO COM SUCESSO NO SERVIDOR DO CAMPEONATO!",
                    "description": "",
                    "color": 0x2bff00, // verde
                    "fields": [
                      {
                        "name": "SEU CARGO FOI ALTERADO PARA",
                        "value": `#${nomeTime}`
                      },
                      {
                        "name": "SEU NOME FOI ALTERADO PARA",
                        "value": `\`${key}\``
                      }
                    ],
                    "image": {
                      "url": "https://i.imgur.com/zJWJeL9.png",
                      "height": 0,
                      "width": 0
                    },
                    "thumbnail": {
                      "url": "https://i.imgur.com/fzR9Bq5.png",
                      "height": 0,
                      "width": 0
                    }
                  }
                ],
              });


            }
          }
        } else {
          console.error('JSON data does not contain the expected structure.');
        }
      } catch (error) {
        console.error('Erro ao buscar o JSON:', error);
      }
    }
  });



}