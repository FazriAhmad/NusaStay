<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['key', 'value', 'type', 'group'])]
class Setting extends Model
{
    public static function defaults(): array
    {
        return [
            'site_name' => ['value' => 'NusaStay', 'type' => 'string', 'group' => 'general'],
            'site_tagline' => ['value' => 'Menginap Terbaik di Nusantara', 'type' => 'string', 'group' => 'general'],
            'contact_email' => ['value' => 'halo@nusastay.id', 'type' => 'string', 'group' => 'general'],
            'contact_phone' => ['value' => '(021) 5090-2026', 'type' => 'string', 'group' => 'general'],
            'address' => ['value' => 'SCBD Lot 8, Jl. Jend. Sudirman, Jakarta Selatan', 'type' => 'string', 'group' => 'general'],
            'announcement' => ['value' => 'Promo HEMAT20: diskon 20% s.d. Rp300rb untuk semua properti hingga Maret 2027!', 'type' => 'string', 'group' => 'general'],
            'maintenance' => ['value' => '0', 'type' => 'boolean', 'group' => 'general'],
            'currency' => ['value' => 'IDR', 'type' => 'string', 'group' => 'general'],
            'tax_percent' => ['value' => '10', 'type' => 'integer', 'group' => 'pricing'],
            'service_fee' => ['value' => '25000', 'type' => 'integer', 'group' => 'pricing'],
            'check_in_time' => ['value' => '14:00', 'type' => 'string', 'group' => 'booking'],
            'check_out_time' => ['value' => '12:00', 'type' => 'string', 'group' => 'booking'],
            'min_nights' => ['value' => '1', 'type' => 'integer', 'group' => 'booking'],
            'max_guests_per_room' => ['value' => '6', 'type' => 'integer', 'group' => 'booking'],
            'cancellation_cutoff_hours' => ['value' => '24', 'type' => 'integer', 'group' => 'booking'],
        ];
    }

    public static function get(string $key, ?string $fallback = null): ?string
    {
        $row = self::query()->where('key', $key)->first();
        if ($row) {
            return self::cast($row->value, $row->type);
        }
        foreach (self::defaults() as $k => $meta) {
            if ($k === $key) {
                return self::cast($meta['value'], $meta['type']);
            }
        }
        return $fallback;
    }

    public static function getAll(): array
    {
        $stored = self::query()->get()->keyBy('key');
        $result = [];
        foreach (self::defaults() as $key => $meta) {
            $row = $stored->get($key);
            $result[$key] = [
                'key' => $key,
                'value' => self::cast($row?->value ?? $meta['value'], $meta['type']),
                'type' => $meta['type'],
                'group' => $meta['group'],
            ];
        }
        return $result;
    }

    public static function setMany(array $items): void
    {
        foreach ($items as $key => $value) {
            $meta = self::defaults()[$key] ?? ['type' => 'string', 'group' => 'general'];
            self::query()->updateOrCreate(
                ['key' => $key],
                ['value' => (string) $value, 'type' => $meta['type'], 'group' => $meta['group']]
            );
        }
    }

    private static function cast(mixed $value, string $type): mixed
    {
        return match ($type) {
            'integer' => (int) $value,
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'json' => is_string($value) ? json_decode($value, true) : $value,
            default => (string) $value,
        };
    }
}
