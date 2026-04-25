namespace User.Infrastructure.Repositories;

public interface IUserRepository
{
    Task<Core.UserEntity?> GetByIdAsync(int id);
    Task<IEnumerable<Core.UserEntity>> GetAllAsync();
    Task<Core.UserEntity> CreateAsync(Core.UserEntity user);
    Task<Core.UserEntity> UpdateAsync(Core.UserEntity user);
    Task<bool> DeleteAsync(int id);
}
