<?php
session_set_cookie_params(['path' => '/proyecto/']);
session_start();
header('Content-Type: application/json');
require 'conexion.php';

try {
    // Obtener todas las instituciones con su información básica
    $sql = "SELECT id_inst, nomb_inst, email_inst, logo_inst FROM Institucion ORDER BY nomb_inst ASC";
    $stmt = $pdo->query($sql);
    $instituciones = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'instituciones' => $instituciones
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener instituciones: ' . $e->getMessage()
    ]);
}
?>

