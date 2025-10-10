<?php 
if(isset($_POST['submit'])){
    $name = $_POST['name'];
    $email = $_POST['email'];
    $message = $_POST['message'];
    $phone = $_POST['phone'];
    $to = 'girishiacm@gmail.com';

    $body = 'Name:'.$name.',
            Email:'.$email.',
            Message:'.$message.',
            Phone:'.$phone.'';
    
    $headers = "From :".$name." <".$email.">\r\n";
    $headers."Reply-To :".$email."\r\n";
    $headers."MIME-Version : 1.0\r\n";
    $headers."Content-type: text/html ; charset-utf-8";

    $send = mail($to,$headers,$body);
    if($send){
        
        echo "<script>
                    alert('Mail has been sent Successfully.');
                    window.location.href = 'https://abaris.vercel.app/contact-us.html';
                </script>";
           
                
    }else{
        echo "<script>
                    alert('EMAIL FAILED');
                </script>";
    }
}
?>