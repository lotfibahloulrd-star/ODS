<?php
// Simple API endpoint for contract document uploads and retrieval
// Assumes the project runs a PHP server for handling API calls.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$method = $_SERVER['REQUEST_METHOD'];

// Simple authentication placeholder – in real app, replace with proper auth
function isLogisticsUser($email) {
    return strtolower($email) === 'boumedjmadjen.amina@esclab-algerie.com';
}

if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'uploadContractDoc') {
    // Expected fields: contract_id, doc_type, email (for auth), file
    $contractId = $_POST['contract_id'] ?? null;
    $docType = $_POST['doc_type'] ?? null; // Bon de livraison, Factures, PV, Autres
    $email = $_POST['email'] ?? null;

    if (!$contractId || !$docType || !$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing parameters']);
        exit;
    }
    if (!isLogisticsUser($email)) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
    if (!isset($_FILES['file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'No file uploaded']);
        exit;
    }
    $uploadDir = __DIR__ . "/uploads/contracts/{$contractId}/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    $originalName = basename($_FILES['file']['name']);
    $targetPath = $uploadDir . $originalName;
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        // Store metadata (simple JSON file) for later retrieval
        $metaFile = $uploadDir . "metadata.json";
        $meta = [];
        if (file_exists($metaFile)) {
            $meta = json_decode(file_get_contents($metaFile), true) ?? [];
        }
        $meta[] = [
            'filename' => $originalName,
            'doc_type' => $docType,
            'uploaded_at' => date('c')
        ];
        file_put_contents($metaFile, json_encode($meta, JSON_PRETTY_PRINT));
        echo json_encode(['status' => 'success', 'message' => 'File uploaded']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to move uploaded file']);
    }
    exit;
}

if ($method === 'GET' && isset($_GET['action']) && $_GET['action'] === 'listContractDocs') {
    $contractId = $_GET['contract_id'] ?? null;
    if (!$contractId) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing contract_id']);
        exit;
    }
    $uploadDir = __DIR__ . "/uploads/contracts/{$contractId}/";
    $metaFile = $uploadDir . "metadata.json";
    if (file_exists($metaFile)) {
        $meta = json_decode(file_get_contents($metaFile), true) ?? [];
        echo json_encode(['documents' => $meta]);
    } else {
        echo json_encode(['documents' => []]);
    }
    exit;
}

// Default response for unsupported actions
http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
?>
