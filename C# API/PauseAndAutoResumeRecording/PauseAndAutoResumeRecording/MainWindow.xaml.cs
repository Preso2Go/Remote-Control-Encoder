using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.Net;
using System.IO;
using System.Web;
using System.Web.Script.Serialization;
using System.Configuration;
using System.Security.Cryptography;

namespace PauseAndAutoResumeRecording
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        //Variables used in this application that are able to be user by any function.
        private static int minutespause = 15;
        private static System.Timers.Timer aTimer;
        WebClient client = new WebClient();
        private string ip;
        private string password;
        private bool timeron = false;

        //Initialisation of the application window that will only be called once at the beginning of the application.
        public MainWindow()
        {
            InitializeComponent();

            //Initializing all the items in the dropdown menu.
            for (int i = 1; i <= 15; i++)
            {
                string comboboxvalue;
                if (i != 1) comboboxvalue = (i + " minutes");
                else comboboxvalue = (i + " minute");

                cobxNrMinutes.Items.Add(comboboxvalue);
            }

            //The standard selected item in the dropdown is number 14 which is "15 minutes". This is because it starts at 0!
            cobxNrMinutes.SelectedIndex = 14;


            //TODO: Check if the login credentials from the last login which are saved, still valid, if not. Login!
            string rawlogindata = ReadFromFile(System.Environment.GetEnvironmentVariable("USERPROFILE")+"/AppData/Local/rmcp2gold.p2god");
            if (rawlogindata != null && rawlogindata != "")
            {
                try
                {
                    rawlogindata = rawlogindata.Replace(System.Environment.NewLine, "");
                    Console.WriteLine(rawlogindata);
                    string[] rawlogin = rawlogindata.Split(' ');
                    string ipf = rawlogin[0].Split('=')[1];
                    string passwordf = rawlogin[1].Split('=')[1];

                    if (ipf != null && passwordf != null)
                    {
                        ip = ipf;
                        txtip.Text = ipf;
                        password = passwordf;
                        txtpassword.Password = passwordf;

                        Login("The login credentials from your last login are no longer valid!\nPlease try logging back in again.", true);
                    }
                }
                catch
                {
                    Console.WriteLine("The save file has been corrupted! Please login!");
                }
            }
        }


        //When the user selects a different number of minutes in this software.
        private void cobxNrMinutes_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            //Has to be +1, because the selectedindex starts at 0!
            minutespause = cobxNrMinutes.SelectedIndex+1;
        }

        //When the user clicks on the pause / resume button in this software.
        private void btnPauseResume_Click(object sender, RoutedEventArgs e)
        {
            string recstatus = getRecordingStatusEncoder();
            Console.WriteLine(recstatus);
            
            if (recstatus == "Recording  (Paused) ")
            {
                if(aTimer != null) aTimer.Dispose();
                pressPauseResumeBtn();

            }
            else if(recstatus == "Recording ")
            {
                pressPauseResumeBtn();

                Console.WriteLine("Timer Started!");
                timeron = true;
                aTimer = new System.Timers.Timer();
                aTimer.Interval = (minutespause*(60*1000)); //minutespause in miliseconds
                aTimer.Elapsed += OnTimedEvent;
                aTimer.AutoReset = false;
                aTimer.Start();
            }
            else if (recstatus == "Idle")
            {
                MessageBox.Show("You are currently not recording. \nYou have to start a recording session before you pause it!", 
                                    "Oops...", 
                                    MessageBoxButton.OK, 
                                    MessageBoxImage.Exclamation);
            }
            else if (recstatus == "Live")
            {
                MessageBox.Show("You are currently live! \nYou can't pause the recording while you're live!", 
                                    "Oops...", 
                                    MessageBoxButton.OK, 
                                    MessageBoxImage.Exclamation);
            }
        }


        // When the specified time is over, this function will be called.
        private void OnTimedEvent(Object source, System.Timers.ElapsedEventArgs e)
        {
            if (getRecordingStatusEncoder() == "Recording  (Paused) ")
            {
                aTimer.Dispose();
                timeron = false;
                Console.WriteLine("Timer Stoped!");

                pressPauseResumeBtn();
            }
        }
 
        //Sends a request to the encoder and returns the state of the recording. 
        private string getRecordingStatusEncoder()
        {
            try {
                WebRequest request = WebRequest.Create("http://" + ip + "?action=info&actionDetail=status&user=presentations2go&password=" + password + "&sessionId=" + getSessionId());
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

                return json["configurations"][0]["value"];
            }
            catch
            {
                MessageBox.Show("ERROR: An error occured while trying to connect to the encoder!\nPlease try loggin back in again!\nIf that does not help,please check your internet connection and the internet connection of the encoder!", 
                                    "Error", 
                                    MessageBoxButton.OK, 
                                    MessageBoxImage.Warning);
                ChangeVisibility(Visibility.Visible);
                return null;
            }

        }
        //Presses the Record / Pause / Resume button in the encoder. 
        private void pressPauseResumeBtn()
        {
            try
            {
                WebRequest request = WebRequest.Create("http://" + ip + "?action=sendcommand&actionDetail=Startpause&user=presentations2go&password=" + password + "&sessionId=" + getSessionId());
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

                if (btnPauseResume.Content == FindResource("Resume")) btnPauseResume.Content = FindResource("Pause");
                else btnPauseResume.Content = FindResource("Resume");
            }
            catch
            {
                MessageBox.Show("ERROR: An error occured while trying to connect to the encoder!\nPlease try loggin back in again!\nIf that does not help,please check your internet connection and the internet connection of the encoder!", 
                                    "Error", 
                                    MessageBoxButton.OK, 
                                    MessageBoxImage.Warning);
                ChangeVisibility(Visibility.Visible);
            }
            
        }
        //Returns a new valid sessionId. This has to be done when trying to doing something in the encoder with the API.
        private string getSessionId(bool login = false)
        {
            try {
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
                if (login)
                {
                    try{
                        return json["errorMessage"];
                    }
                    catch (System.Collections.Generic.KeyNotFoundException){
                        return json["sessionId"];
                    }
                }
                else return json["sessionId"];
            }
            catch
            {
                MessageBox.Show("ERROR: An error occured while trying to connect to the encoder!\nPlease try loggin back in again!\nIf that does not help, please check your internet connection and the internet connection of the encoder!", 
                                    "Error", 
                                    MessageBoxButton.OK, 
                                    MessageBoxImage.Warning);
                ChangeVisibility(Visibility.Visible);
                return null;
            }

        }

        //Gets called when the value in the ip field is changed of login.
        private void txtip_TextChanged(object sender, TextChangedEventArgs e)
        {
            if(txtip.Text != "" && txtpassword.Password != "") btnLogin.IsEnabled = true;
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
        private void Login(string errmsg, bool init = false)
        {
            string returnvalue = getSessionId(true);
            if (returnvalue == "Invalid credential.")
            {
                MessageBox.Show(errmsg, 
                                    "Invalid Credentials", 
                                    MessageBoxButton.OK, 
                                    MessageBoxImage.Error);
            }
            else if (returnvalue != null)
            {
                string recstatus = getRecordingStatusEncoder();

                if (recstatus == "Recording  (Paused) ")
                {
                    btnPauseResume.Content = FindResource("Resume");
                }
                else if (recstatus == "Recording ")
                {
                    btnPauseResume.Content = FindResource("Pause");
                }else if (recstatus == "Idle") btnPauseResume.Content = FindResource("Pause");
                else if (recstatus == "Live") btnPauseResume.Content = FindResource("Pause");

                ChangeVisibility(Visibility.Hidden);
                if (init)
                {
                    MessageBox.Show("You logged in on IP: " + ip + ",\nIf you want to log onto a different ip, Click the logout button!",
                                        "Logged in!",
                                        MessageBoxButton.OK,
                                        MessageBoxImage.Information);
                }

                if (recstatus == "Idle")
                {
                    MessageBox.Show("The recorder is not recording. You will have to start a recoding before you can pause it!",
                                        "Not recording!",
                                        MessageBoxButton.OK,
                                        MessageBoxImage.Warning);
                }
                else if (recstatus == "Live")
                {
                    btnPauseResume.IsEnabled = false;
                    MessageBox.Show("The recorder is live. You won't be able to pause the recording while you're live! Please restart this application when you stoped the live session!",
                                        "You're live!",
                                        MessageBoxButton.OK,
                                        MessageBoxImage.Error);
                }

                //|\/\/\/\/\/\/\/\/\/|\\
                WriteToFile(System.Environment.GetEnvironmentVariable("USERPROFILE") + "/AppData/Local/rmcp2gold.p2god", (("ip=" + ip) + (" password=" + password)));
            }
        }
        //Function that switches between the login and pause screen. 
        private void ChangeVisibility(Visibility visibil)
        {
            btnLogin.Visibility = visibil;
            txtTlogin.Visibility = visibil;
            txtTip.Visibility = visibil;
            txtTpassword.Visibility = visibil;
            txtip.Visibility = visibil;
            txtpassword.Visibility = visibil;

            if (visibil == Visibility.Hidden) visibil = Visibility.Visible;
            else visibil = Visibility.Hidden;

            txtpausemin.Visibility = visibil;
            cobxNrMinutes.Visibility = visibil;
            btnPauseResume.Visibility = visibil;
            btnLogout.Visibility = visibil;
        }
        //When the logout button is pressed, the user will see the login information.
        private void btnLogout_Click(object sender, RoutedEventArgs e)
        {
            if (timeron)
            {
                MessageBoxResult result = MessageBox.Show("Are you sure you want to logout while you pause the recording? This will mean the timer is deleted and the recording won't start automatically anymore!!",
                                                            "Logout while paused?",
                                                            MessageBoxButton.YesNo,
                                                            MessageBoxImage.Warning);
                if(result == MessageBoxResult.Yes)
                {
                    aTimer.Dispose();
                    ChangeVisibility(Visibility.Visible);
                }
            }
        }


        //Writes data to the file in the specified filepath and writes the value specified. If the file does not exist, it creates the file and write the value to it. 
        public void WriteToFile(string filePath, string value)
        {
            string encodedvalue = Encrypt(value);
            if (!File.Exists(filePath))
            {
                using (StreamWriter sw = new StreamWriter(filePath, false))
                {
                    sw.WriteLine(encodedvalue);
                    sw.Close();
                }
            }
            else if (File.Exists(filePath))
            {
                using (StreamWriter sw = new StreamWriter(filePath, false))
                {
                    sw.WriteLine(encodedvalue);
                    sw.Close();
                }
            }
        }
        //Returns data from the file at the specified file path.
        public string ReadFromFile(string filePath)
        {
            try
            {
                if (File.Exists(filePath))
                {
                    string encodedfilevalue = File.ReadAllText(@filePath);
                    return Decrypt(encodedfilevalue);
                }
                return null;
            }
            catch
            {
                return null;
            }
        }

        //When the application is tried to be closed and the user had pressed the pause button and so the timer is on, it asks if you are sure if you want to close the application. 
        private void CloseBtnEvent(object sender, System.ComponentModel.CancelEventArgs e)
        {
            if (timeron)
            {
                MessageBoxResult result = MessageBox.Show("Are you sure you want to close this application while you pause the recording? This will mean the timer is deleted and the recording won't start automatically anymore!!",
                                                            "Close while paused?",
                                                            MessageBoxButton.YesNo,
                                                            MessageBoxImage.Warning);
                e.Cancel = (result == MessageBoxResult.No);
            }
        }

        // Encryption of the ip and password used in the application. |\/\/\/\/\/|
        // This constant string is used as a "salt" value for the PasswordDeriveBytes function calls.
        // This size of the IV (in bytes) must = (keysize / 8).  Default keysize is 256, so the IV must be
        // 32 bytes long.  Using a 16 character string here gives us 32 bytes when converted to a byte array.
        private static readonly byte[] initVectorBytes = Encoding.ASCII.GetBytes("_!_!_P2GOP!w_!_@");

        // This constant is used to determine the keysize of the encryption algorithm.
        private const int keysize = 256;

        //Encrypt playText with the passPhrase password.
        private static string Encrypt(string plainText, string passPhrase = "Pr3s3ntAtions2GOEncr1pt1onP@sswordWh1chIsV3ryStr0ngC@nYouSeeThat?")
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

        //Decrypt cipherText with the passPhrase password.
        private static string Decrypt(string cipherText, string passPhrase = "Pr3s3ntAtions2GOEncr1pt1onP@sswordWh1chIsV3ryStr0ngC@nYouSeeThat?")
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
    }
}
