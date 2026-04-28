using Microsoft.AspNetCore.Mvc;
using RestaurantService.Services;

namespace RestaurantService.Controllers;

public record ChatRequest(List<ChatMessage> Messages);

[ApiController]
[Route("api/ai")]
public class AiChatController : ControllerBase
{
    private readonly IAiChatService _chatService;

    public AiChatController(IAiChatService chatService) => _chatService = chatService;

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (request.Messages is not { Count: > 0 })
            return BadRequest(new { error = "Messages are required." });

        try
        {
            var reply = await _chatService.ChatAsync(request.Messages);
            return Ok(new { reply });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(503, new { error = ex.Message });
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(502, new { error = ex.Message });
        }
    }
}
