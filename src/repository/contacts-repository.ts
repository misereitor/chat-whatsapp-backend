import { connectToMongo } from '../config/mongo_db.conf';
import {
  Contact,
  ContactFilter,
  ContactRequest,
  ContactResponse
} from '../model/contact-model';

export async function createContact(contact: ContactRequest) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('contacts');
    const result = await dbMongo.insertOne(contact);
    return result.insertedId;
  } catch (error: any) {
    throw new Error('Error creating contact: ' + error.message);
  }
}

export async function createAllContacts(contact: ContactRequest[]) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('contacts');
    const result = await dbMongo.insertMany(contact);
    return result.insertedIds;
  } catch (error: any) {
    throw new Error('Error creating contact: ' + error.message);
  }
}

export async function updateContact(contact: Contact) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('contacts');
    const query: any = {
      _id: contact._id,
      companyId: contact.companyId,
      $or: [
        { attendantId: contact.attendantId },
        { shared: true },
        { bot: true },
        { departmentId: { $in: contact.departmentId } }
      ]
    };
    const result = await dbMongo.updateOne(query, { $set: { ...contact } });
    if (result.matchedCount === 0) {
      throw new Error('No contact found to update or user lacks permission');
    }

    return result.modifiedCount;
  } catch (error: any) {
    throw new Error('Error update contact: ' + error.message);
  }
}

export async function deleteContact(contact: Contact) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('contacts');
    const query = {
      _id: contact._id,
      companyId: contact.companyId,
      $or: [
        { attendantId: contact.attendantId },
        { shared: true },
        { bot: true }
      ]
    };
    const result = await dbMongo.deleteOne(query);
    if (result.deletedCount === 0) {
      throw new Error('No contact found to delete or user lacks permission');
    }
    return result.deletedCount;
  } catch (error: any) {
    throw new Error('Error deleting contact: ' + error.message);
  }
}

export async function getAllContacts(filter: ContactFilter) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('contacts');

    const skip = (filter.page - 1) * filter.limit;
    const query: any = {
      companyId: filter.companyId,
      $or: [{ bot: filter.bot }, { attendantId: filter.attendantId }]
    };
    if (filter.departmentId) {
      query.$or.push({ departmentId: { $in: filter.departmentId } });
    }

    const contacts = await dbMongo
      .find(query)
      .skip(skip)
      .limit(filter.limit)
      .toArray();
    return contacts;
  } catch (error: any) {
    throw new Error('Error fetching contacts: ' + error.message);
  }
}

export async function getContactByFilter(filter: ContactFilter) {
  try {
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('contacts');

    // Inicialização da resposta
    const response: ContactResponse = {
      user: [],
      shared: [],
      bot: []
    };

    // Filtro básico que garante que os contatos são da empresa (companyId)
    const baseQuery = {
      companyId: filter.companyId
    };

    // 1. Busca de contatos do usuário
    const userContactsQuery: any = {
      ...baseQuery,
      attendantId: filter.attendantId
    };

    // 2. Busca de contatos compartilhados (departmento)
    const sharedContactsQuery: any = {
      ...baseQuery,
      departmentId: { $in: filter.departmentId || [] }
    };

    // 3. Busca de contatos do bot
    const botContactsQuery: any = {
      ...baseQuery,
      bot: true
    };

    // Filtro de pesquisa (search) aplicado a todas as consultas se o campo estiver preenchido
    if (filter.search && filter.search.trim() !== '') {
      const searchFilter = {
        $or: [
          { name: { $regex: filter.search, $options: 'i' } },
          { email: { $regex: filter.search, $options: 'i' } },
          { phoneNumber: { $regex: filter.search, $options: 'i' } },
          { address: { $regex: filter.search, $options: 'i' } },
          { company: { $regex: filter.search, $options: 'i' } },
          { notes: { $regex: filter.search, $options: 'i' } }
        ]
      };

      // Aplicar o filtro de pesquisa a todas as queries
      userContactsQuery.$and = [searchFilter];
      sharedContactsQuery.$and = [searchFilter];
      botContactsQuery.$and = [searchFilter];
    }

    // Realizar as buscas com paginação
    const userContacts = await dbMongo
      .find(userContactsQuery)
      .skip((filter.page - 1) * filter.limit)
      .limit(filter.limit)
      .toArray();

    const sharedContacts = await dbMongo
      .find(sharedContactsQuery)
      .skip((filter.page - 1) * filter.limit)
      .limit(filter.limit)
      .toArray();

    const botContacts = await dbMongo
      .find(botContactsQuery)
      .skip((filter.page - 1) * filter.limit)
      .limit(filter.limit)
      .toArray();

    // Organizar os resultados na resposta final
    response.user = userContacts as unknown as Contact[];
    response.shared = sharedContacts as unknown as Contact[];
    response.bot = botContacts as unknown as Contact[];

    return response;
  } catch (error: any) {
    throw new Error('Error fetching contacts by categories: ' + error.message);
  }
}

export async function getContactName(phoneNumber: string) {
  try {
    const regex = /^(55\d{2})(\d{4})(\d{4})$/;
    phoneNumber = phoneNumber.replace(regex, '$19$2$3');
    const mongoClient = await connectToMongo();
    const dbMongo = mongoClient.db('chatbot').collection('contacts');

    // Busca de contato pelo número de telefone
    const contact = await dbMongo.findOne({
      phoneNumber: { $in: [phoneNumber] } // Busca o número no array de phoneNumber
    });

    // Retorna o nome do contato se encontrado, ou null se não encontrado
    if (contact) {
      return contact.name;
    }
    return null; // Caso não encontre, retornamos null
  } catch (error: any) {
    console.error('Error fetching contact name:', error.message);
    return null; // Em caso de erro, também retornamos null
  }
}
