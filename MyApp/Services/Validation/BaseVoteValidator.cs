using System.Threading.Tasks;

namespace MyApp.Services.Validation
{
    public abstract class BaseVoteValidator : IVoteValidator
    {
        private IVoteValidator? _nextValidator;

        public IVoteValidator SetNext(IVoteValidator validator)
        {
            _nextValidator = validator;
            return validator;
        }

        public async Task<ValidationResult> ValidateAsync(VoteValidationContext context)
        {
            var result = await ValidateInternalAsync(context);
            
            if (!result.IsValid)
            {
                return result;
            }

            if (_nextValidator != null)
            {
                return await _nextValidator.ValidateAsync(context);
            }

            return result;
        }

        protected abstract Task<ValidationResult> ValidateInternalAsync(VoteValidationContext context);
    }
} 