using System;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Net;
using System.IO;
using System.Web.Script.Serialization;
using System.Security.Cryptography;

namespace PauseAndAutoResumeRecording
{
    /// <summary>
    /// Interaction logic for login.xaml
    /// </summary>
    public partial class login : Window
    {
        private string ip;
        private string password;

        //Initialiser at the start of the application and will try to login with the last data.
        public login()
        {
            InitializeComponent();

            //Decrypt the login data and tries to login with that data.
            string defaultip = Decrypt(Properties.Settings.Default.Ip);
            string defaultpassword = Decrypt(Properties.Settings.Default.Password);
            if (defaultip != null && defaultpassword != null)
            {
                ip = defaultip;
                txtip.Text = ip;
                password = defaultpassword;
                txtpassword.Password = password;
                Login("Your last login credentials are no longer valid! Please login again.");
            }
        }
        //Intialises the screen and fills ip and password field. This is called from the logout button.
        public login(bool login)
        {
            InitializeComponent();
            if (!login)
            {
                //Decrypt the login data and tries to login with that data.
                string defaultip = Decrypt(Properties.Settings.Default.Ip);
                string defaultpassword = Decrypt(Properties.Settings.Default.Password);
                if (defaultip != null && defaultpassword != null)
                {
                    ip = defaultip;
                    txtip.Text = ip;
                    password = defaultpassword;
                    txtpassword.Password = password;
                }
            }
        }

        //Gets called when the value in the ip field is changed of login.
        private void txtip_TextChanged(object sender, TextChangedEventArgs e)
        {
            if (txtip.Text != "" && txtpassword.Password != "") btnLogin.IsEnabled = true;
            else btnLogin.IsEnabled = false;
        }
        //Gets called when the value in the password field is changed of login.
        private void txtpassword_TextChanged(object sender, RoutedEventArgs e)
        {
            if (txtip.Text != "" && txtpassword.Password != "") btnLogin.IsEnabled = true;
            else btnLogin.IsEnabled = false;
        }

        //Gets called when the login button is pressed.
        private void btnLogin_Click(object sender, RoutedEventArgs e)
        {
            ip = txtip.Text;
            password = txtpassword.Password;
            Login("ERROR: Invalid Credentials!\nPlease Retry");
        }

        //Function that tries to login.
        private void Login(string errmsg)
        {
            string returnvalue = getSessionId();
            if (returnvalue == "Invalid credential.")
            {
                MessageBox.Show(errmsg,
                                    "Invalid Credentials",
                                    MessageBoxButton.OK,
                                    MessageBoxImage.Error);
            }
            else if (returnvalue != null)
            {
                //Encrypts the login data and saves it in the configuration file.
                string ipencrypted = Encrypt(ip);
                if (ipencrypted != null) Properties.Settings.Default.Ip = ipencrypted;
                string passwordencrypted = Encrypt(password);
                if (passwordencrypted != null) Properties.Settings.Default.Password = passwordencrypted;
                Properties.Settings.Default.Save();
                
                MainWindow controller = new MainWindow();
                controller.Show();
                this.Close();
            }
        }

        //Get a new sessionId
        private string getSessionId()
        {
            try
            {
                WebRequest request = WebRequest.Create("http://" + ip + "?action=sendcommand&actiondetail=initializeremotecontrol&user=presentations2go&password=" + password);
                request.Credentials = new NetworkCredential(" ", " ");

                HttpWebResponse response = (HttpWebResponse)request.GetResponse();
                Stream dataStream = response.GetResponseStream();
                StreamReader reader = new StreamReader(dataStream);
                string responseFromServer = reader.ReadToEnd();
                var serializer = new JavaScriptSerializer();
                var json = serializer.Deserialize<dynamic>(responseFromServer);
                reader.Close();
                dataStream.Close();
                response.Close();
                try
                {
                    return json["errorMessage"];
                }
                catch (System.Collections.Generic.KeyNotFoundException)
                {
                    return json["sessionId"];
                }
            }
            catch
            {
                MessageBox.Show("2 ERROR: An error occured while trying to connect to the encoder!\nPlease try loggin back in again!\nIf that does not help, please check your internet connection and the internet connection of the encoder!",
                                    "Error",
                                    MessageBoxButton.OK,
                                    MessageBoxImage.Warning);
                Console.WriteLine(ip + " : " + password);
                return null;
            }

        }

        // Encryption of the ip and password used in the application.
        // This constant string is used as a "salt" value for the PasswordDeriveBytes function calls.
        // This size of the IV (in bytes) must = (keysize / 8).  Default keysize is 256, so the IV must be
        // 32 bytes long.  Using a 16 character string here gives us 32 bytes when converted to a byte array.
        private static readonly byte[] initVectorBytes = Encoding.ASCII.GetBytes("_!_!_P2GOP!w_!_@");

        // This constant is used to determine the keysize of the encryption algorithm.
        private const int keysize = 256;
        //Encrypt playText with the passPhrase password.
        private static string Encrypt(string plainText, string passPhrase = "Pr3s3ntAtions2GOEncr1pt1onP@sswordWh1chIsV3ryStr0ngC@nYouSeeThat?")
        {
            try
            {
                byte[] plainTextBytes = Encoding.UTF8.GetBytes(plainText);
                using (PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null))
                {
                    byte[] keyBytes = password.GetBytes(keysize / 8);
                    using (RijndaelManaged symmetricKey = new RijndaelManaged())
                    {
                        symmetricKey.Mode = CipherMode.CBC;
                        using (ICryptoTransform encryptor = symmetricKey.CreateEncryptor(keyBytes, initVectorBytes))
                        {
                            using (MemoryStream memoryStream = new MemoryStream())
                            {
                                using (CryptoStream cryptoStream = new CryptoStream(memoryStream, encryptor, CryptoStreamMode.Write))
                                {
                                    cryptoStream.Write(plainTextBytes, 0, plainTextBytes.Length);
                                    cryptoStream.FlushFinalBlock();
                                    byte[] cipherTextBytes = memoryStream.ToArray();
                                    return Convert.ToBase64String(cipherTextBytes);
                                }
                            }
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        //Decrypt cipherText with the passPhrase password.
        private static string Decrypt(string cipherText, string passPhrase = "Pr3s3ntAtions2GOEncr1pt1onP@sswordWh1chIsV3ryStr0ngC@nYouSeeThat?")
        {
            try
            {
                byte[] cipherTextBytes = Convert.FromBase64String(cipherText);
                using (PasswordDeriveBytes password = new PasswordDeriveBytes(passPhrase, null))
                {
                    byte[] keyBytes = password.GetBytes(keysize / 8);
                    using (RijndaelManaged symmetricKey = new RijndaelManaged())
                    {
                        symmetricKey.Mode = CipherMode.CBC;
                        using (ICryptoTransform decryptor = symmetricKey.CreateDecryptor(keyBytes, initVectorBytes))
                        {
                            using (MemoryStream memoryStream = new MemoryStream(cipherTextBytes))
                            {
                                using (CryptoStream cryptoStream = new CryptoStream(memoryStream, decryptor, CryptoStreamMode.Read))
                                {
                                    byte[] plainTextBytes = new byte[cipherTextBytes.Length];
                                    int decryptedByteCount = cryptoStream.Read(plainTextBytes, 0, plainTextBytes.Length);
                                    return Encoding.UTF8.GetString(plainTextBytes, 0, decryptedByteCount);
                                }
                            }
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }
    }
}
