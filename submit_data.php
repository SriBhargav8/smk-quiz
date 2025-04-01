<?php
// Database credentials
$host = "localhost"; // or your database host
$username = "u106808092_quiz_leads";  // your database username
$password = "Amayra#0786";      // your database password
$dbname = "u106808092_quiz_leads"; // your database name

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Capture data from the POST request
$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$company = $_POST['company'];
$result = $_POST['result'];

// Prepare and bind statement to prevent SQL injection
$stmt = $conn->prepare("INSERT INTO submissions (name, email, phone, company, result) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $name, $email, $phone, $company, $result);

// Execute the statement
if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Data saved successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to save data']);
}

// Close the connection
$stmt->close();
$conn->close();
?>
