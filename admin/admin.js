import fetch from 'node-fetch';
import { Client, Intents, MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } from 'discord.js';

export default function adminfuncoes(client) {


    ////////// ADMIN ///////////
    let interactiveMessage = null;
    let timeoutDELconfirmacao = null;
    let realizarAcao_timeout = null;
    let embedconfirmacaoID = null;

    client.on('messageCreate', (message) => {
        if (!message.author.bot) {
            if (message.content === '!menu') {
                message.delete()
                enviarEmbedInterativo(message.channelId);
            }
        }
    });

    async function enviarEmbedInterativo(channelId) {
        try {
            const channel = await client.channels.fetch(channelId);

            const embed = new MessageEmbed()
                .setTitle('🖲 COMANDOS ADMIN DO SERVIDOR DO CAMPEONATO')
                .setDescription(
                    '⌨ Comandos que só você pode executar no servidor do discord. Confira o que você pode realizar clicando no menu abaixo e escolhendo uma opção 😉'
                )
                .setColor(0x00FFFF)
                .setImage('https://i.imgur.com/S7I6CvC.png')

            const row = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('menu_admin')
                    .setPlaceholder('ESCOLHA UMA OPÇÃO')
                    .addOptions({
                        label: 'Excluir todas as salas dos times e seus cargos.',
                        value: 'excluir_tudo',
                        description: 'Delete todas as salas e cargos de todos os times cadastrados no campeonato.',
                        emoji: { name: '❌' },
                    })
            );

            interactiveMessage = await channel.send({ content: ' ', tts: false, components: [row], embeds: [embed] });
        } catch (error) {
            console.error('Erro ao enviar o embed interativo:', error);
        }
    }

    client.on('interactionCreate', async (interaction) => {


        if (interaction.channelId !== '1149521388529524766') {
            // evita atrapalhar comandos de outros canais. Se nao for o canal certo não faz nada
            return;
        }

        if (interaction.isSelectMenu()) {

            if (interaction.customId === 'menu_admin' && interaction.values[0] === 'excluir_tudo') {
                let menu = interaction.message.components[0].components[0]

                menu.disabled = true
                menu.setPlaceholder(menu.options.find(m => m.value == interaction.values[0]).label)
                interaction.message.edit({ components: interaction.message.components })


                interaction.reply({
                    components: [
                        {
                            type: 1,
                            components: [
                                {
                                    style: 4,
                                    label: 'CANCELAR',
                                    custom_id: `cancelar_excluirtudo_${interaction.message.id}`,
                                    disabled: false,
                                    type: 2,
                                },
                                {
                                    style: 3,
                                    label: 'CONTINUAR',
                                    custom_id: `continuar_excluirtudo_${interaction.message.id}`,
                                    disabled: false,
                                    type: 2,
                                },
                            ],
                        },
                    ],
                    embeds: [
                        {
                            type: 'rich',
                            title: 'VOCÊ TEM CERTEZA QUE DESEJA REALIZAR ESSA AÇÃO ?',
                            description:
                                'CUIDADO AO REALIZAR ESSA AÇÃO, VOCÊ IRÁ EXCLUIR TODOS OS CARGOS E SALAS DE TODOS OS TIMES DO CAMPEONATO DO SERVIDOR DA U4NTED CUP!',
                            color: 0xebe00b,
                            thumbnail: {
                                url: 'https://i.imgur.com/gThwqfV.png',
                                height: 0,
                                width: 0,
                            },
                        },
                    ],
                })

                timeoutDELconfirmacao = setTimeout(() => {
                    if (interactiveMessage) {
                        interactiveMessage.fetch()
                            .then((message) => {
                                if (message.components && message.components.length > 0 && message.components[0].components && message.components[0].components.length > 0) {
                                    message.components[0].components[0].disabled = false;
                                    message.edit({ components: message.components });
                                } else {
                                    console.error('A mensagem não possui a estrutura de componentes esperada.');
                                }
                            })
                            .catch(console.error);
                        interaction.deleteReply().catch(console.error);
                    } else {
                        console.error('A mensagem interativa não está definida.');
                    }
                }, 10000);





            }
        }


        if (interaction.isButton()) {
            interaction.message.delete()
            clearTimeout(timeoutDELconfirmacao);


            if (interaction.customId.includes('cancelar_excluirtudo')) {
                interaction.channel.messages.fetch(interaction.customId.replace('cancelar_excluirtudo_', '')).then((message) => {
                    message.components[0].components[0].disabled = false
                    message.edit({ components: message.components })
                })

            } else if (interaction.customId.includes('continuar_excluirtudo')) {
                interaction.channel.messages.fetch(interaction.customId.replace('continuar_excluirtudo_', '')).then((message) => {
                    message.components[0].components[0].disabled = false;
                    message.edit({ components: message.components });

                    interaction.channel.send({
                        tts: false,
                        embeds: [
                            {
                                type: 'rich',
                                title: 'PARA REALIZAR A AÇÃO, DIGITE A SENHA DO FUNDADOR DO CAMPEONATO',
                                description: '',
                                color: 0x00FFFF,
                                fields: [
                                    {
                                        name: 'Dica:',
                                        value: 'cauge',
                                    },
                                ],
                                thumbnail: {
                                    url: 'https://i.imgur.com/IAOX9Xf.png',
                                    height: 0,
                                    width: 0,
                                },
                            },
                        ],
                    }).then((sentMessage) => {
                        embedconfirmacaoID = sentMessage.id;

                        realizarAcao_timeout = setTimeout(() => {

                            if (embedconfirmacaoID === sentMessage.id) {
                                interaction.channel.messages.delete(sentMessage.id)
                                    .then(() => {
                                        console.log(`Mensagem com ID ${sentMessage.id} foi excluída.`);
                                    })
                                    .catch(console.error);

                                embedconfirmacaoID = null;
                            }
                        }, 15000);
                    });
                });
            }

        }

    });


    client.on('messageCreate', (message) => {
        if (message.channelId === '1149521388529524766') {
            if (!embedconfirmacaoID) {

                // VERIFICO SE A MENSAGEM NAO É DO BOT 
                if (!message.author.bot) {
                    // EXCLUO A MSG
                    message.delete()
                        .then(() => {
                            console.log('Mensagem excluída:', message.content);
                        })
                        .catch(console.error);
                }
            } else {
                if (message.content.toLowerCase() === 'caugelandrade' && !message.author.bot) {
                    message.delete();

                    message.channel.send({
                        tts: false,
                        embeds: [
                            {
                                type: 'rich',
                                title: 'COMANDO EXECUTADO COM SUCESSO!',
                                description: '',
                                color: 0x00ff00,
                                fields: [
                                    {
                                        name: 'E AGORA ?',
                                        value: 'Todas as salas e cargos do servidor estão sendo deletados',
                                    },
                                ],
                                thumbnail: {
                                    url: 'https://i.imgur.com/VpGHnB0.png',
                                    height: 0,
                                    width: 0,
                                },
                            },
                        ],
                    }).then((sentMessage) => {
                        setTimeout(() => {
                            sentMessage.delete().catch((error) => {
                                console.error(`Erro ao deletar mensagem do embed: ${error}`);
                            });
                        }, 8000);
                    });

                    deleteAllRolesAndCategories(message.guild);
                }


                else if (!message.author.bot) {

                    clearTimeout(realizarAcao_timeout);

                    if (embedconfirmacaoID) {
                        message.channel.messages
                            .delete(embedconfirmacaoID)

                            .catch((error) => {
                                console.error(`Erro ao deletar mensagem: ${error}`);
                            });
                    }

                    message.delete();
                    message.channel.send({
                        tts: false,
                        embeds: [
                            {
                                type: 'rich',
                                title: 'SENHA INCORRETA!',
                                description: '',
                                color: 0xff0000,
                                fields: [
                                    {
                                        name: 'ESQUECEU A SENHA ?',
                                        value: 'Fale com Andrade.',
                                    },
                                ],
                                thumbnail: {
                                    url: 'https://i.imgur.com/8dfdUAx.png',
                                    height: 0,
                                    width: 0,
                                },
                            },
                        ],
                    }).then((sentMessage) => {
                        setTimeout(() => {
                            sentMessage.delete().catch((error) => {
                                console.error(`Erro ao deletar mensagem: ${error}`);
                            });
                        }, 3000);
                    });
                }
            }
        }
    });

}
////////// ADMIN ///////////






////////// FUNCOES ///////////
////////// FUNCOES ///////////
////////// FUNCOES ///////////
////////// FUNCOES ///////////

//DELETAR CARGOS E SALAS
async function deleteAllRolesAndCategories(guild) {
    const roleIdsToKeep = ['1102203129803575396', '1102378653024788531', '1118929533765173298'];
    const emojiToDelete = ['🟥', '🟩', '🟦', '🟪', '🔵', '🟨', '🟧', '🟫', '🟣', '🔴', '🟢', '🟣', '🟧', '🟩', '🟪', '🟦'];

    try {
        // pega todos os cargos do servidor
        const roles = await guild.roles.fetch();

        roles.forEach(async (role) => {
            if (!roleIdsToKeep.includes(role.id)) {
                try {
                    await role.delete();
                    console.log(`Cargo ${role.name} excluído com sucesso.`);
                } catch (error) {
                    console.error(`Erro ao excluir o cargo ${role.name}: ${error.message}`);
                }
            }
        });

        // pega todos os canais do servidor
        const channels = guild.channels.cache;

        for (const channel of channels) {
            const channelObj = channel[1];

            if (channelObj.type === 'GUILD_CATEGORY') {
                const categoryName = channelObj.name;

                if (emojiToDelete.some((emoji) => categoryName.startsWith(emoji))) {
                    try {
                        // pega todos os canais na categoria e deleta
                        const categoryChannels = guild.channels.cache.filter(
                            (channel) => channel.parentId === channelObj.id
                        );

                        categoryChannels.forEach(async (channel) => {
                            await channel.delete();
                            console.log(`Canal ${channel.name} na categoria ${categoryName} excluído com sucesso.`);
                        });

                        // deleta a categoria diretamente
                        await guild.channels.delete(channelObj.id);
                        console.log(`Categoria ${categoryName} excluída com sucesso.`);
                    } catch (error) {
                        console.error(`Erro ao excluir a categoria ${categoryName}: ${error.message}`);
                    }
                }
            }
        }

        console.log('Cargos e categorias excluídos com sucesso.');
    } catch (error) {
        console.error('Erro ao excluir cargos e categorias:', error);
    }
}