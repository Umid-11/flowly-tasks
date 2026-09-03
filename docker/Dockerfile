# ============================================================
# MƏRHƏLƏ 1: BUILD (Tətbiqi yığmaq üçün)
# dotnet SDK image-i istifadə edirik - kod compile etmək üçün lazımdır
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

# Konteyner daxilindəki iş qovluğunu təyin edirik
WORKDIR /src

# DevExpress fallback qovluğunu bypass etmək üçün təmiz NuGet.Config kopyalayırıq
COPY docker/NuGet.Config /root/.nuget/NuGet/NuGet.Config

# Əvvəlcə yalnız .csproj fayllarını kopyalayırıq
# Bu, NuGet paketlərini cache-ləmək üçündür (daha sürətli build)
# NOT: COPY yolları build context-dən (flowly-tasks/) başlayır
COPY backend/Flowly.Api/Flowly.Api.csproj           Flowly.Api/
COPY backend/Flowly.Application/Flowly.Application.csproj   Flowly.Application/
COPY backend/Flowly.Domain/Flowly.Domain.csproj           Flowly.Domain/
COPY backend/Flowly.Infrastructure/Flowly.Infrastructure.csproj Flowly.Infrastructure/

# NuGet paketlərini yükləyirik (restore)
RUN dotnet restore Flowly.Api/Flowly.Api.csproj

# İndi bütün source kodu kopyalayırıq
COPY backend/ .

# Tətbiqi Release modunda publish edirik
# -o /app/publish - nəticəni bu qovluğa yaz
RUN dotnet publish Flowly.Api/Flowly.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ============================================================
# MƏRHƏLƏ 2: RUNTIME (Yalnız işlətmək üçün - kiçik image)
# SDK yox, yalnız ASP.NET runtime lazımdır
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime

WORKDIR /app

# Build mərhələsindən yalnız publish edilmiş faylları götürürük
# Bu sayədə final image çox kiçik olur (SDK olmadan)
COPY --from=build /app/publish .

# Tətbiqin işləyəcəyi port (ASP.NET default: 8080)
EXPOSE 8080

# Konteyner başlayanda bu əmr icra olunur
ENTRYPOINT ["dotnet", "Flowly.Api.dll"]
