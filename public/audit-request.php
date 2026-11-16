<?php
/**
 * Free marketing audit request from the home page CTA (src/components/AuditForm.jsx).
 * Validates the email and website again on the server, then emails the team.
 * Needs PHP mail() on the host (standard on cPanel). Responds with JSON.
 */

const TO = 'info@finaze.com.au';
const FROM = 'no-reply@finaze.com.au'; // must be an address on this domain so SPF/DKIM pass

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function respond(int $code, array $body): void
{
    http_response_code($code);
    echo json_encode($body);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['ok' => false, 'message' => 'Method not allowed']);
}

// Bots: the hidden "company" field is filled, or the form was sent within 2 seconds of loading.
// Pretend it worked so they get no signal.
if (trim($_POST['company'] ?? '') !== '' || (int) ($_POST['elapsed'] ?? 0) < 2) {
    respond(200, ['ok' => true]);
}

// Simple per-IP throttle: 5 requests per 10 minutes.
$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$bucket = sys_get_temp_dir() . '/finaze-audit-' . md5($ip);
$recent = array_filter(
    is_file($bucket) ? array_map('intval', file($bucket, FILE_IGNORE_NEW_LINES)) : [],
    fn ($t) => $t > time() - 600
);
if (count($recent) >= 5) {
    respond(429, ['ok' => false, 'message' => 'Too many requests. Please try again later.']);
}

// Strip control characters (blocks header injection) and trim.
$clean = fn ($v) => trim(preg_replace('/[\x00-\x1F\x7F]/u', '', (string) $v));
$email = $clean($_POST['email'] ?? '');
$website = $clean($_POST['website'] ?? '');

$errors = [];
if ($email === '') {
    $errors['email'] = 'Please enter your email address.';
} elseif (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address, like name@business.com.au.';
}

$url = preg_match('#^https?://#i', $website) ? $website : 'https://' . $website;
if ($website === '') {
    $errors['website'] = 'Please enter your website address.';
} elseif (
    strlen($website) > 300
    || !filter_var($url, FILTER_VALIDATE_URL)
    || !preg_match('/^([a-z0-9-]+\.)+[a-z]{2,}$/i', (string) parse_url($url, PHP_URL_HOST))
) {
    $errors['website'] = 'Please enter a valid website address, like yourbusiness.com.au.';
}

if ($errors) {
    respond(422, ['ok' => false, 'message' => 'Please check the form.', 'errors' => $errors]);
}

$when = (new DateTime('now', new DateTimeZone('Australia/Melbourne')))->format('j F Y, g:i a');
$subject = 'Free marketing audit request: ' . parse_url($url, PHP_URL_HOST);
$message = implode("\r\n", [
    'A free marketing audit was requested from the Finaze home page.',
    '',
    'Email:   ' . $email,
    'Website: ' . $url,
    'Sent:    ' . $when . ' (Melbourne)',
    '',
    'Reply to this email to contact the requester directly.',
]);
$headers = implode("\r\n", [
    'From: Finaze website <' . FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: PHP/' . PHP_VERSION,
]);

if (!mail(TO, $subject, $message, $headers, '-f' . FROM)) {
    respond(500, ['ok' => false, 'message' => 'The email could not be sent.']);
}

$recent[] = time();
@file_put_contents($bucket, implode("\n", $recent));

respond(200, ['ok' => true]);
