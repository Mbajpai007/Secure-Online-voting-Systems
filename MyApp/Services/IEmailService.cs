using System.Threading.Tasks;

namespace MyApp.Services
{
    public interface IEmailService
    {
        Task SendVotingStartedEmailAsync(string toEmail, string voterName);
        Task SendVotingEndedEmailAsync(string toEmail, string voterName);
    }
} 