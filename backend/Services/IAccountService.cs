using MyWebAPI.Models;
public interface IAccountService
{
    Task<ServiceResult<object>> UpdateProfileAsync(string userId, UpdateProfileDTO dto);
    Task<ServiceResult<object>> ChangePasswordAsync(string userId, ChangePasswordDTO dto);
}
