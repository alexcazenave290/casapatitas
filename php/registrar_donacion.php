<?php
session_set_cookie_params(['path' => '/proyecto/']);
session_start();
header('Content-Type: application/json');
require 'conexion.php';

if (!isset($_SESSION['user_mail']) || !isset($_SESSION['user_rol'])) {
    echo json_encode(['success' => false, 'message' => 'Sesión no iniciada.']);
    exit;
}

// Solo usuarios pueden ser donantes
if ($_SESSION['user_rol'] !== 'usuario') {
    echo json_encode(['success' => false, 'message' => 'Solo los usuarios pueden realizar donaciones.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Datos inválidos.']);
    exit;
}

$mail_us = $_SESSION['user_mail'];
$plataforma = $input['plataforma'] ?? '';
$donacion_pagina = $input['donacion_pagina'] ?? false;
$id_inst = $input['id_inst'] ?? null;
$destino = $input['destino'] ?? '';
$monto = 100; // Monto fijo de ejemplo, puedes cambiarlo

// Validar que si no es donación a la página, debe tener id_inst
if (!$donacion_pagina && !$id_inst) {
    echo json_encode(['success' => false, 'message' => 'Debes seleccionar una institución.']);
    exit;
}

try {
    // Marcar al usuario como donante
    $sql = "UPDATE Usuario SET donante = 1 WHERE mail_us = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$mail_us]);

    // Obtener el siguiente ID de donación
    $sqlMaxId = "SELECT COALESCE(MAX(id_Don), 0) + 1 as next_id FROM Donacion";
    $stmtMaxId = $pdo->query($sqlMaxId);
    $nextId = $stmtMaxId->fetch(PDO::FETCH_ASSOC)['next_id'];

    // Registrar la donación en la tabla
    $sqlDonacion = "INSERT INTO Donacion (id_Don, id_inst, mail_us, monto_don, destino_don, fecha_don, medioPago_don, donacion_pagina) 
                    VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?)";
    $stmtDonacion = $pdo->prepare($sqlDonacion);
    $stmtDonacion->execute([$nextId, $id_inst, $mail_us, $monto, $destino, $plataforma, $donacion_pagina ? 1 : 0]);
    
    echo json_encode([
        'success' => true, 
        'message' => '¡Gracias por tu donación! Ahora eres un donante premium.',
        'plataforma' => $plataforma
    ]);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>

