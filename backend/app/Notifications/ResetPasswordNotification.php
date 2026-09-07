<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url'), '/') . '/reset-password?token=' . $this->token
            . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Reset Password - Harmoni Stay')
            ->line('Kami menerima permintaan reset password untuk akun Anda.')
            ->action('Reset Password', $url)
            ->line('Link ini berlaku selama 60 menit. Jika Anda tidak meminta ini, abaikan email ini.');
    }
}
