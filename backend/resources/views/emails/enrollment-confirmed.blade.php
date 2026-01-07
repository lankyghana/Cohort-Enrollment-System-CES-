<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Enrollment Confirmed</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.5;">
    <h2>Enrollment Confirmed</h2>

    <p>Your enrollment has been confirmed.</p>

    <p><strong>Course:</strong> {{ $courseName }}</p>

    @if(!empty($startDate))
      <p><strong>Start date:</strong> {{ $startDate }}</p>
    @endif

    <p>Stay tuned for updates.</p>
  </body>
</html>
