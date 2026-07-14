'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getCommerceSession } from '@/lib/commerce/commerce-server';

const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Enter your full name.').max(120, 'Name is too long.'),
});
const avatarPathSchema = z.string().regex(/^[0-9a-f-]{36}\/avatar-[0-9]+\.(?:jpg|png|webp)$/i);

export interface ProfileActionResult {
  error?: string;
  success?: string;
}

export async function updateProfileAction(formData: FormData): Promise<ProfileActionResult> {
  const parsed = profileSchema.safeParse({ fullName: formData.get('fullName') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check your name.' };

  const { repository, user } = await getCommerceSession();
  if (!repository || !user) redirect('/login?next=%2Faccount');

  try {
    await repository.updateProfile(user.id, parsed.data.fullName);
    revalidatePath('/account');
    return { success: 'Your profile was updated.' };
  } catch {
    return { error: 'We could not update your profile. Please try again.' };
  }
}

export async function updateAvatarAction(avatarPath: string): Promise<ProfileActionResult> {
  const parsed = avatarPathSchema.safeParse(avatarPath);
  if (!parsed.success) return { error: 'That avatar path is not valid.' };

  const { repository, user } = await getCommerceSession();
  if (!repository || !user) redirect('/login?next=%2Faccount');
  if (!parsed.data.startsWith(`${user.id}/`))
    return { error: 'That avatar does not belong to your account.' };

  try {
    await repository.updateAvatar(user.id, parsed.data);
    revalidatePath('/account');
    return { success: 'Your avatar was updated.' };
  } catch {
    return { error: 'We could not save your avatar. Please try again.' };
  }
}
