<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Dossiers de stockage
$DATA_FILE = 'data_ods_shared.json';
$MESSAGES_FILE = 'data_messages_shared.json';
$LOGS_FILE = 'data_logs_shared.json';
$TENDERS_FILE = 'data_tenders_shared.json';
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
if (!file_exists($MESSAGES_FILE)) {
    file_put_contents($MESSAGES_FILE, json_encode([]));
}
if (!file_exists($LOGS_FILE)) {
    file_put_contents($LOGS_FILE, json_encode([]));
}
if (!file_exists($TENDERS_FILE)) {
    file_put_contents($TENDERS_FILE, json_encode([]));
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

if ($action === 'get_messages') {
    $data = @file_get_contents($MESSAGES_FILE);
    echo $data ? $data : json_encode([]);
    exit;
}

if ($action === 'save_messages' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $data = json_decode($input, true);
        if ($data !== null) {
            file_put_contents($MESSAGES_FILE, json_encode($data, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No data received']);
    }
    exit;
}

if ($action === 'get_logs') {
    $data = @file_get_contents($LOGS_FILE);
    echo $data ? $data : json_encode([]);
    exit;
}

if ($action === 'save_log' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $newEvent = json_decode($input, true);
        if ($newEvent !== null) {
            $logs = json_decode(file_get_contents($LOGS_FILE), true);
            if (!is_array($logs)) $logs = [];
            
            // Add unique ID and timestamp if not provided
            if (!isset($newEvent['id'])) $newEvent['id'] = time() . '_' . uniqid();
            if (!isset($newEvent['timestamp'])) $newEvent['timestamp'] = date('c');
            
            array_unshift($logs, $newEvent);
            // Keep last 500 events
            $logs = array_slice($logs, 0, 500);
            
            file_put_contents($LOGS_FILE, json_encode($logs, JSON_PRETTY_PRINT));
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid JSON']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'No data received']);
    }
    exit;
}

if ($action === 'get_tenders') {
    $data = @file_get_contents($TENDERS_FILE);
    echo $data ? $data : json_encode([]);
    exit;
}

if ($action === 'save_tenders' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    if ($input) {
        $data = json_decode($input, true);
        if ($data !== null) {
            file_put_contents($TENDERS_FILE, json_encode($data, JSON_PRETTY_PRINT));
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
    $type = $_POST['type'] ?? 'ods'; // 'ods' ou 'tender'
    
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
        
        $allowed = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xlsx', 'xls', 'docx', 'doc'];
        if (!in_array($ext, $allowed)) $ext = 'pdf';

        $prefix = ($type === 'tender') ? 'tender_' : '';
        $finalName = $prefix . $orderId . '_' . $storageKey . '.' . $ext;
        $targetPath = $UPLOAD_DIR . $finalName;
        
        if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
            @chmod($targetPath, 0644);
            
            // --- Mise à jour atomique du JSON concerné ---
            $targetJson = ($type === 'tender') ? $TENDERS_FILE : $DATA_FILE;
            $fp = @fopen($targetJson, 'r+');
            if ($fp) {
                if (flock($fp, LOCK_EX)) {
                    $content = stream_get_contents($fp);
                    $items = json_decode($content, true) ?: [];
                    
                    $updated = false;
                    foreach ($items as &$item) {
                        if ($item['id'] == $orderId) {
                            if (!isset($item['files'])) $item['files'] = [];
                            $item['files'][$storageKey] = [
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
                        fwrite($fp, json_encode($items, JSON_PRETTY_PRINT));
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
            echo json_encode(['success' => false, 'message' => "Move failed."]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Missing data']);
    }
    exit;
}

if ($action === 'get_file') {
    $orderId = $_GET['orderId'] ?? '';
    $storageKey = $_GET['storageKey'] ?? '';
    $type = $_GET['type'] ?? 'ods';
    
    if (!$orderId || !$storageKey) {
        echo json_encode(['success' => false, 'message' => 'Paramètres manquants']);
        exit;
    }

    $prefix = ($type === 'tender') ? 'tender_' : '';
    $extensions = ['pdf', 'jpg', 'png', 'jpeg', 'webp', 'xlsx', 'xls', 'docx', 'doc'];
    foreach ($extensions as $ext) {
        $path = $UPLOAD_DIR . $prefix . $orderId . '_' . $storageKey . '.' . $ext;
        if (file_exists($path)) {
            $mime = 'application/octet-stream';
            if ($ext === 'pdf') $mime = 'application/pdf';
            elseif (in_array($ext, ['jpg', 'jpeg', 'png', 'webp'])) $mime = 'image/' . ($ext === 'jpg' ? 'jpeg' : $ext);
            elseif (in_array($ext, ['xlsx', 'xls'])) $mime = 'application/vnd.ms-excel';

            header("Content-Type: " . $mime);
            header("Content-Length: " . filesize($path));
            header("Content-Disposition: inline; filename=\"" . basename($path) . "\"");
            readfile($path);
            exit;
        }
    }
    
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'file not found']);
    exit;
}

if ($action === 'list_files') {
    $files = [];
    if (file_exists($UPLOAD_DIR)) {
        $files = array_values(array_filter(scandir($UPLOAD_DIR), function($f) {
            return $f !== '.' && $f !== '..' && $f !== 'index.html';
        }));
    }
    echo json_encode(['success' => true, 'files' => $files]);
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
