<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'koneksi.php';

$action = $_GET['action'] ?? '';

// ── GET semua tanaman (basic) ────────────────────────────────
if ($action === 'getTanaman') {
    $res  = mysqli_query($conn, "SELECT * FROM tanaman ORDER BY id ASC");
    $data = [];
    while ($row = mysqli_fetch_assoc($res)) $data[] = $row;
    echo json_encode($data);
}

// ── GET data SAW (join penjualan & permintaan) ───────────────
// C1 = total jumlah_terjual          → Benefit
// C2 = total jumlah_permintaan       → Benefit
// C3 = stok_sekarang                 → Cost
// C4 = stok_sekarang / (C1/28)       → Cost (estimasi hari habis)
//      28 = jumlah hari 1 bulan (4 minggu x 7 hari)
elseif ($action === 'getSAWData') {
    $sql = "
        SELECT
            t.id,
            t.nama_tanaman,
            t.harga,
            t.stok_sekarang                         AS stok,
            COALESCE(p.total_terjual, 0)            AS c1_frekuensi,
            COALESCE(pm.total_permintaan, 0)        AS c2_minat,
            t.stok_sekarang                         AS c3_sisa_stok,
            CASE
                WHEN COALESCE(p.total_terjual, 0) = 0 THEN 999
                ELSE ROUND(
                    t.stok_sekarang / (COALESCE(p.total_terjual, 0) / 28), 0
                )
            END                                     AS c4_kecepatan
        FROM tanaman t
        LEFT JOIN (
            SELECT tanaman_id, SUM(jumlah_terjual) AS total_terjual
            FROM penjualan
            GROUP BY tanaman_id
        ) p ON p.tanaman_id = t.id
        LEFT JOIN (
            SELECT tanaman_id, SUM(jumlah_permintaan) AS total_permintaan
            FROM permintaan
            GROUP BY tanaman_id
        ) pm ON pm.tanaman_id = t.id
        ORDER BY t.id
    ";
    $res  = mysqli_query($conn, $sql);
    $data = [];
    while ($row = mysqli_fetch_assoc($res)) $data[] = $row;
    echo json_encode($data);
}

// ── TAMBAH tanaman baru ──────────────────────────────────────
elseif ($action === 'addTanaman') {
    $body = json_decode(file_get_contents("php://input"), true);

    $stmt = mysqli_prepare($conn,
        "INSERT INTO tanaman
        (nama_tanaman, harga, stok_awal, stok_sekarang, tanggal_input)
        VALUES (?, ?, ?, ?, NOW())");

    mysqli_stmt_bind_param(
        $stmt,
        "siii",
        $body['nama_tanaman'],
        $body['harga'],
        $body['stok_awal'],
        $body['stok_sekarang']
    );

    mysqli_stmt_execute($stmt);

    $tanaman_id = mysqli_insert_id($conn);

    // Data default penjualan
    mysqli_query($conn,"
        INSERT INTO penjualan
        (tanaman_id, minggu_ke, tanggal_mulai, jumlah_terjual, tanggal_input)
        VALUES
        ($tanaman_id,1,'2025-01-01',1,NOW()),
        ($tanaman_id,2,'2025-01-08',1,NOW()),
        ($tanaman_id,3,'2025-01-15',1,NOW()),
        ($tanaman_id,4,'2025-01-22',1,NOW())
    ");

    // Data default permintaan
    mysqli_query($conn,"
        INSERT INTO permintaan
        (tanaman_id, minggu_ke, tanggal_mulai, jumlah_permintaan, tanggal_input)
        VALUES
        ($tanaman_id,1,'2025-01-01',1,NOW()),
        ($tanaman_id,2,'2025-01-08',1,NOW()),
        ($tanaman_id,3,'2025-01-15',1,NOW()),
        ($tanaman_id,4,'2025-01-22',1,NOW())
    ");

    echo json_encode([
        "ok" => true,
        "id" => $tanaman_id
    ]);
}

// ── UPDATE tanaman ───────────────────────────────────────────
elseif ($action === 'updateTanaman') {
    $body = json_decode(file_get_contents("php://input"), true);
    $stmt = mysqli_prepare($conn,
        "UPDATE tanaman SET nama_tanaman=?, harga=?, stok_awal=?, stok_sekarang=?
         WHERE id=?");
    mysqli_stmt_bind_param($stmt, "siiii",
        $body['nama_tanaman'], $body['harga'],
        $body['stok_awal'], $body['stok_sekarang'],
        $body['id']);
    mysqli_stmt_execute($stmt);
    echo json_encode(["ok" => true]);
}

// ── HAPUS tanaman ────────────────────────────────────────────
elseif ($action === 'deleteTanaman') {
    $id = intval($_GET['id']);
    mysqli_query($conn, "DELETE FROM tanaman WHERE id=$id");
    echo json_encode(["ok" => true]);
}

else {
    http_response_code(400);
    echo json_encode(["error" => "Action tidak dikenal"]);
}
