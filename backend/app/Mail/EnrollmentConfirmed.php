<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EnrollmentConfirmed extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $courseName,
        public ?string $startDate,
    ) {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Enrollment Confirmed',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.enrollment-confirmed',
            with: [
                'courseName' => $this->courseName,
                'startDate' => $this->startDate,
            ],
        );
    }
}
