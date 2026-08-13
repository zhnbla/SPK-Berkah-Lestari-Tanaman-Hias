<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "db_tanaman_hias";

$conn = mysqli_connect($host, $user, $pass, $db);
if (!$conn) {
    die(json_encode(["error" => mysqli_connect_error()]));
}
mysqli_set_charset($conn, "utf8");
?>
