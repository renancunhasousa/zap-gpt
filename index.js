import { create } from 'venom-bot'
import * as dotenv from 'dotenv-safe'
import { Configuration, OpenAIApi } from "openai"

dotenv.config()



let defaultSection = [];
let premiumSection = [];
let vipSection = [];
const maxMessages = {
    default: 5,
    premium: 25,
    VIP: 50
}

const addAuthorizedUser = (section, number) => {
    if (section === "default") {
        defaultSection.push(number);
    } else if (section === "premium") {
        premiumSection.push(number);
    } else if (section === "VIP") {
        vipSection.push(number);
    }
};

addAuthorizedUser("premium", process.env.PREMIUM_NUMBER);
addAuthorizedUser("VIP", process.env.VIP_NUMBER);


//inicia a seessão com openai
create({
    session: 'Chat-GPT',
    multidevice: true,
    logQR: true
})
    .then((client) => start(client))
    .catch((erro) => {
        console.log(erro);
    });

const configuration = new Configuration({
    organization: process.env.ORGANIZATION_ID,
    apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

const getDavinciResponse = async (clientText) => {
    const options = {
        model: "text-davinci-003", // Modelo GPT a ser usado
        prompt: clientText, // Texto enviado pelo usuário
        temperature: 1, // Nível de variação das respostas geradas, 1 é o máximo
        max_tokens: 750 // Quantidade de tokens (palavras) a serem retornadas pelo bot, 4000 é o máximo
    }

    try {
        const response = await openai.createCompletion(options)
        let botResponse = ""
        response.data.choices.forEach(({ text }) => {
            botResponse += text
        })
        return `Chat GPT 🤖\n\n ${botResponse.trim()}`
    } catch (e) {
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`
    }
}

const getDalleResponse = async (clientText) => {
    const options = {
        prompt: clientText, // Descrição da imagem
        n: 1, // Número de imagens a serem geradas
        size: "1024x1024", // Tamanho da imagem
    }

    try {
        const response = await openai.createImage(options);
        return response.data.data[0].url
    } catch (e) {
        return `❌ OpenAI Response Error: ${e.response.data.error.message}`
    }
}

let messageCount = {}; 
let authorizedNumbers = [];

const commands = (client, message) => {
    
    let section = "default";

    // Verifique se o número está autorizado em uma das seções
    
    if (premiumSection.includes(message.from)) {
        section = "premium";
    } else if (vipSection.includes(message.from)) {
        section = "VIP";
    }

    // Se o número não estiver autorizado em nenhuma seção, envie a mensagem de erro
    if (!section) {
        client.sendText(message.from,
            "*Olá sou o ChatGPT ByRC* 🤖\n\nDesculpe 😥, " +
            "verifiquei aqui que você não está autorizado a usar este *BOT*!" +
            "Seu número de telefone não está em nossa base de dados, mas...\n\n" +
            "Não se preocupe! Caso queira usar nossas funcionalidades" +
            "deixe seu interesse com número de _WhatsApp_ aqui!👇\n\n" +
            "Para mais informações:\n✉re.sousa@live.com\n📷@renancunha.ai_art");
        return;
    }

    const remainingMessages = maxMessages[section] - (messageCount[message.from] || 1); // número de mensagens restantes é igual ao máximo menos o número de mensagens enviadas
    const usedMessages = maxMessages[section] - remainingMessages;             
    const numMessage = `\n\n\n\nMensagens 💬: *${usedMessages}* de *${maxMessages[section]}*.\nRestam *${remainingMessages}* interações por hoje!`

    // Verifique se o número já foi autorizado antes
    if (!authorizedNumbers.includes(message.from)) {
        // Armazena o número como autorizado
        authorizedNumbers.push(message.from);
        
         client.sendText(message.from, 
            "*Olá! Seja muito Bem-vindo ao ChatGPT ByRC* 🤖\n\n"+
            "Estou ansioso para lhe ajudar!\n\nAtualmente estamos limitando a 5️⃣ interações gratuitas por dia!\n\n"+
            "Estamos em processo de melhoria e criação de planos pois o uso do ChatGPT é um serviço pago"+
            "quando usado através de outras plataformas como WhatsApp!\n\n"+
            "Recados importantes sobre a interação:\n\n"+
            "🔴 Minha base de dados é limitada com informações até 2021.\n"+
            "🔴 Tenho capacidade de receber e enviar informações de até aproximadamente 350 palavras\n"+
            "🔴 As 00h o contador de mensagens diárias é resetado, ou se consome um dia do plano pago"+
            "\n\n"+
            "Que tal começarmos da seguinte forma...\n\n"+
            "Inicie vendo as informações & recados de como utilizar o bot digitando apenas:\n\n👇👇👇\n\n"+
            "*.info*\n\n"+
            "_As mensagens enviadas ao bot serão descontadas do limite *diário* quando usado *.bot* e *.img*_");

               
        } else if (message.body === ".info") {
            // Envia a mensagem de ajuda
            client.sendText(message.from, 
                "*Recados ChatGPT ByRC*\n\n🤖\n\n"+
                "*--Funções--*\n\n"+
                "1️⃣ Me pergunte qualquer coisa iniciando a mensagem com o comando *.bot*\n"+
                "-Ex: .bot O que é um Android?\n\n"+
                "2️⃣ Para criar uma imagem inicie sua descrição com o comando *.img*\n"+
                "-Ex: .img Homem andando na lua.\n\n"+
                "3️⃣ Para obter a lista de comandos e informações atualizadas do bot digite apenas *.info*\n\n"+
                "4️⃣ Para obter informações dos planos, digite apenas *.plano*\n\n"+
                "*--Informações--*\n\n"+
                "❗ Bot está em período de testes, podem haver instabilidades ou demora nas respostas.\n"+
                "❗ A utilização do ChatGPT é um serviço pago quando oferecido através de outras plataformas, "+
                "temos a intenção de criar planos para uso ilimitado Precisamos saber do seu interesse.\n"+
                "❗ Pretendemos incluir outras funcionalidades como criação de stickers automatica, respostas por voz, etc.\n"+
                "❗ Mais informações sobre status do BOT, informações atualizadas entre outras, "+
                "procure na descrição do contato do número vinculado ao BOT.\n"+
                "❗ Para contato direto, contribuições e/ou algum feedback entre em contato:\n\n"+
                "✉re.sousa@live.com\n📷@renancunha.ai_art");
              
                  
        } else if (message.body === ".plano") {
                const getMaxMessagesMessage = (remainingMessages) => {
                    return `Olá 🤖!\n\nVocê está no plano 📄 *${section}*\n\n`+
                    `Confira os planos disponíveis:\n\n`+
                    `Plano *Default*: \n💬 5 interações diárias |\n 💰 Free.\n\n`+
                    `Plano *Premium*: \n💬 25 interações diárias |\n 💰 19,90.\n\n`+
                    `Plano *VIP*: \n💬 50 interações diárias |\n 💰 39,90.\n\n`+
                    `_Os planos são válidos por 30 dias consecutivos a partir da data de adesão_`+
                    `\n\n👇 entre em contato 👇\n\n`+
                    `✉re.sousa@live.com\n📷@renancunha.ai_art`
                }

                const messageToSend = getMaxMessagesMessage(remainingMessages);
                client.sendText(message.from, messageToSend);

            } else if (messageCount[message.from] > maxMessages[section] && !message.fromMe && message.body !== '.reset') {
                const response = 
                "*Desculpe!*\n\n 😣🤖😣\n\nVocê atingiu o limite diário de mensagens permitidas."+
                " Tente novamente amanhã ou entre em contato para obter mais informações"+
                " sobre os planos disponíveis.\n\n👇👇👇\n\n✉re.sousa@live.com\n📷@renancunha.ai_art";
                client.sendText(message.from, response);
                return;
                
            } else if (message.body === ".reset") {
                // Reseta o número de mensagens enviadas pelo remetente
                messageCount[message.from] = 0;
                client.sendText(message.from, "Contador de mensagens resetado!");
        
            } else if (message.body.startsWith(".bot ")) {
                // Envia a mensagem para o modelo GPT-3
                const clientText = message.body.slice(5); // remove o ".bot " do início da mensagem
                getDavinciResponse(clientText)
                    .then((response) => {
                        messageCount[message.from] = (messageCount[message.from] || 1) + 1;
                        client.sendText(message.from, response + numMessage);
                    })
                    .catch((error) => {
                        client.sendText(message.from, `❌ Erro ao processar a solicitação: ${error}`);
                    });
        
            } else if (message.body.startsWith(".img ")) {
                // Gera uma imagem a partir da descrição fornecida
                const clientText = message.body.slice(5); // remove o ".img " do início da mensagem
                getDalleResponse(clientText)
                    .then((response) => {
                        messageCount[message.from] = (messageCount[message.from] || 1) + 1;
                        client.sendImage(message.from, response, "image.png", `Aqui está sua imagem! ${numMessage}`);
                    })
                    .catch((error) => {
                        client.sendText(message.from, `❌ Erro ao processar a solicitação: ${error}`);
                    });
            } else {
                // Comando inválido
                client.sendText(message.from, 
                    "*Ops! Comando inválido!* 🤖\n\n"+
                    "Use *.info* para informações sobre os comandos válidos!");
            }
        };
    

    const start = (client) => {
    client.onMessage((message) => commands(client, message));
    };
    
    //export {start}
    //console.log(allowedNumbers)