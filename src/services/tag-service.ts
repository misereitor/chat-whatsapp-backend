import { Department } from '../model/department-model';
import { createTag, Tag } from '../model/tag-model';
import { User } from '../model/user-model';
import {
  associateTagToDepartmentRepository,
  createTagRepository,
  deleteTagRepository,
  desassociateTagFromDepartmentRepository,
  getTagsByUserRepository,
  getTagByIdRepository,
  updateTagRepository,
  desassociateAllTagFromDepartmentRepository
} from '../repository/tag-repository';

export async function createTagService(tag: createTag) {
  try {
    const newTag = await createTagRepository(tag);
    if (!newTag.id) throw new Error('Erro ao criar tag');
    if (tag.departments.length > 0) {
      for (const department_id of tag.departments) {
        await associateTagToDepartmentRepository(newTag.id, department_id);
      }
    }
    return newTag;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getAllTagsByCompanyService(
  companyId: number,
  user: User
) {
  try {
    return await getTagsByUserRepository(user.id, companyId);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateTagService(tag: Tag) {
  try {
    if (!tag.id) throw new Error('Tag não encontrada');
    const tagExist = await getTagByIdRepository(tag.id);
    if (!tagExist) throw new Error('Tag não encontrada');
    await associationTagService(tag.departments, tagExist.departments, tag.id);
    await updateTagRepository(tag);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteTagService(id: number) {
  try {
    const tagExist = await getTagByIdRepository(id);
    if (!tagExist) throw new Error('Tag não encontrada');
    await deleteTagRepository(id);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function associationTagService(
  updatedDepartments: Department[],
  currentDepartments: Department[],
  idTag: number
) {
  if (updatedDepartments.length === 0) {
    await desassociateAllTagFromDepartmentRepository(idTag);
    return;
  }
  const updatedIds = new Set(updatedDepartments.map((d) => d.id));
  const currentIds = new Set(currentDepartments.map((d) => d.id));

  const toDisassociate = currentDepartments.filter(
    (d) => !updatedIds.has(d.id)
  );
  if (toDisassociate.length > 0) {
    for (const department of toDisassociate) {
      await desassociateTagFromDepartmentRepository(idTag, department.id);
    }
  }

  const toAssociate = updatedDepartments.filter((d) => !currentIds.has(d.id));
  if (toAssociate.length > 0) {
    for (const department of toAssociate) {
      await associateTagToDepartmentRepository(idTag, department.id);
    }
  }
}
