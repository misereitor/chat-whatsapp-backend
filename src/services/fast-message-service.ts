import { Department } from '../model/department-model';
import {
  CreateFastMessage,
  FastMessage,
  GetAllFastMessages
} from '../model/fast-message-model';
import { User } from '../model/user-model';
import {
  addFastMessageToDepartmentRepository,
  createFastMessageRepository,
  deleteFastMessageRepository,
  getAllFastMessagesRepository,
  getFastMessageByIdRepository,
  removeAllFastMessageToDepartmentRepository,
  removeFastMessageToDepartmentRepository,
  updateFastMessageReporitory
} from '../repository/fast-message-reporitory';

export async function createFastMessageService(fastMessage: CreateFastMessage) {
  try {
    const fastMessageCreated = await createFastMessageRepository(fastMessage);
    if (fastMessage.departments_id.length > 0) {
      for (const departmentId of fastMessage.departments_id) {
        await addFastMessageToDepartmentRepository(
          fastMessageCreated.id,
          departmentId
        );
      }
    }
    return fastMessageCreated;
  } catch (error: any) {
    throw new Error(`Error creating mensagem rápida: ${error.message}`);
  }
}

export async function updateFastMessageService(fastMessage: FastMessage) {
  try {
    const fastMessageExist = await getFastMessageByIdService(fastMessage.id);
    if (!fastMessageExist) throw new Error('mensagem rápida não encontrada');
    await updateFastMessageReporitory(fastMessage);
    if (fastMessage.departments.length > 0) {
      await associationFasMessageService(
        fastMessage.departments,
        fastMessageExist.departments,
        fastMessage.id
      );
    }
  } catch (error: any) {
    throw new Error(`Error updating mensagem rápida: ${error.message}`);
  }
}

export async function deleteFastMessageService(id: number) {
  try {
    const fastMessageExist = await getFastMessageByIdService(id);
    if (!fastMessageExist) throw new Error('mensagem rápida não encontrada');
    await deleteFastMessageRepository(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getFastMessageByIdService(id: number) {
  try {
    const fastMessage = await getFastMessageByIdRepository(id);
    return fastMessage;
  } catch (error: any) {
    throw new Error(`Error getting mensagem rápida: ${error.message}`);
  }
}

export async function getAllFastMessagesService(user: User) {
  try {
    const departmentsId = user.departments.map((department) => department.id);
    const getFastMessage: GetAllFastMessages = {
      user_id: user.id,
      company_id: user.company.id,
      departments_id: departmentsId
    };
    const fastMessages = await getAllFastMessagesRepository(getFastMessage);
    return fastMessages;
  } catch (error: any) {
    throw new Error(`Error getting all mensagens rápidas: ${error.message}`);
  }
}

async function associationFasMessageService(
  updatedDepartments: Department[],
  currentDepartments: Department[],
  idFastMessage: number
) {
  try {
    if (updatedDepartments.length === 0) {
      await removeAllFastMessageToDepartmentRepository(idFastMessage);
      return;
    }
    const updatedIds = new Set(updatedDepartments.map((d) => d.id));
    const currentIds = new Set(currentDepartments.map((d) => d.id));

    const toDisassociate = currentDepartments.filter(
      (d) => !updatedIds.has(d.id)
    );
    if (toDisassociate.length > 0) {
      for (const department of toDisassociate) {
        await removeFastMessageToDepartmentRepository(
          idFastMessage,
          department.id
        );
      }
    }

    const toAssociate = updatedDepartments.filter((d) => !currentIds.has(d.id));
    if (toAssociate.length > 0) {
      for (const department of toAssociate) {
        await addFastMessageToDepartmentRepository(
          idFastMessage,
          department.id
        );
      }
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}
