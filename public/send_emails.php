<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '/home/scan/vendor/autoload.php';

header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'No data received']);
    exit;
}

$successCount = 0;
$errorCount = 0;

foreach ($input as $emailData) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->SMTPDebug = 0;
        $mail->isSMTP();
        $mail->Host = '';  // Specify main and backup SMTP servers
        $mail->SMTPAuth = true;
        $mail->Username = '';  // SMTP username
        $mail->Password = '';  // SMTP password
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Recipients
        $mail->setFrom('', 'Municipalidad de Baradero');
        $mail->addAddress($emailData['to'], $emailData['name']);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $emailData['subject'];
        $mail->Body = $emailData['body'];

        $mail->send();
        $successCount++;
    } catch (Exception $e) {
        $errorCount++;
    }
}

echo json_encode([
    'success' => $errorCount === 0,
    'message' => "Emails sent: $successCount, Errors: $errorCount"
]);