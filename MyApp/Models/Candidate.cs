using System.ComponentModel.DataAnnotations;

namespace MyApp.Models
{
    public class Candidate
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(100)]
        public string Party { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        public int VoteCount { get; set; }

        public bool IsActive { get; set; } = true;
    }
} 