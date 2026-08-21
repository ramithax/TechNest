import { Plus } from "lucide-react";

export default function AddButton() {
    return (
        <button
            className="fixed bottom-6 right-6 bg-black text-white p-4 rounded-full shadow-lg hover:scale-110 transition border border-white"
        >
            <Plus size={24} />
        </button>
    );
}