import {
  BotState,
  SendMessage,
  SegmentationInfo,
  InsertCustomer,
  InsertMessage
} from '../model/chat-model';
import { WebhookMessage } from '../model/webhook-model';
import { replaceMessage } from '../util/replaceMessage';
import { getChannelByCompanyIdAndConnection } from '../repository/channel-repository';
import { getAllBotsByChannelId } from '../repository/bot-repository';
import { Bot, BotOptions, BotQuestions } from '../model/bot-model';
import {
  findCustomerInDBByConectionAndSession,
  getProfilePhoto,
  insertNewCustomer,
  redirectCustomerToDepartment,
  updateBotStateCustomerByContactIDAndSession,
  updateSegmentationCustomerByContactIDAndSession,
  updateStateCustomer
} from './customer-services';
import {
  insertNewMessageByCustomer,
  optionError,
  sendMessage
} from './message-service';

export async function botInteraction(
  messageWebhook: WebhookMessage,
  type: number
) {
  let contact: InsertCustomer;
  let message: InsertMessage;
  if (type === 0) {
    const replace = replaceMessage(messageWebhook);
    contact = replace.contact;
    message = replace.messagem;

    if (message.fromMe) {
      await insertNewMessageByCustomer(message);
      return;
    }
    await botActionCustomer(contact, message);
  }
}

async function botActionCustomer(
  customer: InsertCustomer,
  message: InsertMessage
) {
  try {
    const bot = await getBotByCustomerConnection(customer);
    if (!bot) return;
    const segmentation = bot.questions.filter(
      (q) => q.type_question == 'segmentation'
    );
    const customerExist = await findCustomerInDBByConectionAndSession(
      customer.connection,
      customer.session,
      customer.contactId
    );

    const pgotoURL = await getProfilePhoto(
      customer.session,
      customer.contactId
    );
    if (customerExist) {
      if (pgotoURL) customerExist.photoURL = pgotoURL.profilePictureURL;
      if (segmentation.length === 0) {
        await menuActions(bot, customerExist, message);
        return;
      }

      if (customerExist.botState?.currentStage === 'segmentation') {
        await segmentationActions(customerExist, message, segmentation, bot);
      } else {
        await menuActions(bot, customerExist, message);
      }
    } else {
      await startBotForNewCustomer(customer, bot, segmentation, message);
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function segmentationActions(
  customer: InsertCustomer,
  message: InsertMessage,
  segmentation: BotQuestions[],
  bot: Bot
) {
  try {
    const stateSegmentation = segmentation.find(
      (s) =>
        s.sequence_segmentation === customer.botState?.currentSegmentationId
    );
    if (!stateSegmentation) {
      await menuActions(bot, customer, message);
      return;
    }
    const chaveDinamica = stateSegmentation?.key_segmentation;
    const segmentationUser: SegmentationInfo = {
      [chaveDinamica]: message.body
    };
    if (chaveDinamica === 'Nome') customer.contactName = message.body;
    if (customer.segmentInfo) {
      customer.segmentInfo = {
        ...customer.segmentInfo,
        ...segmentationUser
      };
    } else {
      customer.segmentInfo = segmentationUser;
    }
    if (!customer.botState) {
      const botState: BotState = {
        currentStage: 'segmentation',
        startedAt: customer.lastMessage,
        lastInteraction: customer.lastMessage,
        currentSegmentationId: stateSegmentation.sequence_segmentation,
        currentQuestionId: 0
      };
      customer.botState = botState;
    }
    if (segmentation.length > customer.botState.currentSegmentationId) {
      const send: SendMessage = {
        chatId: customer.contactId,
        text: segmentation[customer.botState?.currentSegmentationId].text,
        session: customer.session
      };

      customer.botState.currentSegmentationId =
        customer.botState?.currentSegmentationId + 1;
      customer.botState.lastInteraction = customer.lastMessage;
      await insertNewMessageByCustomer(message);
      setTimeout(async () => {
        await sendMessageByContactIdAndSessionAndUpdateCustomer(customer, send);
      }, 1000);
    } else if (
      segmentation.length === customer.botState.currentSegmentationId
    ) {
      customer.botState.currentStage = 'menu';
      await insertNewMessageByCustomer(message);
      await updateBotStateCustomerByContactIDAndSession(customer);
      await updateSegmentationCustomerByContactIDAndSession(customer);
      await updateStateCustomer(customer);
      await menuActions(bot, customer, message);
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function startBotForNewCustomer(
  customer: InsertCustomer,
  bot: Bot,
  segmentation: BotQuestions[],
  message: InsertMessage
) {
  try {
    await createCustomerAndMessage(customer, message);
    const send: SendMessage = {
      chatId: customer.contactId,
      text: bot.greeting_message,
      session: customer.session
    };

    if (segmentation.length === 0) {
      await menuActions(bot, customer, message);
      return;
    }

    const firstSegmentation = segmentation.find(
      (e) => e.sequence_segmentation === 1
    );
    if (!firstSegmentation) return;
    const botState: BotState = {
      currentStage: 'segmentation',
      startedAt: customer.lastMessage,
      lastInteraction: customer.lastMessage,
      currentSegmentationId: 1,
      currentQuestionId: 0
    };
    customer.botState = botState;
    const sendSegmentation: SendMessage = {
      chatId: customer.contactId,
      text: firstSegmentation.text,
      session: customer.session
    };
    await sendMessageByContactIdAndSessionAndUpdateCustomer(customer, send);

    setTimeout(async () => {
      await sendMessage(sendSegmentation);
    }, 500);
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function getBotByCustomerConnection(customer: InsertCustomer) {
  try {
    const channel = await getChannelByCompanyIdAndConnection(
      customer.connection
    );
    if (!channel) {
      customer.inBot = false;
      customer.active = true;
      await insertNewCustomer(customer);
      return false;
    }

    const bot = await getAllBotsByChannelId(channel.id);
    if (bot.length === 0) {
      customer.inBot = false;
      customer.active = true;
      await insertNewCustomer(customer);
      return false;
    }

    let botSend: Bot;

    const botNewUser = bot.filter((bot) => bot.type === 0);
    if (botNewUser.length > 0) {
      botSend = botNewUser[0];
    } else {
      botSend = bot[0];
    }
    return botSend;
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function sendMessageByContactIdAndSessionAndUpdateCustomer(
  clienteMessage: InsertCustomer,
  send: SendMessage
) {
  await updateBotStateCustomerByContactIDAndSession(clienteMessage);
  await updateSegmentationCustomerByContactIDAndSession(clienteMessage);
  await updateStateCustomer(clienteMessage);
  await sendMessage(send);
}

async function createCustomerAndMessage(
  customer: InsertCustomer,
  message: InsertMessage
) {
  try {
    await insertNewCustomer(customer);
    await insertNewMessageByCustomer(message);
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function menuActions(
  bot: Bot,
  customer: InsertCustomer,
  message: InsertMessage
) {
  await insertNewMessageByCustomer(message);
  const botMenu = bot.questions.filter((q) => q.type_question == 'menu');
  const currentQuestionId = customer.botState?.currentQuestionId;
  if (customer.botState?.currentQuestionId === 0) {
    const principalMenu = botMenu?.find((o) => o.principal);
    if (!principalMenu) return;
    const send: SendMessage = {
      chatId: customer.contactId,
      text: `${principalMenu.text}
${principalMenu.options[0].id} - ${principalMenu.options[0].label}`,
      session: customer.session
    };
    customer.botState.currentQuestionId = principalMenu.id;
    await sendMessageByContactIdAndSessionAndUpdateCustomer(customer, send);
    return;
  }
  const menu = botMenu.find((b) => b.id === currentQuestionId);
  if (!menu) return;
  if (menu.options.length === 0) return;
  //todo para validar qual opção foi digitada e validar se é do mesmo tipo
  const userAction = parseFloat(message.body);

  if (isNaN(userAction)) {
    await optionError(customer, 'opçao invalida!');
    return;
  }
  const options = menu.options[userAction - 1];
  if (!options) return await optionError(customer, 'Opção invalida!');
  await redirectMenu(customer, options, bot);
}

async function redirectMenu(
  customer: InsertCustomer,
  options: BotOptions,
  bot: Bot
) {
  console.log(options.type);

  switch (options.type) {
    case 'department':
      await redirectCustomerToDepartmentAndEmit(
        customer,
        options.action.department_id,
        bot
      );
      break;
    case 'attendant':
      break;
    case 'submenu':
      break;
    case 'text':
      break;
    default:
      break;
  }
}

async function redirectCustomerToDepartmentAndEmit(
  customer: InsertCustomer,
  department_id: number | undefined,
  bot: Bot
) {
  try {
    console.log(department_id);
    if (!department_id) {
      await optionError(customer, 'Falha na configuração interna');
      return;
    }
    await redirectCustomerToDepartment(customer, department_id);
    const send = {
      chatId: customer.contactId,
      text: bot.targeting_message,
      session: customer.session
    };
    await sendMessage(send);
    //todo emit
  } catch (error: any) {
    console.warn(error.message);
  }
}
