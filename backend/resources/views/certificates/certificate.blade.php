<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Certificate</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; margin: 0; padding: 0; }
        .page { width: 100%; height: 100%; padding: 48px; box-sizing: border-box; }
        .frame { border: 6px solid #111827; padding: 34px; height: 100%; box-sizing: border-box; }
        .meta { font-size: 12px; color: #374151; }
        .brand { font-size: 14px; letter-spacing: 3px; text-transform: uppercase; color: #111827; }
        .title { font-size: 42px; font-weight: 700; margin: 18px 0 0; color: #111827; }
        .subtitle { font-size: 16px; margin-top: 10px; color: #374151; }
        .name { font-size: 34px; font-weight: 700; margin-top: 22px; color: #111827; }
        .course { font-size: 20px; margin-top: 10px; color: #111827; }
        .footer { margin-top: 38px; display: table; width: 100%; }
        .col { display: table-cell; vertical-align: bottom; }
        .right { text-align: right; }
        .line { border-top: 1px solid #9CA3AF; margin-top: 42px; }
    </style>
</head>
<body>
<div class="page">
    <div class="frame">
        <div class="brand">{{ config('app.name') }}</div>
        <div class="title">Certificate of Completion</div>
        <div class="subtitle">This certifies that</div>

        <div class="name">{{ $student?->name ?? 'Student' }}</div>
        <div class="subtitle">has successfully completed</div>
        <div class="course">{{ $course?->title ?? 'Course' }}</div>

        <div class="footer">
            <div class="col">
                <div class="meta">Issued: {{ optional($certificate->issued_at)->format('M d, Y') }}</div>
                <div class="meta">Certificate ID: {{ $certificate->id }}</div>
            </div>
            <div class="col right">
                <div class="meta">Authorized Signature</div>
                <div class="line"></div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
