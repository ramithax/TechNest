using TechNest.Api.Dtos.PcBuilderDto;

namespace TechNest.Api.Services.Interfaces
{
    public interface IPcBuildService
    {
        Task<PcBuildDto> CreateBuild(int userId);

        Task<PcBuildDto?> GetBuild(int buildId, int userId);

        Task<BuildItemDto?> AddBuildItem(int buildId, int userId, BuildItemRequestDto request);

        Task<BuildItemDto?> UpdateBuildItem(int buildId, int itemId, int userId, BuildItemRequestDto request);

        Task<bool> DeleteBuildItem(int buildId, int itemId, int userId);

        Task<BuildSummaryDto?> GetSummary(int buildId, int userId);

    }
}