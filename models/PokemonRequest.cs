namespace PKHeXWebAPI.Models
{
    public class PokemonRequest
    {
        public int Species { get; set; }
        public int Level { get; set; }
        public bool Shiny { get; set; }
    }
}
