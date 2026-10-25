"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createDrink, deleteDrink, type DrinkErrors, parseDrinkInput, updateDrink } from "@/lib/drinks";

export type SaveResult = { ok: true } | { ok: false; errors: DrinkErrors; message?: string };

const SAVE_FAILED = "Couldn't save your drink. Check your connection and try again.";

export async function createDrinkAction(input: unknown): Promise<SaveResult> {
  await getCurrentUser();
  const parsed = parseDrinkInput(input);
  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors };
  }
  try {
    await createDrink(parsed.value);
  } catch (error) {
    console.error("createDrink failed", error);
    return { ok: false, errors: {}, message: SAVE_FAILED };
  }
  revalidatePath("/");
  return { ok: true };
}

export async function updateDrinkAction(id: string, input: unknown): Promise<SaveResult> {
  await getCurrentUser();
  const parsed = parseDrinkInput(input);
  if (!parsed.ok) {
    return { ok: false, errors: parsed.errors };
  }
  try {
    await updateDrink(id, parsed.value);
  } catch (error) {
    console.error("updateDrink failed", error);
    return { ok: false, errors: {}, message: SAVE_FAILED };
  }
  redirect("/history");
}

export type DeleteResult = { ok: true } | { ok: false; message: string };

export async function deleteDrinkAction(id: string): Promise<DeleteResult> {
  await getCurrentUser();
  try {
    await deleteDrink(id);
  } catch (error) {
    console.error("deleteDrink failed", error);
    return { ok: false, message: "Couldn't delete your drink. Check your connection and try again." };
  }
  revalidatePath("/history");
  return { ok: true };
}
