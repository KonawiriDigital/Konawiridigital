<?php
/**
 * Konawiri Digital: Kontaktformular
 * Läuft auf Standard-PHP-Hosting (hier: Hostinger).
 * Speichert NICHTS in einer Datenbank, sendet nur eine E-Mail an EMPFAENGER.
 */

// ===== Einstellungen ======================================================
const EMPFAENGER = 'info@konawiridigital.de';
const ABSENDER   = 'website@konawiridigital.de';      // Fallback-Absender für mail()
const BETREFF    = 'Neue Anfrage über konawiridigital.de';

// SMTP-Versand über das eigene Postfach (landet zuverlässig im Posteingang).
// Das Passwort steht NICHT hier, sondern in einer Datei außerhalb von public_html:
//   /home/<benutzer>/domains/konawiridigital.de/kontakt-config.php
// Inhalt:  <?php return ['smtp_pass' => 'EUER-PASSWORT'];
// Fehlt die Datei, wird wie bisher mit mail() verschickt.
const SMTP_HOST  = 'ssl://smtp.hostinger.com';
const SMTP_PORT  = 465;
const SMTP_USER  = 'info@konawiridigital.de';
const SMTP_CONFIG = __DIR__ . '/../kontakt-config.php';
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
$text .= "Unternehmen: " . ($firma ?: 'keine Angabe') . "\n";
$text .= "E-Mail:      $email\n";
$text .= "Telefon:     " . ($telefon ?: 'keine Angabe') . "\n";
$text .= "Interesse:   " . ($modell ?: 'keine Angabe') . "\n\n";
$text .= "Nachricht:\n$nachricht\n\n";
$text .= "Datenschutz-Hinweis bestätigt: ja (" . date('d.m.Y H:i') . ")\n";

$subject = '=?UTF-8?B?' . base64_encode(BETREFF) . '?=';

/** Versendet über SMTP mit Anmeldung. Gibt true/false zurück. */
function smtp_senden(string $pass, string $to, string $subject, string $text, string $replyTo): bool {
    $fp = @stream_socket_client(SMTP_HOST . ':' . SMTP_PORT, $errno, $errstr, 15);
    if (!$fp) return false;
    stream_set_timeout($fp, 15);
    $lesen = function () use ($fp) {
        $antwort = '';
        while (($zeile = fgets($fp, 515)) !== false) {
            $antwort .= $zeile;
            if (strlen($zeile) < 4 || $zeile[3] === ' ') break;
        }
        return (int) substr($antwort, 0, 3);
    };
    $befehl = function (string $cmd, array $erwartet) use ($fp, $lesen) {
        fwrite($fp, $cmd . "\r\n");
        return in_array($lesen(), $erwartet, true);
    };
    $host = $_SERVER['SERVER_NAME'] ?? 'konawiridigital.de';
    $ok = in_array($lesen(), [220], true)
        && $befehl('EHLO ' . $host, [250])
        && $befehl('AUTH LOGIN', [334])
        && $befehl(base64_encode(SMTP_USER), [334])
        && $befehl(base64_encode($pass), [235])
        && $befehl('MAIL FROM:<' . SMTP_USER . '>', [250])
        && $befehl('RCPT TO:<' . $to . '>', [250, 251])
        && $befehl('DATA', [354]);
    if ($ok) {
        $kopf  = "Date: " . date('r') . "\r\n";
        $kopf .= "From: =?UTF-8?B?" . base64_encode('Konawiri Website') . "?= <" . SMTP_USER . ">\r\n";
        $kopf .= "To: <" . $to . ">\r\n";
        $kopf .= "Reply-To: " . $replyTo . "\r\n";
        $kopf .= "Subject: " . $subject . "\r\n";
        $kopf .= "Message-ID: <" . bin2hex(random_bytes(12)) . "@konawiridigital.de>\r\n";
        $kopf .= "MIME-Version: 1.0\r\n";
        $kopf .= "Content-Type: text/plain; charset=UTF-8\r\n";
        $kopf .= "Content-Transfer-Encoding: base64\r\n";
        $body = chunk_split(base64_encode($text), 76, "\r\n");
        $ok = $befehl($kopf . "\r\n" . $body . "\r\n.", [250]);
    }
    @fwrite($fp, "QUIT\r\n");
    fclose($fp);
    return $ok;
}

$ok = false;
$config = is_readable(SMTP_CONFIG) ? include SMTP_CONFIG : null;
if (is_array($config) && !empty($config['smtp_pass'])) {
    $ok = smtp_senden($config['smtp_pass'], EMPFAENGER, $subject, $text, $email);
}
if (!$ok) {
    // Fallback: Versand über den Webserver
    $headers  = "From: Konawiri Website <" . ABSENDER . ">\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $ok = @mail(EMPFAENGER, $subject, $text, $headers, '-f' . ABSENDER);
}

antwort($ok, $ok ? '' : 'Versand fehlgeschlagen.');
