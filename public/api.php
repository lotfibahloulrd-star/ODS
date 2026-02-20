<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Dossiers de stockage
$DATA_FILE = 'data_ods_shared.json';
$UPLOAD_DIR = 'uploads_ods/';

// Tentative de création du dossier avec des permissions robustes
if (!file_exists($UPLOAD_DIR)) {
    if (!mkdir($UPLOAD_DIR, 0755, true)) {
        // Si mkdir échoue, on tente 0777 au cas où
        mkdir($UPLOAD_DIR, 0777, true);
    }
    // Créer un index.html vide pour la sécurité
    file_put_contents($UPLOAD_DIR . 'index.html', '');
}

// S'assurer que le dossier est accessible en écriture
if (file_exists($UPLOAD_DIR) && !is_writable($UPLOAD_DIR)) {
    @chmod($UPLOAD_DIR, 0755);
}

// Initialiser le fichier de données s'il n'existe pas
if (!file_exists($DATA_FILE)) {
    file_put_contents($DATA_FILE, json_encode([]));
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// --- ACTIONS ---

if ($action === 'get_orders') {
    $data = @file_get_contents($DATA_FILE);
    echo $data ? $data : json_encode([]);
    exit;
}

if ($action === 'get_deleted_ids') {
    $file = 'deleted_ods_ids.json';
    if (file_exists($file)) {
        echo file_get_contents($file);
    } else {
        echo json_encode([]);
    }
    exit;
}

if ($action === 'save_deleted_ids' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        file_put_contents('deleted_ods_ids.json', $input);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false]);
    }
    exit;
}

if ($action === 'save_orders' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $data = json_decode($input, true);
        if ($data !== null) {
            file_put_contents($DATA_FILE, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No data received']);
    }
    exit;
}

if ($action === 'upload_file' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $orderId = $_POST['orderId'] ?? '';
    $storageKey = $_POST['storageKey'] ?? '';
    $fileName = $_POST['fileName'] ?? '';
    
    if ($orderId && $storageKey) {
        if (!isset($_FILES['file'])) {
            echo json_encode(['success' => false, 'message' => 'No file uploaded']);
            exit;
        }

        if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $errCodes = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize in php.ini',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE in HTML form',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload',
            ];
            $msg = $errCodes[$_FILES['file']['error']] ?? 'Unknown upload error';
            echo json_encode(['success' => false, 'message' => $msg]);
            exit;
        }

        $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
        if (!$ext || $ext === 'json') $ext = 'pdf';
        
        $allowed = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];
        if (!in_array($ext, $allowed)) $ext = 'pdf';

        $finalName = $orderId . '_' . $storageKey . '.' . $ext;
        $targetPath = $UPLOAD_DIR . $finalName;
        
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
            @chmod($targetPath, 0644);
            
            // --- Mise à jour atomique du JSON ---
            $fp = @fopen($DATA_FILE, 'r+');
            if ($fp) {
                if (flock($fp, LOCK_EX)) {
                    $content = stream_get_contents($fp);
                    $orders = json_decode($content, true) ?: [];
                    
                    $updated = false;
                    foreach ($orders as &$order) {
                        if ($order['id'] == $orderId) {
                            if (!isset($order['files'])) $order['files'] = [];
                            $order['files'][$storageKey] = [
                                'exists' => true,
                                'name' => $fileName,
                                'at' => date('c'),
                                'ext' => $ext
                            ];
                            $updated = true;
                            break;
                        }
                    }
                    
                    if ($updated) {
                        ftruncate($fp, 0);
                        rewind($fp);
                        fwrite($fp, json_encode($orders, JSON_PRETTY_PRINT));
                    }
                    flock($fp, LOCK_UN);
                }
                fclose($fp);
            }
            
            echo json_encode([
                'success' => true, 
                'url' => $targetPath,
                'fileName' => $fileName,
                'path' => $finalName
            ]);
        } else {
            $dirExists = file_exists($UPLOAD_DIR) ? 'Exists' : 'Not Found';
            $dirWritable = is_writable($UPLOAD_DIR) ? 'Writable' : 'Not Writable';
            echo json_encode([
                'success' => false, 
                'message' => "Move failed. Folder: $dirExists, $dirWritable. Check permissions on $UPLOAD_DIR"
            ]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing data']);
    }
    exit;
}

if ($action === 'get_file') {
    $orderId = $_GET['orderId'] ?? '';
    $storageKey = $_GET['storageKey'] ?? '';
    
    if (!$orderId || !$storageKey) {
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants']);
        exit;
    }

    // On cherche les extensions possibles
    $extensions = ['pdf', 'jpg', 'png', 'jpeg', 'webp'];
    foreach ($extensions as $ext) {
        $path = $UPLOAD_DIR . $orderId . '_' . $storageKey . '.' . $ext;
        if (file_exists($path)) {
            $mime = 'application/octet-stream';
            if ($ext === 'pdf') $mime = 'application/pdf';
            elseif (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) $mime = 'image/' . ($ext === 'jpg' ? 'jpeg' : $ext);

            header("Content-Type: " . $mime);
            header("Content-Length: " . filesize($path));
            header("Content-Disposition: inline; filename=\"" . basename($path) . "\"");
            readfile($path);
            exit;
        }
    }
    
    http_response_code(404);
    echo json_encode([
        'success' => false, 
        'message' => 'file not found',
        'debug' => [
            'orderId' => $orderId,
            'storageKey' => $storageKey,
            'searched_in' => $UPLOAD_DIR,
            'server_time' => date('Y-m-d H:i:s')
        ]
    ]);
    exit;
}

if ($action === 'diag') {
    echo json_encode([
        'upload_dir' => $UPLOAD_DIR,
        'exists' => file_exists($UPLOAD_DIR),
        'writable' => is_writable($UPLOAD_DIR),
        'perms' => substr(sprintf('%o', fileperms($UPLOAD_DIR)), -4),
        'data_file_writable' => is_writable($DATA_FILE),
        'php_version' => phpversion(),
        'files_count' => file_exists($UPLOAD_DIR) ? count(scandir($UPLOAD_DIR)) - 2 : 0
    ]);
    exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action']);
?>
