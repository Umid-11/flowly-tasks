using MediatR;
using AutoMapper;
using Flowly.Application.Interfaces;
using Flowly.Domain.Entities;

namespace Flowly.Application.Commands.Auth.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;
    public RegisterCommandHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }
    public async Task<bool> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _userRepository.GetUserByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return false;
        }
        var user  = _mapper.Map<User>(request);

        user.PasswordHash = _passwordHasher.Hash(request.Password);
        user.RoleId = 4;
        var result = await _userRepository.AddUserAsync(user);
        return result; 
        

    }
}