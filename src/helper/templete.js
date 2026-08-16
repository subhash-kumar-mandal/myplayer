function getOtpEmailHtml(otp) {

return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Login Verification</title>
</head>

<body style="margin:0;padding:40px 0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellspacing="0" cellpadding="0">
<tr>
<td align="center">

<table width="560" cellspacing="0" cellpadding="0"
style="background:#ffffff;border-radius:14px;padding:48px;">

<tr>
<td align="center">

<img
src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
width="46"
/>

<h2
style="
margin:18px 0 0;
font-size:30px;
color:#1DB954;
font-weight:700;
">
Music Player
</h2>

</td>
</tr>

<tr>
<td
style="
padding-top:45px;
font-size:17px;
line-height:1.7;
color:#222;
">

Hi,

<br><br>

Enter this code to continue logging in to your account.

</td>
</tr>

<tr>
<td
align="center"
style="padding:38px 0;"
>

<div
style="
font-size:48px;
font-weight:bold;
letter-spacing:10px;
color:#111;
">
${otp}
</div>

</td>
</tr>

<tr>
<td
style="
font-size:15px;
line-height:1.8;
color:#555;
">

This verification code is valid for
<strong>5 minutes</strong> and can only be used once.

<br><br>

If you didn't request this code, you can safely ignore this email.

</td>
</tr>

<tr>
<td
style="
padding-top:45px;
font-size:15px;
color:#222;
">

Best regards,

<br>

<strong>Music Player Team</strong>

</td>
</tr>

<tr>
<td
style="
padding-top:40px;
border-top:1px solid #e5e5e5;
font-size:12px;
color:#888;
text-align:center;
">

© 2026 Music Player

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`
}


module.exports = getOtpEmailHtml