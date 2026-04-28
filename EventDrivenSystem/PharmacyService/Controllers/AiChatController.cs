using Microsoft.AspNetCore.Mvc;
using PharmacyService.Services;

namespace PharmacyService.Controllers;

public record ChatRequest(List<ChatMessage> Messages, string Language = "en");

[ApiController]
[Route("api/ai")]
public class AiChatController : ControllerBase
{
    private readonly IPharmaAiChatService _chatService;
    public AiChatController(IPharmaAiChatService chatService) => _chatService = chatService;

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (request.Messages is not { Count: > 0 })
            return BadRequest(new { error = "Messages are required." });
        try
        {
            var reply = await _chatService.ChatAsync(request.Messages, request.Language ?? "en");
            return Ok(new { reply });
        }
        catch (InvalidOperationException ex) { return StatusCode(503, new { error = ex.Message }); }
        catch (HttpRequestException ex) { return StatusCode(502, new { error = ex.Message }); }
    }
}
