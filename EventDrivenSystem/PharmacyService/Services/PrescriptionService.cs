using Microsoft.EntityFrameworkCore;
using PharmacyService.Data;
using PharmacyService.DTOs;
using PharmacyService.Models;

namespace PharmacyService.Services;

public interface IPrescriptionService
{
    Task<List<Prescription>> GetAllAsync();
    Task<Prescription?> GetByIdAsync(int id);
    Task<List<Prescription>> GetByPhoneAsync(string phone);
    Task<Prescription> CreateAsync(CreatePrescriptionDto dto);
    Task<Prescription?> UpdateStatusAsync(int id, string status);
    Task<string> UploadImageAsync(IFormFile file, string rootPath);
}

public class PrescriptionService : IPrescriptionService
{
    private readonly PharmacyDbContext _db;
    public PrescriptionService(PharmacyDbContext db) => _db = db;

    public async Task<List<Prescription>> GetAllAsync() =>
        await _db.Prescriptions.Include(p => p.Items).ThenInclude(i => i.Medicine).AsNoTracking().OrderByDescending(p => p.CreatedAt).ToListAsync();

    public async Task<Prescription?> GetByIdAsync(int id) =>
        await _db.Prescriptions.Include(p => p.Items).ThenInclude(i => i.Medicine).AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);

    public async Task<List<Prescription>> GetByPhoneAsync(string phone)
    {
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        var tail = digits.Length >= 10 ? digits[^10..] : digits;
        var all = await _db.Prescriptions.Include(p => p.Items).ThenInclude(i => i.Medicine)
            .AsNoTracking().OrderByDescending(p => p.CreatedAt).ToListAsync();
        return all.Where(p =>
        {
            var d = new string(p.CustomerPhone.Where(char.IsDigit).ToArray());
            return d.EndsWith(tail);
        }).ToList();
    }

    public async Task<Prescription> CreateAsync(CreatePrescriptionDto dto)
    {
        var prescription = new Prescription
        {
            CustomerName = dto.CustomerName, CustomerPhone = dto.CustomerPhone,
            CustomerEmail = dto.CustomerEmail, DoctorName = dto.DoctorName,
            Notes = dto.Notes, ImageUrl = dto.ImageUrl,
            Status = PrescriptionStatus.Pending,
            CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
        };
        foreach (var item in dto.Items)
            prescription.Items.Add(new PrescriptionItem { MedicineId = item.MedicineId, Quantity = item.Quantity });
        _db.Prescriptions.Add(prescription);
        await _db.SaveChangesAsync();
        return prescription;
    }

    public async Task<Prescription?> UpdateStatusAsync(int id, string status)
    {
        if (!Enum.TryParse<PrescriptionStatus>(status, true, out var parsed))
            throw new InvalidOperationException($"Invalid status: {status}");
        var prescription = await _db.Prescriptions.FindAsync(id);
        if (prescription == null) return null;
        prescription.Status = parsed;
        prescription.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return prescription;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string rootPath)
    {
        var dir = Path.Combine(rootPath, "uploads", "prescriptions");
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
        using var stream = new FileStream(Path.Combine(dir, fileName), FileMode.Create);
        await file.CopyToAsync(stream);
        return $"/uploads/prescriptions/{fileName}";
    }
}
