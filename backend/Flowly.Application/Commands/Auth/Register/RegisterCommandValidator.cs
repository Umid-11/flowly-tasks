using FluentValidation;

namespace Flowly.Application.Commands.Auth.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Ad boş ola bilməz")
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Soyad boş ola bilməz")
            .MaximumLength(100);

        RuleFor(x => x.UserName)
            .NotEmpty().WithMessage("İstifadəçi adı boş ola bilməz")
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email boş ola bilməz")
            .EmailAddress().WithMessage("Düzgün bir email daxil edin");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifrə boş ola bilməz")
            .MinimumLength(8).WithMessage("Şifrə ən az 8 simvol olmalıdır");
    }
}
