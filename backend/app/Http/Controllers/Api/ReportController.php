<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;

class ReportController extends Controller
{
    private function dateRange(Request $request): array
    {
        $to = $request->filled('to') ? Carbon::parse($request->query('to'))->endOfDay() : now()->endOfDay();
        $from = $request->filled('from')
            ? Carbon::parse($request->query('from'))->startOfDay()
            : $to->copy()->subDays(29)->startOfDay();

        return [$from, $to];
    }

    public function summary(Request $request): JsonResponse
    {
        [$from, $to] = $this->dateRange($request);
        $groupBy = $request->query('group_by', 'day') === 'month' ? 'month' : 'day';

        $base = Reservation::with(['payment', 'room:id,name'])
            ->whereBetween('created_at', [$from, $to]);

        $reservations = $base->get();
        $paid = $reservations->filter(fn ($r) => $r->payment?->status === 'paid');
        $cancelled = $reservations->filter(fn ($r) => $r->payment?->status === 'cancelled');

        $format = $groupBy === 'month' ? 'Y-m' : 'Y-m-d';
        $breakdown = $paid
            ->groupBy(fn ($r) => $r->created_at->format($format))
            ->map(fn ($group, $period) => [
                'period' => $period,
                'bookings' => $group->count(),
                'revenue' => (int) $group->sum('price'),
            ])
            ->sortKeys()
            ->values();

        $topRooms = $paid
            ->groupBy('room_id')
            ->map(fn ($group) => [
                'room_id' => $group->first()->room_id,
                'name' => $group->first()->room?->name ?? 'Kamar #' . $group->first()->room_id,
                'bookings' => $group->count(),
                'revenue' => (int) $group->sum('price'),
            ])
            ->sortByDesc('bookings')
            ->take(5)
            ->values();

        return response()->json([
            'data' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'total_bookings' => $reservations->count(),
                'paid_bookings' => $paid->count(),
                'cancelled_bookings' => $cancelled->count(),
                'total_revenue' => (int) $paid->sum('price'),
                'total_discount' => (int) $paid->sum('discount_amount'),
                'breakdown' => $breakdown,
                'top_rooms' => $topRooms,
            ],
        ]);
    }

    public function exportBookings(Request $request): Response
    {
        [$from, $to] = $this->dateRange($request);
        $status = $request->query('status');

        $query = Reservation::with(['user:id,name,email', 'room:id,name', 'payment'])
            ->whereBetween('created_at', [$from, $to])
            ->orderBy('created_at');

        if ($status && in_array($status, ['unpaid', 'paid', 'cancelled'], true)) {
            $query->whereHas('payment', fn ($q) => $q->where('status', $status));
        }

        $rows = $query->get();

        $csv = fopen('php://temp', 'w+');
        fputcsv($csv, [
            'ID', 'Tamu', 'Email', 'Kamar', 'Check-in', 'Check-out',
            'Malam', 'Subtotal', 'Diskon', 'Total', 'Status', 'Refund', 'Dibuat',
        ]);

        foreach ($rows as $r) {
            $nights = max(1, $r->start_date->diffInDays($r->end_date));
            fputcsv($csv, [
                $r->id,
                $r->user?->name,
                $r->user?->email,
                $r->room?->name,
                $r->start_date->format('Y-m-d'),
                $r->end_date->format('Y-m-d'),
                $nights,
                $r->price + $r->discount_amount,
                $r->discount_amount,
                $r->price,
                $r->payment?->status ?? 'unpaid',
                $r->refund_status,
                $r->created_at->format('Y-m-d H:i'),
            ]);
        }

        rewind($csv);
        $content = stream_get_contents($csv);
        fclose($csv);

        $filename = 'bookings-' . $from->toDateString() . '-to-' . $to->toDateString() . '.csv';

        return response($content, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
