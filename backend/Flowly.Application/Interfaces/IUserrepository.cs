using System.Collections.Generic;
using Flowly.Domain.Entities;

namespace Flowly.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetUserByIdAsync(int id);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<List<User>> GetAllUsersAsync();
    Task<bool> AddUserAsync(User user);
    Task<bool> UpdateAsync(User user);
}