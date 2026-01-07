<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'full_name',
        'avatar_url',
        'role',
        'status',
        'has_active_enrollment',
        'phone',
        'bio',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'has_active_enrollment' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin' || $this->isEnvAdmin();
    }

    /**
     * Env-based admin allowlist. Supports either:
     * - ADMIN_EMAILS="a@b.com,c@d.com"
     * - ADMIN_EMAIL="a@b.com" (legacy/single)
     */
    public static function adminEmailAllowlist(): array
    {
        $raw = (string) (env('ADMIN_EMAILS') ?: env('ADMIN_EMAIL') ?: '');
        if ($raw === '') {
            return [];
        }

        return array_values(array_filter(array_map(
            static fn ($email) => strtolower(trim((string) $email)),
            preg_split('/\s*,\s*/', $raw) ?: []
        )));
    }

    public function isEnvAdmin(): bool
    {
        $email = strtolower((string) $this->email);
        if ($email === '') {
            return false;
        }

        return in_array($email, self::adminEmailAllowlist(), true);
    }

    public function isInstructor(): bool
    {
        return $this->role === 'instructor';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }
}