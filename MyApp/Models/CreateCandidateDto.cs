using System.ComponentModel.DataAnnotations;

namespace MyApp.Models
{
    public class CreateCandidateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(100)]
        public string Party { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }
    }
} 