-- SuperAdmin üçün məlumatları bazaya daxil etmək (Mock Data)

-- 1. Əgər SuperAdmin rolu yoxdursa əlavə edirik
INSERT INTO Roles (Name, Description) 
VALUES ('SuperAdmin', 'Sistemin tam idarəçisi')
ON CONFLICT (Name) DO NOTHING;

-- 2. Mock SuperAdmin istifadəçisini daxil edirik (Parol: password)
-- (Real layihədə parol "password" yox, Hash olunmuş vəziyyətdə saxlanılır. Məsələn, BCrypt hashı. Amma siz parolun "password" olmasını istədiyiniz üçün test məqsədli sadə mətn yazdıq)
INSERT INTO Users (Id, FirstName, LastName, Email, PasswordHash, IsActive)
VALUES (
    gen_random_uuid(), 
    'Super', 
    'Admin', 
    'superadmin', 
    'password', 
    true
)
ON CONFLICT (Email) DO NOTHING;

-- 3. SuperAdmin-ə uyğun rolu veririk
INSERT INTO UserRoles (UserId, RoleId)
SELECT u.Id, r.Id 
FROM Users u, Roles r 
WHERE u.Email = 'superadmin' AND r.Name = 'SuperAdmin'
ON CONFLICT (UserId, RoleId) DO NOTHING;
