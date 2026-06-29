namespace Flowly.Application.Interfaces;

public interface IDepartmentRepository
{
    Task<int> CreateDepartmentAsync(Department department);
    Task<Department> GetDepartmentByIdAsync(int id);
    Task<IEnumerable<Department>> GetAllDepartmentsAsync();
    Task<bool> UpdateDepartmentAsync(Department department);
    Task<bool> DeleteDepartmentAsync(int id);
}