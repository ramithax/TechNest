import { apiClient } from '../lib/apiClient';

export const repairService = {
    getAllRepairs: () => apiClient('/Repair'),

    getRepairById: (id) => apiClient(`/Repair/${id}`),

    createRepair: (data) => apiClient('/Repair', {
        method: 'POST',
        body: JSON.stringify(data)
    }),

    updateRepair: (id, data) => apiClient(`/Repair/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    }),

    deleteRepair: (id) => apiClient(`/Repair/${id}`, {
        method: 'DELETE'
    }),

    updateStatus: (id, status, technicianId = null) => apiClient(`/Repair/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, technicianId })
    })
};