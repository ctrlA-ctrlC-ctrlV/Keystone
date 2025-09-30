import { customAlphabet } from "nanoid";
import type { SupabaseClient } from "@supabase/supabase-js";
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8); // no ambiguous chars

export function newQuoteId() {
  return `Q-${nanoid()}`; // e.g., Q-7K2M9GX4
}

export async function generateUniqueQuoteId (
    db: SupabaseClient,
    { maxTries = 5 }: { maxTries?: number } = {}
): Promise<string> {
    for(let i = 0; i < maxTries; i++){
        const canditate = newQuoteId();

        // lightweight existence check
        const { data, error } = await db
            .from("leads")
            .select("id")
            .eq("quote_id", canditate)
            .limit(1)
            .maybeSingle();

        // if error check again
        if (error){
            const { data, error } = await db
            .from("leads")
            .select("id")
            .eq("quote_id", canditate)
            .limit(1)
            .maybeSingle();
        }

        if(!data){
            return canditate; // not taken
        }
    }

    // if somehow collided repeatedly, let the DB UNIQUE constraint enforce it.
    return newQuoteId();
}