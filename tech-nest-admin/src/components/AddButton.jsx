import { Plus } from "lucide-react";

export default function AddButton() {
    return (
        <button
            type="button"
            className="flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 rounded-lg shadow-lg hover:bg-zinc-200 transition border border-zinc-300"
        >
            <Plus size={20} />
            <span className="text-sm font-medium">
                Add Product
            </span>
        </button>
    );
}