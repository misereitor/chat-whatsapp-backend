import { connectToMongo } from '../config/mongo_db.conf';
import { Customer, InsertCustomer } from '../model/chat-model';

const {
  API_URL_WHATSAPP_NO_OFFICIAL,
  MONGO_DB,
  SECRET_AIP_WHATSAPP_NO_OFFICIAL
} = process.env;

export async function getProfilePhoto(session: string, contactid: string) {
  try {
    const response = await fetch(
      `${API_URL_WHATSAPP_NO_OFFICIAL}/api/contacts/profile-picture?contactId=${contactid}&session=${session}`,
      {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Api-Key': String(SECRET_AIP_WHATSAPP_NO_OFFICIAL)
        }
      }
    );
    if (response.ok) {
      const data = await response.json();
      return data;
    }
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function findCustomerInDBByConectionAndSession(
  connection: string,
  session: string,
  contactId: string
) {
  try {
    const mongoClient = await connectToMongo();
    const dbCustomers = mongoClient.db(MONGO_DB).collection('customers');

    const message = await dbCustomers.findOne(
      {
        connection,
        session,
        contactId
      },
      {
        projection: {
          messages: { $slice: 1 }
        }
      }
    );
    return message as Customer;
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function updateStateCustomer(Customer: InsertCustomer) {
  try {
    const mongoClient = await connectToMongo();
    const dbCustomers = mongoClient.db(MONGO_DB).collection('customers');

    const updateFields: any = {
      totalAttendances: Customer.totalAttendances,
      totalMessages: Customer.totalMessages,
      lastMessage: Customer.lastMessage,
      photoURL: Customer.photoURL,
      inBot: Customer.inBot,
      active: Customer.active,
      dateCreateChat: Customer.dateCreateChat
    };

    if (Customer.botState) {
      updateFields.botState = Customer.botState;
    }
    if (Customer.segmentInfo) {
      updateFields.segmentInfo = Customer.segmentInfo;
    }
    await dbCustomers.updateOne(
      { contactId: Customer.contactId, session: Customer.session },
      {
        $set: updateFields
      },
      { upsert: true }
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function updateCustomerByContactIDAndSession(
  customer: InsertCustomer
) {
  try {
    const mongoClient = await connectToMongo();
    const dbCustomers = mongoClient.db(MONGO_DB).collection('customers');

    const updateFields: any = {
      totalAttendances: customer.totalAttendances,
      totalMessages: customer.totalMessages,
      lastMessage: customer.lastMessage,
      photoURL: customer.photoURL,
      inBot: customer.inBot,
      active: customer.active,
      dateCreateChat: customer.dateCreateChat
    };

    if (customer.contactName != '') {
      updateFields.contactName = customer.contactName;
    }
    await dbCustomers.updateOne(
      {
        contactId: customer.contactId,
        session: customer.session,
        connection: customer.connection
      },
      {
        $set: updateFields
      },
      { upsert: true }
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function insertNewCustomer(customer: InsertCustomer) {
  try {
    const mongoClient = await connectToMongo();
    const dbMessages = mongoClient.db(MONGO_DB).collection('customers');
    await dbMessages.insertOne({
      ...customer
    });
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function updateBotStateCustomerByContactIDAndSession(
  customer: InsertCustomer
) {
  try {
    const mongoClient = await connectToMongo();
    const dbCustomers = mongoClient.db(MONGO_DB).collection('customers');

    const updateFields: any = {};
    if (!customer.botState) {
      return;
    }
    updateFields.botState = customer.botState;

    await dbCustomers.updateOne(
      {
        contactId: customer.contactId,
        session: customer.session,
        connection: customer.connection
      },
      {
        $set: updateFields
      },
      { upsert: true }
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}
export async function updateSegmentationCustomerByContactIDAndSession(
  customer: InsertCustomer
) {
  try {
    const mongoClient = await connectToMongo();
    const dbCustomers = mongoClient.db(MONGO_DB).collection('customers');

    const updateFields: any = {};

    if (!customer.segmentInfo) {
      return;
    }
    updateFields.segmentInfo = customer.segmentInfo;
    await dbCustomers.updateOne(
      {
        contactId: customer.contactId,
        session: customer.session,
        connection: customer.connection
      },
      {
        $set: updateFields
      },
      { upsert: true }
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}

export async function redirectCustomerToDepartment(
  customer: InsertCustomer,
  department_id: number
) {
  try {
    const mongoClient = await connectToMongo();
    const dbCustomers = mongoClient.db(MONGO_DB).collection('customers');

    await dbCustomers.updateOne(
      {
        contactId: customer.contactId,
        session: customer.session,
        connection: customer.connection
      },
      {
        $set: { departmentId: department_id }
      },
      { upsert: true }
    );
  } catch (error: any) {
    console.warn(error.message);
  }
}
