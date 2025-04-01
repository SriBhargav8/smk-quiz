<?php
$host = "localhost"; // or your database host
$username = "u106808092_quiz_leads";  // your database username
$password = "Amayra#0786";      // your database password
$dbname = "u106808092_quiz_leads"; // your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Capture form data
$name = $_POST['name'];
$email = $_POST['email'];
$phone = $_POST['phone'];
$company = $_POST['company'];
$result = $_POST['result'];  // Result can be 'Correct' or 'Wrong'

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO submissions (name, email, phone, company, result) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $name, $email, $phone, $company, $result);

// Execute the statement
if ($stmt->execute()) {
    echo "New record created successfully";
} else {
    echo "Error: " . $stmt->error;
}

// Close connection
$stmt->close();
$conn->close();
?>

// Close the connection
$stmt->close();
$conn->close();
?>
