using Microsoft.AspNetCore.Mvc;
using PKHeX.Core;
using PKHeXWebAPI.Models;
using System.Linq;


namespace PKHeXWebAPI.Controllers
{
    [ApiController]
    [Route("api/save")]
    public class SaveController : ControllerBase
    {
       private static SaveFile? sav;

        
        [HttpPost("load")]
public IActionResult LoadSave(IFormFile file)
{
    if (file == null || file.Length == 0)
        return BadRequest("No file uploaded.");

    using var ms = new MemoryStream();
    file.CopyTo(ms);
    var bytes = ms.ToArray();

    try
    {
        sav = SaveUtil.GetSaveFile(bytes);

        if (sav == null)
            return BadRequest("Invalid or unsupported save file.");

        return Ok(new { message = "Save loaded successfully." });
    }
    catch
    {
        return BadRequest("Failed to parse save file.");
    }
}
        
        [HttpGet("pokemon/{index}")]
        public IActionResult GetPokemon(int index)
        {

if (sav == null)
    return BadRequest("No save loaded.");


            var pkm = sav.GetBoxSlotAtIndex(index);

            return Ok(new
            {
                Species = pkm.Species,
                Level = pkm.CurrentLevel,
                Shiny = pkm.IsShiny
            });
        }

        
        [HttpPost("edit/{index}")]
        public IActionResult EditPokemon(int index, [FromBody] PokemonRequest req)
        {

if (sav == null)
    return BadRequest("No save loaded.");


            var pkm = sav.GetBoxSlotAtIndex(index);

            pkm.Species = (ushort)req.Species;
            pkm.CurrentLevel = (byte)req.Level;

            if (req.Shiny)
                pkm.SetShiny();
            else
                pkm.SetPIDGender(pkm.Gender);

            sav.SetBoxSlotAtIndex(pkm, index);
            return Ok();
        }

        
        [HttpGet("legal/{index}")]
        public IActionResult CheckLegality(int index)
        {

if (sav == null)
        return BadRequest("No save loaded.");

            var pkm = sav.GetBoxSlotAtIndex(index);
            var legality = new LegalityAnalysis(pkm);

            return Ok(new
            {
                valid = legality.Valid,
                report = legality.Report()
            });
        }

        
        [HttpPost("fix/{index}")]
public IActionResult FixPokemon(int index)
{
    if (sav == null)
        return BadRequest("No save loaded.");

    var pkm = sav.GetBoxSlotAtIndex(index);
    if (pkm == null)
        return BadRequest("Invalid slot.");

    // Safe structural fixes only
    pkm.RefreshChecksum();
    pkm.SetRandomEC();

    sav.SetBoxSlotAtIndex(pkm, index);

    var legality = new LegalityAnalysis(pkm);

    return Ok(new
    {
        success = legality.Valid,
        message = legality.Valid ? "Fixed basic data." : "Still illegal — manual edits required."
    });
}

[HttpGet("boxes")]
public IActionResult GetBoxes()
{
    if (sav == null)
        return BadRequest("No save loaded.");

    var boxes = new List<List<object>>();

    for (int b = 0; b < sav.BoxCount; b++)
    {
        var box = new List<object>();

        for (int s = 0; s < sav.BoxSlotCount; s++)
        {
            var pkm = sav.GetBoxSlotAtIndex(b * sav.BoxSlotCount + s);

            box.Add(new
            {
                isEmpty = pkm.Species == 0,
                species = pkm.Species,
                level = pkm.CurrentLevel
            });
        }

        boxes.Add(box);
    }

    return Ok(new { boxes });
}


    }

    
}
