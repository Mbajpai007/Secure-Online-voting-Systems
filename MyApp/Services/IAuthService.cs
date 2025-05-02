using MyApp.Models;
using System.Threading.Tasks;

namespace MyApp.Services
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(string username, string email, string password, string role);
        Task<(User user, string token)> LoginAsync(string username, string password);
        string GenerateJwtToken(User user);
    }
} 