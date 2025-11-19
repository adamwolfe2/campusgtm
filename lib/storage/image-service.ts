import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
// Note: In a real app, we should use a proper singleton or context for this
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `workspace-assets/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from("workspace-assets")
        .upload(filePath, file);

    if (uploadError) {
        throw new Error(`Error uploading image: ${uploadError.message}`);
    }

    const { data } = supabase.storage
        .from("workspace-assets")
        .getPublicUrl(filePath);

    return data.publicUrl;
}
