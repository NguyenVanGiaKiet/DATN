using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MyWebAPI.Data;
using MyWebAPI.Models;

public class AccountService : IAccountService
{
    private readonly AppDbContext _context;
    private readonly PasswordHasher<Account> _passwordHasher;

    public AccountService(AppDbContext context)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<Account>();
    }

    public async Task<ServiceResult<object>> UpdateProfileAsync(string userId, UpdateProfileDTO dto)
    {
        var account = await _context.Accounts.FindAsync(Guid.Parse(userId));
        if (account == null)
            return ServiceResult<object>.Failure("Account not found.");

        account.Username = dto.Username;
        account.Email = dto.Email;

        _context.Accounts.Update(account);
        await _context.SaveChangesAsync();

        return ServiceResult<object>.SuccessResult(new
        {
            account.AccountID,
            account.Username,
            account.Email,
            account.Role
        });
    }

    public async Task<ServiceResult<object>> ChangePasswordAsync(string userId, ChangePasswordDTO dto)
    {
        var account = await _context.Accounts.FindAsync(Guid.Parse(userId));
        if (account == null)
            return ServiceResult<object>.Failure("Account not found.");

        var result = _passwordHasher.VerifyHashedPassword(account, account.Password, dto.CurrentPassword);
        if (result == PasswordVerificationResult.Failed)
            return ServiceResult<object>.Failure("Old password is incorrect.");

        account.Password = _passwordHasher.HashPassword(account, dto.NewPassword);
        _context.Accounts.Update(account);
        await _context.SaveChangesAsync();

        return ServiceResult<object>.SuccessResult(null);
    }
}
