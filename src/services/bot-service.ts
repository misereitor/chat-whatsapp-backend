import {
  SendMessage,
  SegmentationInfo,
  InsertCustomer,
  InsertMessage,
  Customer
} from '../model/chat-model';
import { WebhookMessage } from '../model/webhook-model';
import { replaceMessage } from '../util/replaceMessage';
import {
  getChannelByConnectionAndSession,
  getChannelById
} from '../repository/channel-repository';
import { getAllBotsByChannelId } from '../repository/bot-repository';
import { Bot, BotOptions, BotQuestions } from '../model/bot-model';
import { io } from '../app';
import {
  getMessageByCustomer,
  insertNewMessageByCustomer,
  optionError,
  sendMessage
} from './message-service';
import {
  createCustomer,
  getCustomerByChannelAndChatId,
  updateCustomer
} from '../repository/chat-repository';
import { getProfilePhoto } from './chat-services';
import { Channel } from '../model/channel-model';
import { getDepartmentById } from '../repository/department-repository';
import { getUserById } from '../repository/user-repository';

export async function botInteraction(
  messageWebhook: WebhookMessage,
  type: number
) {
  try {
    let contact: InsertCustomer;
    let message: InsertMessage;
    const channel = await getChannelByConnectionAndSession(
      messageWebhook.me.id,
      messageWebhook.session
    );

    if (type === 0) {
      const replace = replaceMessage(messageWebhook, channel.id);
      contact = replace.contact;
      message = replace.messagem;

      if (message.fromMe) {
        message.status = 1;
        await insertNewMessageByCustomer(message);
        io.emit(
          `${message.connection}.${message.session}.newMessage`,
          JSON.stringify({ ...message })
        );
        return;
      }
      await botActionCustomer(contact, message, channel);
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function botActionCustomer(
  customer: InsertCustomer,
  message: InsertMessage,
  channel: Channel
) {
  try {
    const bot = await getBotByCustomerConnection(customer);
    if (!bot) return;
    const segmentation = bot.questions.filter(
      (q) => q.type_question == 'segmentation'
    );
    const customerExist = await getCustomerByChannelAndChatId(
      channel,
      customer.chatId
    );

    const pgotoURL = await getProfilePhoto(channel.session, customer.chatId);
    if (customerExist) {
      if (pgotoURL) customerExist.photoURL = pgotoURL.profilePictureURL;
      if (customerExist.currentStage === 'service') {
        return await handleServiceAction(customerExist, message);
      }
      if (segmentation.length === 0) {
        await menuActions(bot, customerExist, message);
        return;
      }

      if (customerExist.currentStage === 'segmentation') {
        await segmentationActions(customerExist, message, segmentation, bot);
      } else {
        await menuActions(bot, customerExist, message);
      }
    } else {
      await startBotForNewCustomer(
        customer,
        bot,
        segmentation,
        message,
        channel
      );
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function segmentationActions(
  customer: Customer,
  message: InsertMessage,
  segmentation: BotQuestions[],
  bot: Bot
) {
  try {
    const stateSegmentation = segmentation.find(
      (s) => s.sequence_segmentation === customer.currentSegmentationId
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

    customer.currentStage = 'segmentation';
    customer.startedAt = customer.lastMessage;
    customer.currentSegmentationId = stateSegmentation.sequence_segmentation;
    customer.currentQuestionId = 0;

    if (segmentation.length > customer.currentSegmentationId) {
      const send: SendMessage = {
        chatId: customer.chatId,
        text: segmentation[customer.currentSegmentationId].text,
        session: customer.channel.session
      };

      customer.currentSegmentationId = customer.currentSegmentationId + 1;
      await insertNewMessageByCustomer(message);
      await updateCustomer(customer);
      setTimeout(async () => {
        await sendMessageByContactIdAndSessionAndUpdateCustomer(customer, send);
      }, 500);
    } else if (segmentation.length === customer.currentSegmentationId) {
      customer.currentStage = 'menu';
      await insertNewMessageByCustomer(message);
      await updateCustomer(customer);
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
  message: InsertMessage,
  channel: Channel
) {
  try {
    await createCustomerAndMessage(customer, message);
    const send: SendMessage = {
      chatId: customer.chatId,
      text: bot.greeting_message,
      session: channel.session
    };

    const customerDB = await getCustomerByChannelAndChatId(
      channel,
      customer.chatId
    );

    if (segmentation.length === 0) {
      await menuActions(bot, customerDB, message);
      return;
    }

    const firstSegmentation = segmentation.find(
      (e) => e.sequence_segmentation === 1
    );
    if (!firstSegmentation) return;
    customerDB.currentStage = 'segmentation';
    customerDB.startedAt = customer.lastMessage;
    customerDB.currentSegmentationId = 1;
    customerDB.currentQuestionId = 0;

    const sendSegmentation: SendMessage = {
      chatId: customer.chatId,
      text: firstSegmentation.text,
      session: channel.session
    };
    await sendMessageByContactIdAndSessionAndUpdateCustomer(customerDB, send);

    setTimeout(async () => {
      await sendMessage(sendSegmentation);
    }, 500);
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function getBotByCustomerConnection(customer: InsertCustomer) {
  try {
    const channel = await getChannelById(customer.channel_id);
    if (!channel) {
      customer.inBot = false;
      customer.active = true;
      await createCustomer(customer);
      return false;
    }

    const bot = await getAllBotsByChannelId(channel.id);
    if (bot.length === 0) {
      customer.inBot = false;
      customer.active = true;
      await createCustomer(customer);
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
  clienteMessage: Customer,
  send: SendMessage
) {
  await updateCustomer(clienteMessage);
  await sendMessage(send);
}

async function createCustomerAndMessage(
  customer: InsertCustomer,
  message: InsertMessage
) {
  try {
    await createCustomer(customer);
    await insertNewMessageByCustomer(message);
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function menuActions(
  bot: Bot,
  customer: Customer,
  message: InsertMessage
) {
  await insertNewMessageByCustomer(message);
  const botMenu = bot.questions.filter((q) => q.type_question == 'menu');
  const currentQuestionId = customer.currentQuestionId;
  if (customer.currentQuestionId === 0) {
    const principalMenu = botMenu?.find((o) => o.principal);
    if (!principalMenu) return;
    const send: SendMessage = {
      chatId: customer.chatId,
      text: organizeMenuText(principalMenu),
      session: customer.channel.session
    };
    customer.currentQuestionId = principalMenu.id;
    await sendMessageByContactIdAndSessionAndUpdateCustomer(customer, send);
    return;
  }
  const menu = botMenu.find((b) => b.id === currentQuestionId);
  if (!menu) return;
  if (menu.options.length === 0) return;

  const userAction = parseFloat(message.body);

  if (isNaN(userAction)) {
    await optionError(
      customer.chatId,
      customer.channel.session,
      'opçao invalida!'
    );
    return;
  }

  const options = menu.options[userAction - 1];
  if (!options)
    return await optionError(
      customer.chatId,
      customer.channel.session,
      'Opção invalida!'
    );
  await redirectMenu(customer, options, bot);
}

async function redirectMenu(customer: Customer, options: BotOptions, bot: Bot) {
  switch (options.type) {
    case 'department':
      await redirectCustomerToDepartmentAndEmit(
        customer,
        options.action.department_id,
        bot
      );
      break;
    case 'attendant':
      await redirectCustomerToAttendantAndEmit(
        customer,
        options.action.attendant_id,
        bot
      );
      break;
    case 'menu':
      await redirectCustomerToSubmenuAndEmit(
        customer,
        options.action.menu_id,
        bot
      );
      break;
    case 'text':
      break;
    default:
      break;
  }
}

async function redirectCustomerToDepartmentAndEmit(
  customer: Customer,
  department_id: number | undefined,
  bot: Bot
) {
  try {
    if (!department_id) {
      await optionError(
        customer.chatId,
        customer.channel.session,
        'Falha na configuração interna'
      );
      return;
    }
    const department = await getDepartmentById(department_id);
    customer.active = true;
    customer.inBot = false;
    customer.department = department;
    customer.currentStage = 'service';
    await updateCustomer(customer);
    const send = {
      chatId: customer.chatId,
      text: bot.targeting_message,
      session: customer.channel.session
    };
    await sendMessage(send);
    setTimeout(async () => {
      const messagesCustomer = await getMessageByCustomer(customer);
      customer.messages = messagesCustomer;
      io.emit(
        `${customer.channel.connection}.${customer.channel.session}.newChat`,
        JSON.stringify({ ...customer })
      );
    }, 2000);
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function redirectCustomerToAttendantAndEmit(
  customer: Customer,
  attendant_id: number | undefined,
  bot: Bot
) {
  try {
    if (!attendant_id) {
      await optionError(
        customer.chatId,
        customer.channel.session,
        'Falha na configuração interna'
      );
      return;
    }
    const user = await getUserById(attendant_id);
    customer.active = true;
    customer.inBot = false;
    customer.user = user;
    customer.currentStage = 'service';
    await updateCustomer(customer);
    const send = {
      chatId: customer.chatId,
      text: bot.targeting_message,
      session: customer.channel.session
    };
    await sendMessage(send);
    //todo emit
    setTimeout(async () => {
      const messagesCustomer = await getMessageByCustomer(customer);
      customer.messages = messagesCustomer;
      io.emit(
        `${customer.channel.connection}.${customer.channel.session}.newChat`,
        JSON.stringify({ ...customer })
      );
    }, 2000);
  } catch (error: any) {
    console.warn(error.message);
  }
}

async function redirectCustomerToSubmenuAndEmit(
  customer: Customer,
  menu_id: number | undefined,
  bot: Bot
) {
  try {
    if (!menu_id) {
      await optionError(
        customer.chatId,
        customer.channel.session,
        'Falha na configuração interna'
      );
      return;
    }
    customer.active = true;
    customer.inBot = false;
    customer.currentQuestionId = menu_id;
    const options = bot.questions.find((q) => q.id === menu_id);
    if (!options)
      return await optionError(
        customer.chatId,
        customer.channel.session,
        'Falha na configuração interna'
      );
    await updateCustomer(customer);
    const send = {
      chatId: customer.chatId,
      text: organizeMenuText(options),
      session: customer.channel.session
    };
    await sendMessage(send);
  } catch (error: any) {
    console.warn(error.message);
  }
}

function organizeMenuText(menu: BotQuestions) {
  let options = '';
  menu.options.forEach((option) => {
    options += `${option.id} - ${option.label}\n`;
  });
  return `${menu.text}:

${options}`;
}

async function handleServiceAction(customer: Customer, message: InsertMessage) {
  try {
    customer.totalMessages += 1;
    await updateCustomer(customer);
    await insertNewMessageByCustomer(message);
    io.emit(
      `${message.connection}.${message.session}.newMessage`,
      JSON.stringify({ ...message })
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}
