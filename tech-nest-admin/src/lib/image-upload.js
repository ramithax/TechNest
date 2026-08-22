import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_KEY;

if (!url || !key) {
    throw new Error("Supabase environment variables are missing");
}

const supabase = createClient(url, key);

export async function uploadImage(file) {
    if (!file) {
        throw new Error("No image file selected");
    }

    const extension = file.name.split(".").pop();

    const filename = `${Date.now()}_${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
        .from("TechNest")
        .upload(filename, file);

    if (error) {
        throw new Error(error.message);
    }

    const { data } = supabase.storage
        .from("TechNest")
        .getPublicUrl(filename);

    if (!data?.publicUrl) {
        throw new Error("Failed to get image URL");
    }

    return data.publicUrl;
}