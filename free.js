import { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';

export default function setupFreeAgentInteraction(client) {
  function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;



    if (interaction.customId === 'free_agent_button') {
      const user = interaction.user;
      const guild = interaction.guild;

      const questions = [
        'Qual o seu nick ?',
        'Qual o seu nome ?',
        'Qual a sua idade ?',
        'Qual o seu perfil steam ?',
        'Qual o seu perfil da GC ?',
        'Quantas horas de jogo você tem ?',
      ];

      let currentQuestionIndex = 0;
      let createdChannel;

      const sendNextQuestion = async (currentQuestionIndex) => {
        if (currentQuestionIndex < questions.length) {
          const questionEmbed = new MessageEmbed()
            .setTitle('Pergunta ' + (currentQuestionIndex + 1))
            .setColor('#00b159')
            .setDescription(questions[currentQuestionIndex]);

          await createdChannel.send({ embeds: [questionEmbed] });
        }
      };

      const initialMessage = new MessageEmbed()
        .setTitle('Vamos começar o cadastro')
        .setColor('#00b159')
        .setDescription(
          'O bot irá fazer perguntas, responda todas corretamente. Essas informações serão colocadas no canal de FreeAgents para os times saberem suas habilidades 😋\n\n' +
          'Cuidado! Responda as perguntas corretamente.'
        )
        .setImage('https://i.imgur.com/QjJyNDT.png')
        .setFooter({ text: 'Clique no botão abaixo para cancelar' });

      try {

        // CANAL DE DESTINO QUE O BOT DEVE ENVIAR AS PERGUNTAS 
        const targetChannel = await guild.channels.fetch('1149524165766942740');

        const category = targetChannel.parent;

        // cria o novo canal de texto dentro da categoria
        createdChannel = await guild.channels.create(`FreeAgent-${user.username}`, {
          type: 'GUILD_TEXT',
          parent: category,
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: ['VIEW_CHANNEL'],
            },
            {
              id: user.id,
              allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
            },
          ],
        });

        await createdChannel.setPosition(targetChannel.position);




        const message = await createdChannel.send({
          embeds: [initialMessage],
          components: [
            new MessageActionRow().addComponents(
              new MessageButton()
                .setCustomId('cancel_button')
                .setLabel('Cancelar')
                .setStyle('DANGER')
            ),
          ],
        });

        await interaction.reply({
          tts: false,
          embeds: [
            {
              type: "rich",
              title: `UM CANAL DE TEXTO SÓ COM VOCÊ FOI CRIADO!`,
              description: `📃 Complete a sua inscrição de free agent acessando o novo canal de texto que foi criado para você.`,
              color: 0x2bff00,
              fields: [
                {
                  name: `📣 O CANAL DE TEXTO CRIADO FOI ESSE:`,
                  value: `<#${createdChannel.id}>`,
                },
              ],
              thumbnail: {
                url: `https://i.imgur.com/fzR9Bq5.png`,
                height: 0,
                width: 0,
              },
            },
          ],
          ephemeral: true,
        });


        setTimeout(async () => {
          try {
            // Verifica se a msg de resposta ainda existe
            const repliedMessage = await interaction.fetchReply();
            if (repliedMessage) {
              await interaction.deleteReply();
            }

          } catch (error) {
            console.error('Erro ao excluir a mensagem de resposta:', error);
          }
        }, 15000);

        // chama a funcao para começar as perguntas
        sendNextQuestion(currentQuestionIndex);

        const messageFilter = (msg) => msg.author.id === user.id;
        const messageCollector = createdChannel.createMessageCollector({
          filter: messageFilter,
          max: questions.length,
          time: 120000,
        });

        // armazena as respostas do user
        const userAnswers = [];

        messageCollector.on('collect', async (userMessage) => {
          userAnswers.push(userMessage);

          currentQuestionIndex++;

          if (currentQuestionIndex < questions.length) {
            sendNextQuestion(currentQuestionIndex);
          } else {
            messageCollector.stop();
          }
        });

        messageCollector.on('end', async (collected, reason) => {
          if (reason === 'time') {
            // limite de tempo
            await createdChannel.send('Você excedeu o limite de tempo para responder a esta pergunta.');

            // exclui o canal de texto
            await createdChannel.delete();
          } else if (reason === 'user') {

            const randomColor = getRandomColor();
            const successEmbed = new MessageEmbed()
              .setTitle(`O jogador ${userAnswers[0].content} está disponível como Free Agent.`)
              .setDescription('Informações do jogador:')
              .setColor(randomColor)
              .addFields(
                { name: 'NICK', value: userAnswers[0].content },
                { name: 'NOME', value: userAnswers[1].content },
                { name: 'IDADE', value: userAnswers[2].content },
                { name: 'PERFIL STEAM', value: userAnswers[3].content },
                { name: 'PERFIL GC', value: userAnswers[4].content },
                { name: 'HORAS DE JOGO (CS)', value: userAnswers[5].content },
                { name: 'DISCORD DE ' + userAnswers[0].content, value: `<@${user.id}>` }
              )
              .setTimestamp()
              .setFooter({
                text: 'Jogador Free Agent',
                iconURL: 'https://i.imgur.com/zJWJeL9.png',
              })
              .setThumbnail('https://i.imgur.com/TuawEd1.png');

            try {
              const channel = await guild.channels.fetch('1147997740790452336');
              await channel.send({ embeds: [successEmbed] });
            } catch (error) {
              console.error('Erro ao enviar mensagem no canal de texto:', error);
            }

            // envia msg no privado do usuario
            const confirmationEmbed = new MessageEmbed()
              .setTitle(`VOCÊ FOI REGISTRADO COM SUCESSO!`)
              .setDescription(`VOCÊ FOI REGISTRADO COMO FREE AGENT NO CAMPEONATO.`)
              .setColor(0x33ff00)
              .addFields(
                {
                  name: `E AGORA ?`,
                  value: `AGORA SUAS INFORMAÇÕES ESTÃO DISPONÍVEIS NO CANAL DE TEXTO [#🦸┃𝗣𝗟𝗔𝗬𝗘𝗥𝗦](https://discord.com/channels/1102194865544102042/1147408810403696660)`,
                }
              )
              .setImage('https://i.imgur.com/QjJyNDT.png')
              .setFooter({
                text: `EM BREVE ALGUM TIME PODERÁ ENTRAR EM CONTATO COM VOCÊ VIA DISCORD OU ATÉ MESMO PELA STEAM.`,
              });

            try {
              await user.send({ embeds: [confirmationEmbed] });
            } catch (error) {
              console.error('Erro ao enviar mensagem privada:', error);
            }

            await createdChannel.delete();
          }
        });

        // ouvinte do click do usuario
        const filter = (i) => i.customId === 'cancel_button' && i.user.id === user.id;
        const collector = message.createMessageComponentCollector({ filter });

        collector.on('collect', async (buttonInteraction) => {
          await createdChannel.delete();
          await buttonInteraction.reply({ content: 'Você cancelou o processo de cadastro.', ephemeral: true });
        });

        collector.on('end', () => {
        });

      } catch (error) {
        console.error('Erro ao criar canal de Free Agent:', error);
        interaction.reply({ content: 'Ocorreu um erro ao criar o canal de Free Agent.', ephemeral: true });
      }
    }
  });
}



