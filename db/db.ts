import { createClient } from "jsr:@supabase/supabase-js@2";
import { Song } from "./interfaces.ts";


const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_KEY")!,
);

export async function insertSongs(songs: Song[]) {
    if(songs.length === 0) return;

}



export async function supabaseSetup(): Promise<any>{

    const resource = await supabase
        .from("mood")
        .insert([{ 
            type: "Calm"
        }])
        .select();


    if (resource.error) {
        console.error(resource.error);
    }
}