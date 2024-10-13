import { Contact, ContactFilter, ContactRequest } from '../model/contact-model';
import {
  createAllContacts,
  createContact,
  deleteContact,
  getAllContacts,
  getContactByFilter,
  updateContact
} from '../repository/contacts-repository';

export async function createContactService(contact: ContactRequest) {
  try {
    const result = await createContact(contact);
    return result;
  } catch (error: any) {
    throw new Error('Error creating contact: ' + error.message);
  }
}

export async function createAllContactsService(contact: ContactRequest[]) {
  try {
    const result = await createAllContacts(contact);
    return result;
  } catch (error: any) {
    throw new Error('Error creating contact: ' + error.message);
  }
}

export async function updateContactService(contact: Contact) {
  try {
    const result = await updateContact(contact);
    return result;
  } catch (error: any) {
    throw new Error('Error creating contact: ' + error.message);
  }
}

export async function deleteContactService(contact: Contact) {
  try {
    const result = await deleteContact(contact);
    return result;
  } catch (error: any) {
    throw new Error('Error creating contact: ' + error.message);
  }
}

export async function getAllContactsService(filter: ContactFilter) {
  try {
    const result = await getAllContacts(filter);
    return result;
  } catch (error: any) {
    throw new Error('Error creating contact: ' + error.message);
  }
}

export async function getContactByFilterService(filter: ContactFilter) {
  try {
    const result = await getContactByFilter(filter);
    return result;
  } catch (error: any) {
    throw new Error('Error creating contact: ' + error.message);
  }
}
