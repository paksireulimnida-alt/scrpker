<?php
try {
    $pdo = new PDO("mysql:host=localhost;dbname=medankerja;charset=utf8mb4", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("SET FOREIGN_KEY_CHECKS=0;
    TRUNCATE TABLE applications;
    TRUNCATE TABLE bookmarks;
    TRUNCATE TABLE job_questions;
    TRUNCATE TABLE jobs;
    SET FOREIGN_KEY_CHECKS=1;");
    echo "Jobs and related tables truncated successfully.\n";
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
?>
