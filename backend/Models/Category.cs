using System.ComponentModel.DataAnnotations;

namespace MyWebAPI.Models
{
    public class Category
    {
        [Key]
        public int CategoryID { get; set; }

        [Required]
        [StringLength(100)]
        public string? CategoryName { get; set; }

        [Required]
        [StringLength(500)]
        public string? Description { get; set; }

        // Navigation properties
        public virtual ICollection<Product>? Products { get; set; }
    }
} 