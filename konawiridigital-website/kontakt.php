<?php
/**
 * Konawiri Digital – Kontaktformular
 * Läuft auf jedem Standard-PHP-Hosting (IONOS, Strato, all-inkl, Hetzner Webhosting …).
 * Speichert NICHTS in einer Datenbank, sendet nur eine E-Mail an EMPFAENGER.
 */

// ===== Einstellungen ======================================================
const EMPFAENGER = 'info@konawiridigital.de';
const ABSENDER   = 'website@konawiridigital.de';      // muss zur eigenen Domain gehören (SPF)
const BETREFF    = 'Neue Anfrage über konawiridigital.de';
// ==========================================================================

header('X-Content-Type-Options: nosniff');
$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function antwort(bool $ok, string $fehler = '') {
    global $wantsJson;
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code($ok ? 200 : 400);
        echo json_encode(['ok' => $ok, 'error' => $fehler]);
    } else {
        header('Location: /' . ($ok ? '?gesendet=1' : '?fehler=1') . '#kontakt', true, 303);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); exit; }

// Honeypot: Bots füllen das versteckte Feld aus
if (!empty($_POST['website'])) { antwort(true); }

$clean = function ($key, $max) {
    $v = isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
    $v = str_replace(["\r", "\0"], '', $v);
    return mb_substr($v, 0, $max);
};

$name      = $clean('name', 120);
$firma     = $clean('firma', 160);
$email     = $clean('email', 160);
$telefon   = $clean('telefon', 40);
$modell    = $clean('modell', 60);
$nachricht = $clean('nachricht', 5000);
$consent   = isset($_POST['datenschutz']) && $_POST['datenschutz'] === 'ja';

if ($name === '' || $nachricht === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$consent) {
    antwort(false, 'Bitte alle Pflichtfelder ausfüllen.');
}
// Header-Injection verhindern
foreach ([$name, $email] as $f) { if (preg_match('/[\n\r]/', $f)) antwort(false, 'Ungültige Eingabe.'); }

$text  = "Neue Anfrage über die Website\n";
$text .= "=============================\n\n";
$text .= "Name:        $name\n";
$text .= "Unternehmen: " . ($firma ?: '–') . "\n";
$text .= "E-Mail:      $email\n";
$text .= "Telefon:     " . ($telefon ?: '–') . "\n";
$text .= "Interesse:   " . ($modell ?: '–') . "\n\n";
$text .= "Nachricht:\n$nachricht\n\n";
$text .= "Datenschutz-Hinweis bestätigt: ja (" . date('d.m.Y H:i') . ")\n";

$headers  = "From: Konawiri Website <" . ABSENDER . ">\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

$subject = '=?UTF-8?B?' . base64_encode(BETREFF) . '?=';
$ok = @mail(EMPFAENGER, $subject, $text, $headers, '-f' . ABSENDER);

antwort($ok, $ok ? '' : 'Versand fehlgeschlagen.');
