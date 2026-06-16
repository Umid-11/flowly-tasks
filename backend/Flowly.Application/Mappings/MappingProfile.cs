using AutoMapper;
using Flowly.Application.Commands.Auth.Register;
using Flowly.Domain.Entities;

namespace Flowly.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // RegisterCommand -> User mapping (eyni adlı sahələr avtomatik köçürülür)
        CreateMap<RegisterCommand, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore()) // Şifrəni Handler-də set edirik
            .ForMember(dest => dest.RoleId, opt => opt.Ignore())        // RoleId-ni Handler-də set edirik
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore())
            .ForMember(dest => dest.AvatarUrl, opt => opt.Ignore())
            .ForMember(dest => dest.Role, opt => opt.Ignore());
    }
}
