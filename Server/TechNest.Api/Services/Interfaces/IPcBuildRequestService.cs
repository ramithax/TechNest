using TechNest.Api.Dtos.PcBuildRequest;

namespace TechNest.Api.Services.Interfaces;

public interface IPcBuildRequestService
{
    Task<object> CreateRequest(
        int userId,
        CreatePcBuildRequestDto dto);

    Task<object?> GetRequest(
        int userId,
        int id);

    Task<List<object>> GetMyRequests(
        int userId);

    Task<List<object>> GetAdminRequests();

    Task<object?> GetAdminRequest(
        int id);

    Task<object?> ApproveRequest(
        int id,
        string? adminComment);

    Task<object?> RejectRequest(
        int id,
        string adminComment);

    Task<object?> ChangeStatus(
        int id,
        string status,
        string? adminComment);
}