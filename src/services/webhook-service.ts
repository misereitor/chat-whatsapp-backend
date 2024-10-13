// import { PushOperator } from 'mongodb';
// import { ChatMessage, InsertChatMessage } from '../model/chat-model';
// import { WebhookMessage } from '../model/webhook-model';
// import {
//   replaceMessage,
//   replaceMessageUpdateStatus
// } from '../util/replaceMessage';
// import { config } from 'dotenv';
// import { io } from '../app';
// import { connectToMongo } from '../config/mongo_db.conf';
// import { getContactName } from '../repository/contacts-repository';

// config();
// const { API_URL } = process.env;

// export async function saveMessageInDB(message: WebhookMessage) {
//   try {
//     const messageFiltred = replaceMessage(message);
//     const contactName = await getContactName(messageFiltred.phoneNumber);
//     messageFiltred.contactName = contactName ? contactName : 'Contato';
//     const pgotoURL = await getProfilePhoto(
//       messageFiltred.session,
//       messageFiltred.contactId
//     );

//     if (pgotoURL) messageFiltred.photoURL = pgotoURL.profilePictureURL;
//     const userExist = await findMessageInDBByConectionAndSession(
//       messageFiltred.connection,
//       messageFiltred.session,
//       messageFiltred.contactId
//     );
//     if (userExist) {
//       await insertMenssageByContactIDAndSession(messageFiltred);
//       await updateProfilePhoto(messageFiltred);
//       io.emit(
//         `${message.me.id}.${message.session}.update`,
//         JSON.stringify({ ...messageFiltred })
//       );
//     } else {
//       await insertNewMenssage(messageFiltred);
//       io.emit(
//         `${message.me.id}.${message.session}.new`,
//         JSON.stringify({ ...messageFiltred })
//       );
//     }
//   } catch (error: any) {
//     console.warn(error.message);
//   }
// }

// export async function updateProfilePhoto(messageFiltred: ChatMessage) {
//   try {
//     const mongoClient = await connectToMongo();
//     const dbMongo = mongoClient.db('chatbot').collection('chat');
//     await dbMongo.updateOne(
//       {
//         connection: messageFiltred.connection,
//         session: messageFiltred.session,
//         contactId: messageFiltred.contactId
//       },
//       {
//         $set: {
//           photoURL: messageFiltred.photoURL
//         }
//       }
//     );
//   } catch (error: any) {
//     console.warn(error.message);
//   }
// }

// export async function updateStatusMessage(message: WebhookMessage) {
//   try {
//     const messageFiltred = replaceMessageUpdateStatus(message);
//     messageFiltred.contactId = messageFiltred.contactId.replace(/:\d+/, '');
//     messageFiltred.messages[0].id = messageFiltred.messages[0].id.replace(
//       /:\d+/,
//       ''
//     );
//     const MAX_RETRIES = 5;
//     let retries = 0;
//     let userExist = null;
//     while (!userExist && retries < MAX_RETRIES) {
//       userExist = await findMessageInDBByConectionAndSession(
//         messageFiltred.connection,
//         messageFiltred.session,
//         messageFiltred.contactId
//       );
//       if (!userExist) {
//         retries++;
//         await new Promise((resolve) => setTimeout(resolve, 500)); // Aguardar 500ms entre as tentativas
//       }
//     }

//     if (userExist) {
//       await updateStatusMessageByConectionAndSession(messageFiltred);
//       io.emit(
//         `${message.me.id}.${message.session}.status`,
//         JSON.stringify({ ...messageFiltred })
//       );
//     } else {
//       console.warn('Message not found after retries.');
//     }
//   } catch (error: any) {
//     console.warn(error.message);
//   }
// }

// export async function insertNewMenssage(messages: InsertChatMessage) {
//   try {
//     const mongoClient = await connectToMongo();
//     const dbMongo = mongoClient.db('chatbot').collection('chat');
//     const response = await dbMongo.insertOne({
//       ...messages
//     });
//     if (response.insertedId) {
//       return response.insertedId;
//     }
//     throw new Error('Error inserting message');
//   } catch (error: any) {
//     console.warn(error.message);
//   }
// }

// export async function insertMenssageByContactIDAndSession(
//   messages: ChatMessage
// ) {
//   try {
//     const mongoClient = await connectToMongo();
//     const dbMongo = mongoClient.db('chatbot').collection('chat');

//     await dbMongo.updateOne(
//       { contactId: messages.contactId, session: messages.session },
//       {
//         $push: {
//           messages: { $each: messages.messages }
//         } as unknown as PushOperator<ChatMessage[]>
//       },
//       { upsert: true }
//     );
//   } catch (error: any) {
//     console.warn(error.message);
//   }
// }

// export async function updateStatusMessageByConectionAndSession(
//   messageFiltred: ChatMessage
// ) {
//   try {
//     const mongoClient = await connectToMongo();
//     const dbMongo = mongoClient.db('chatbot').collection('chat');
//     await dbMongo.updateOne(
//       {
//         connection: messageFiltred.connection,
//         session: messageFiltred.session,
//         contactId: messageFiltred.contactId,
//         'messages.id': messageFiltred.messages[0].id
//       },
//       {
//         $set: {
//           'messages.$.status': messageFiltred.messages[0].status
//         }
//       }
//     );
//   } catch (error: any) {
//     console.warn(error.message);
//   }
// }

// export async function findMessageInDBByConectionAndSession(
//   connection: string,
//   session: string,
//   contactId: string
// ) {
//   try {
//     const mongoClient = await connectToMongo();
//     const dbMongo = mongoClient.db('chatbot').collection('chat');

//     const message = await dbMongo.findOne(
//       {
//         connection,
//         session,
//         contactId
//       },
//       { projection: { messages: 1 } }
//     );
//     return message;
//   } catch (error: any) {
//     console.warn(error.message);
//   }
// }

// export async function getProfilePhoto(session: string, contactid: string) {
//   try {
//     const response = await fetch(
//       `${API_URL}/api/contacts/profile-picture?contactId=${contactid}&session=${session}`
//     );
//     if (response.ok) {
//       const data = await response.json();
//       return data;
//     }
//   } catch (error: any) {
//     console.warn(error.message);
//   }
// }
